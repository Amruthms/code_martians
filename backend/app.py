from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, Response
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import time
import os
import subprocess
import signal
import cv2
import numpy as np

app = FastAPI(
    title="Construction Safety API",
    description="AI-Powered Construction Site Safety Intelligence System API",
    version="1.0.0"
)

# CORS configuration
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://localhost:3001").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variable to track vision process
vision_process = None
ALERTS: List[Dict[str,Any]] = []

class AlertIn(BaseModel):
    type: str
    ts: int
    zone: Optional[str] = None
    frame_path: Optional[str] = None
    meta: Optional[Dict[str,Any]] = None

@app.post("/alerts")
def post_alert(a: AlertIn):
    ALERTS.append(a.dict())
    # keep only last 1000
    if len(ALERTS) > 1000: del ALERTS[:-1000]
    return {"ok": True}

@app.get("/alerts")
def get_alerts(since: Optional[int] = None):
    if since is None: return {"data": ALERTS[-100:]}
    return {"data": [a for a in ALERTS if a["ts"] > since]}

@app.get("/stats")
def stats():
    total = len(ALERTS)
    by_type = {}
    for a in ALERTS:
        by_type[a["type"]] = by_type.get(a["type"], 0) + 1
    # naive compliance: 100 - 5*violations per 10 minutes
    ten_min_ago = int((time.time()-600)*1000)
    recent = [a for a in ALERTS if a["ts"] >= ten_min_ago]
    score = max(0, 100 - 5*len(recent))
    return {"total": total, "by_type": by_type, "safety_score": score}

@app.post("/vision/start")
def start_vision():
    global vision_process
    
    if vision_process and vision_process.poll() is None:
        return {"status": "already_running", "message": "Vision processing is already running"}
    
    try:
        # Path to vision directory
        vision_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "vision")
        python_exe = os.path.join(vision_dir, "myvenv", "Scripts", "python.exe")
        main_py = os.path.join(vision_dir, "main.py")
        
        # Create log files for stdout and stderr
        log_dir = os.path.join(vision_dir, "logs")
        os.makedirs(log_dir, exist_ok=True)
        stdout_log = open(os.path.join(log_dir, "vision_stdout.log"), "w")
        stderr_log = open(os.path.join(log_dir, "vision_stderr.log"), "w")
        
        # Start the vision processing as a subprocess
        # Use DETACHED_PROCESS on Windows to run independently
        creation_flags = subprocess.CREATE_NEW_PROCESS_GROUP if os.name == 'nt' else 0
        
        vision_process = subprocess.Popen(
            [python_exe, main_py],
            cwd=vision_dir,
            stdout=stdout_log,
            stderr=stderr_log,
            creationflags=creation_flags
        )
        
        # Give it a moment to start
        time.sleep(1)
        
        # Check if it's still running
        if vision_process.poll() is not None:
            # Read error logs
            stdout_log.close()
            stderr_log.close()
            with open(os.path.join(log_dir, "vision_stderr.log"), "r") as f:
                error_msg = f.read()
            return {"status": "error", "message": f"Vision process exited immediately. Error: {error_msg}"}
        
        return {"status": "started", "message": "Vision processing started successfully", "pid": vision_process.pid}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/vision/stop")
def stop_vision():
    global vision_process
    
    if not vision_process or vision_process.poll() is not None:
        return {"status": "not_running", "message": "Vision processing is not running"}
    
    try:
        # Terminate the process
        vision_process.terminate()
        vision_process.wait(timeout=5)
        vision_process = None
        return {"status": "stopped", "message": "Vision processing stopped successfully"}
    except Exception as e:
        # Force kill if terminate doesn't work
        try:
            vision_process.kill()
            vision_process = None
            return {"status": "stopped", "message": "Vision processing force stopped"}
        except:
            return {"status": "error", "message": str(e)}

@app.get("/vision/status")
def vision_status():
    global vision_process
    
    if not vision_process:
        return {"status": "stopped", "running": False}
    
    if vision_process.poll() is None:
        return {"status": "running", "running": True, "pid": vision_process.pid}
    else:
        vision_process = None
        return {"status": "stopped", "running": False}

# Global variables for video streams
camera = None
active_camera_source = 0  # Track which camera is active
camera_instances = {}  # Dictionary to store multiple camera instances

