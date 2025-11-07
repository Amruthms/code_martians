import cv2, time, uuid, yaml, requests
import sys
import io

# Set UTF-8 encoding for stdout/stderr to handle emojis
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Load configuration
try:
    with open("config.yaml", "r") as f:
        CFG = yaml.safe_load(f)
except Exception as e:
    print(f"Error loading config.yaml: {e}")
    sys.exit(1)

# Configuration
VIDEO_SOURCE = CFG.get("video_source", 0)
BACKEND = CFG.get("backend_url", "http://localhost:8000")
zones = CFG.get("zones", [])
H = CFG.get("helmet_hsv", {})
V = CFG.get("vest_hsv", {})
H_T = CFG.get("helmet_ratio_thresh", 0.10)
V_T = CFG.get("vest_ratio_thresh", 0.15)
PROX = CFG.get("proximity_pixels", 120)

# Import detection modules
try:
    from detector import detect_persons
    from ppe import roi_slices, crop, mask_ratio_hsv
    from zones import centroid, in_polygon, draw_polygon
except ImportError as e:
    print(f"Error importing modules: {e}")
    print("Creating basic fallback detection...")
    
    # Fallback function if detector modules are missing
    def detect_persons(frame):
        return []
    
    def roi_slices(x, y, w, h):
        return (slice(y, y+h//2), slice(x, x+w)), (slice(y+h//3, y+2*h//3), slice(x, x+w))
    
    def crop(frame, roi):
        return frame[roi]
    
    def mask_ratio_hsv(img, h1, h2, s1, s2, v1, v2):
        return 0.0
    
    def centroid(x, y, w, h):
        return (x + w//2, y + h//2)
    
    def in_polygon(point, polygon):
        return False
    
    def draw_polygon(frame, polygon, color):
        pass

def emit_alert(a_type, meta, frame, box=None, zone=None):
    """Send alert to backend API"""
    try:
        # Save thumbnail
        import os
        os.makedirs("frames", exist_ok=True)
        fname = f"frames/{int(time.time()*1000)}_{uuid.uuid4().hex[:6]}.jpg"
        
        if box:
            x, y, w, h = box
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 0, 255), 2)
        
        cv2.imwrite(fname, frame)
        
        payload = {
            "type": a_type,
            "ts": int(time.time()*1000),
            "zone": zone,
            "frame_path": fname,
            "meta": meta
        }
        
        requests.post(f"{BACKEND}/alerts", json=payload, timeout=1.0)
        print(f"✅ Alert sent: {a_type} - {zone or 'N/A'}")
    except Exception as e:
        print(f"⚠️  Error sending alert: {e}")

def main():
    """Main processing loop"""
    print("=" * 60)
    print("🎥 Starting OpenCV Vision Processing")
    print("=" * 60)
    print(f"Video Source: {VIDEO_SOURCE}")
    print(f"Backend URL: {BACKEND}")
    print(f"Zones configured: {len(zones)}")
    print("=" * 60)
    
    # Open video capture
    cap = cv2.VideoCapture(VIDEO_SOURCE)
    
    if not cap.isOpened():
        print(f"❌ Error: Cannot open video source {VIDEO_SOURCE}")
        print("\nTroubleshooting:")
        print("1. Check if camera is connected")
        print("2. Try different video_source in config.yaml (0, 1, 2, etc.)")
        print("3. Use a video file: video_source: 'path/to/video.mp4'")
        print("4. Use RTSP stream: video_source: 'rtsp://...'")
        sys.exit(1)
    
    print("✅ Video capture initialized successfully")
    print("\n🔍 Starting detection loop... Press Ctrl+C to stop\n")
    
    frame_count = 0
    
    try:
        while True:
            ok, frame = cap.read()
            if not ok:
                print("⚠️  End of video or camera disconnected")
                break
            
            frame_count += 1
            
            # Resize for faster processing
            frame = cv2.resize(frame, (960, int(frame.shape[0]*960/frame.shape[1])))
            
            # Detect persons
            persons = detect_persons(frame)
            centroids = []
            
            # Draw zones
            for z in zones:
                draw_polygon(frame, z.get("polygon", []), (0, 0, 255))
            
            # Process each detected person
            for (x, y, w, h) in persons:
                c = centroid(x, y, w, h)
                centroids.append(((x, y, w, h), c))
                
                # Get ROIs for helmet and vest detection
                head_roi, torso_roi = roi_slices(x, y, w, h)
                head_img = crop(frame, head_roi)
                torso_img = crop(frame, torso_roi)
                
                # Check PPE
                helmet_ok = mask_ratio_hsv(head_img, **H) > H_T if H else True
                vest_ok = mask_ratio_hsv(torso_img, **V) > V_T if V else True
                
                # Draw bounding box
                color = (0, 255, 0) if (helmet_ok and vest_ok) else (0, 0, 255)
                cv2.rectangle(frame, (x, y), (x+w, y+h), color, 2)
                
                # Send alerts for violations
                if not helmet_ok:
                    emit_alert("NO_HELMET", {"confidence": 0.9}, frame.copy(), (x, y, w, h))
                
                if not vest_ok:
                    emit_alert("NO_VEST", {"confidence": 0.9}, frame.copy(), (x, y, w, h))
                
                # Check zone intrusion
                for z in zones:
                    if in_polygon(c, z.get("polygon", [])):
                        emit_alert("ZONE_INTRUSION", {"zone": z.get("name", "Unknown")}, 
                                 frame.copy(), (x, y, w, h), z.get("name"))
            
            # Check proximity between persons
            for i, ((box1, c1)) in enumerate(centroids):
                for (box2, c2) in centroids[i+1:]:
                    d = ((c1[0]-c2[0])**2 + (c1[1]-c2[1])**2)**0.5
                    if d < PROX:
                        emit_alert("PROXIMITY", {"distance": d}, frame.copy())
            
            # Display frame info every 30 frames
            if frame_count % 30 == 0:
                print(f"📊 Processed {frame_count} frames | Persons detected: {len(persons)}")
            
            # Optional: Display frame (remove in production)
            # cv2.imshow("Vision Processing", frame)
            # if cv2.waitKey(1) & 0xFF == ord('q'):
            #     break
    
    except KeyboardInterrupt:
        print("\n\n⏹️  Stopped by user")
    except Exception as e:
        print(f"\n❌ Error during processing: {e}")
        import traceback
        traceback.print_exc()
    finally:
        cap.release()
        cv2.destroyAllWindows()
        print("\n✅ Vision processing stopped")
        print("=" * 60)

if __name__ == "__main__":
    main()