def get_camera(source=None):
    """Get or create camera instance for specific source"""
    global camera, camera_instances
    
    # If no source specified, use the active camera source
    if source is None:
        source = active_camera_source
    
    # For the default camera, use the global variable
    if source == active_camera_source:
        if camera is None or not camera.isOpened():
            camera = cv2.VideoCapture(active_camera_source)
            # Set camera properties for wider field of view
            camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
            camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
            camera.set(cv2.CAP_PROP_FPS, 30)
        return camera
    
    # For other sources, use the instances dictionary
    source_key = str(source)
    if source_key not in camera_instances or not camera_instances[source_key].isOpened():
        camera_instances[source_key] = cv2.VideoCapture(source)
        camera_instances[source_key].set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        camera_instances[source_key].set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        camera_instances[source_key].set(cv2.CAP_PROP_FPS, 30)
    
    return camera_instances[source_key]

def generate_frames(source=None):
def generate_frames(source=None):
    """Generate video frames with detections"""
    from detector import detect_persons
    from ppe import roi_slices, mask_ratio_hsv
    import yaml
    
    # Load config
    vision_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "vision")
    config_path = os.path.join(vision_dir, "config.yaml")
    
    try:
        with open(config_path, "r") as f:
            CFG = yaml.safe_load(f)
    except:
        CFG = {}
    
    zones = CFG.get("zones", [])
    H = CFG.get("helmet_hsv", {})
    V = CFG.get("vest_hsv", {})
    H_T = CFG.get("helmet_ratio_thresh", 0.10)
    V_T = CFG.get("vest_ratio_thresh", 0.15)
    
    cam = get_camera(source)
    frame_count = 0
    
    while True:
        success, frame = cam.read()
        if not success:
            print("Failed to read frame from camera")
            break
        
        # Resize for display - keep original aspect ratio without zooming
        try:
            # Don't resize too much to avoid zooming effect
            h, w = frame.shape[:2]
            if w > 1280:
                scale = 1280 / w
                frame = cv2.resize(frame, (1280, int(h * scale)))
            
            frame_count += 1
            
            # Detect persons every frame
            persons = detect_persons(frame)
            
            # Draw zones
            for z in zones:
                polygon = z.get("polygon", [])
                if polygon and len(polygon) > 0:
                    pts = np.array(polygon, np.int32).reshape((-1, 1, 2))
                    cv2.polylines(frame, [pts], True, tuple(z.get("color", [0, 0, 255])), 2)
                    if len(polygon) > 0:
                        cv2.putText(frame, z.get("name", "Zone"), tuple(polygon[0]), 
                                  cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            
            # Process each detected person
            for (x, y, w, h) in persons:
                # Get ROIs for helmet and vest detection
                head_roi = (slice(y, max(0, y+h//3)), slice(x, x+w))
                torso_roi = (slice(y+h//3, y+2*h//3), slice(x, x+w))
                
                try:
                    head_img = frame[head_roi]
                    torso_img = frame[torso_roi]
                    
                    # Check PPE
                    helmet_ok = mask_ratio_hsv(head_img, **H) > H_T if H and len(H) > 0 else False
                    vest_ok = mask_ratio_hsv(torso_img, **V) > V_T if V and len(V) > 0 else False
                    
                    # Draw bounding box
                    color = (0, 255, 0) if (helmet_ok and vest_ok) else (0, 0, 255)
                    cv2.rectangle(frame, (x, y), (x+w, y+h), color, 3)
                    
                    # Add labels
                    status = "SAFE" if (helmet_ok and vest_ok) else "VIOLATION"
                    label_color = (0, 255, 0) if (helmet_ok and vest_ok) else (0, 0, 255)
                    
                    # Draw status background
                    cv2.rectangle(frame, (x, y-30), (x+150, y), label_color, -1)
                    cv2.putText(frame, status, (x+5, y-8), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
                    
                    # Draw specific violations
                    y_offset = y + h + 25
                    if not helmet_ok:
                        cv2.putText(frame, "NO HELMET", (x, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
                        y_offset += 25
                    if not vest_ok:
                        cv2.putText(frame, "NO VEST", (x, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
                    
                    # Send alerts to backend
                    if frame_count % 30 == 0:  # Send alert every 30 frames
                        if not helmet_ok:
                            ALERTS.append({
                                "type": "NO_HELMET",
                                "ts": int(time.time() * 1000),
                                "zone": None,
                                "frame_path": None,
                                "meta": {"confidence": 0.9}
                            })
                        if not vest_ok:
                            ALERTS.append({
                                "type": "NO_VEST",
                                "ts": int(time.time() * 1000),
                                "zone": None,
                                "frame_path": None,
                                "meta": {"confidence": 0.9}
                            })
                except Exception as e:
                    print(f"PPE detection error: {e}")
                    # Still draw the person box even if PPE detection fails
                    cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 255, 0), 3)
                    cv2.putText(frame, "PERSON", (x, y-8), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)
            
            # Add "LIVE" indicator
            cv2.rectangle(frame, (5, 5), (120, 45), (0, 0, 0), -1)
            cv2.putText(frame, "LIVE", (15, 35), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            
            # Add detection count
            cv2.putText(frame, f"Persons: {len(persons)}", (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            
        except Exception as e:
            print(f"Frame processing error: {e}")
            import traceback
            traceback.print_exc()
            continue
        
        # Encode frame as JPEG
        try:
            ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
            if not ret:
                print("Failed to encode frame")
                continue
                
            frame_bytes = buffer.tobytes()
            
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        except Exception as e:
            print(f"Encode error: {e}")
            continue

@app.get("/video_feed")
def video_feed(source: str = None):
    """Video streaming endpoint with optional source parameter"""
    # Parse source parameter - can be camera index or URL
    camera_source = None
    if source:
        try:
            # Try to parse as integer (local webcam index)
            camera_source = int(source)
        except ValueError:
            # It's a URL (IP camera or RTSP)
            camera_source = source
    
    return StreamingResponse(
        generate_frames(camera_source),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

@app.post("/camera/release")
def release_camera():
    """Release the camera to turn off the camera light"""
    global camera
    try:
        if camera is not None:
            camera.release()
            camera = None
            return {"status": "released", "message": "Camera released successfully"}
        else:
            return {"status": "not_active", "message": "Camera was not active"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/camera/switch")
def switch_camera(source: dict):
    """
    Switch camera source
    Supports:
    - Local webcam: {"type": "local", "index": 0}
    - IP Camera/Phone: {"type": "ip", "url": "http://192.168.1.100:8080/video"}
    - RTSP Stream: {"type": "rtsp", "url": "rtsp://192.168.1.100:8554/stream"}
    """
    global camera, active_camera_source
    
    try:
        # Release current camera
        if camera is not None:
            camera.release()
            camera = None
        
        # Determine the new source
        if source.get("type") == "local":
            active_camera_source = source.get("index", 0)
        elif source.get("type") == "ip":
            # For IP Webcam app: http://192.168.x.x:8080/video
            active_camera_source = source.get("url")
        elif source.get("type") == "rtsp":
            # For RTSP streams
            active_camera_source = source.get("url")
        else:
            return {"status": "error", "message": "Invalid source type"}
        
        # Test the new source
        test_cam = cv2.VideoCapture(active_camera_source)
        if not test_cam.isOpened():
            return {"status": "error", "message": "Failed to open camera source"}
        test_cam.release()
        
        return {
            "status": "success",
            "message": "Camera source switched successfully",
            "source": str(active_camera_source)
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/camera/sources")
def list_camera_sources():
    """List available camera sources and their status"""
    sources = []
    
    # Check local webcams (0-3)
    for i in range(4):
        cap = cv2.VideoCapture(i)
        if cap.isOpened():
            sources.append({
                "type": "local",
                "index": i,
                "name": f"Local Webcam {i}",
                "available": True,
                "active": (active_camera_source == i)
            })
            cap.release()
    
    return {
        "sources": sources,
        "current": str(active_camera_source),
        "instructions": {
            "ip_webcam": "Install 'IP Webcam' app on Android. Use URL: http://PHONE_IP:8080/video",
            "droidcam": "Install 'DroidCam' app. Use URL format based on app settings",
            "rtsp": "For RTSP streams, use: rtsp://IP:PORT/stream"
        }
    }