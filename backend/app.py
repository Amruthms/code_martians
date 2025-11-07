from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, Response, PlainTextResponse, JSONResponse
from pydantic import BaseModel, field_validator
from typing import Optional, List, Dict, Any, Literal
import time
import os
import subprocess
import signal
import cv2
import numpy as np
from ultralytics import YOLO
from dotenv import load_dotenv
from twilio.rest import Client

# Load environment variables
load_dotenv()

# Twilio Configuration
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_CALLER_NUMBER = os.getenv("TWILIO_CALLER_NUMBER")
BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")

# Initialize Twilio client if credentials are available
twilio_client = None
if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_CALLER_NUMBER:
    try:
        twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        print(f"[INFO] Twilio client initialized. Caller: {TWILIO_CALLER_NUMBER}")
    except Exception as e:
        print(f"[WARN] Twilio initialization failed: {e}")
else:
    print("[WARN] Twilio not configured. Emergency calling disabled.")

app = FastAPI(
    title="Construction Safety API with Emergency Calling",
    description="AI-Powered Construction Site Safety Intelligence System API with Twilio Emergency Calls",
    version="2.0.0"
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

# Startup event to pre-load model
@app.on_event("startup")
async def startup_event():
    """Pre-load YOLOv8 model on server startup for faster first request"""
    import threading
    def preload():
        print("[INFO] Pre-loading YOLOv8 model on startup...")
        try:
            get_yolo_model()
            print("[INFO] Model pre-loaded successfully!")
        except Exception as e:
            print(f"[WARN] Failed to pre-load model: {e}")
    
    # Load in background thread to not block startup
    threading.Thread(target=preload, daemon=True).start()

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
            print(f"[INFO] Initializing camera {active_camera_source}...")
            camera = cv2.VideoCapture(active_camera_source)
            # Reduce resolution for faster capture and processing
            camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            camera.set(cv2.CAP_PROP_FPS, 30)
            camera.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # Minimize buffer lag
            print(f"[INFO] Camera initialized successfully")
        return camera
    
    # For other sources, use the instances dictionary
    source_key = str(source)
    if source_key not in camera_instances or not camera_instances[source_key].isOpened():
        print(f"[INFO] Initializing camera {source}...")
        camera_instances[source_key] = cv2.VideoCapture(source)
        camera_instances[source_key].set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        camera_instances[source_key].set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        camera_instances[source_key].set(cv2.CAP_PROP_FPS, 30)
        camera_instances[source_key].set(cv2.CAP_PROP_BUFFERSIZE, 1)
        print(f"[INFO] Camera {source} initialized successfully")
    
    return camera_instances[source_key]

# Global variables for trained YOLOv8 model
yolo_model = None

def get_yolo_model():
    """Initialize YOLOv8 trained model (singleton)"""
    global yolo_model
    
    if yolo_model is None:
        # Path to the trained YOLOv8 model - allow override via MODEL_PATH env var
        default_path = os.path.join(os.path.dirname(__file__), "best.pt")
        model_path = os.environ.get("MODEL_PATH", default_path)
        print(f"[INFO] Loading YOLOv8 trained model from: {model_path}")
        if not os.path.isfile(model_path):
            print(f"[WARN] Model file not found at {model_path}. Trying default path {default_path}")
            model_path = default_path
        yolo_model = YOLO(model_path)
        print(f"[INFO] YOLOv8 model loaded successfully!")
        print(f"[INFO] Model classes: {yolo_model.names}")
    
    return yolo_model

def generate_frames(source=None):
    """Generate video frames with YOLOv8 detections"""
    
    cam = get_camera(source)
    frame_count = 0
    
    # Performance optimization settings
    PROCESS_EVERY_N_FRAMES = 5  # Process 1 out of every 5 frames (reduces CPU by 80%)
    INFERENCE_SIZE = 480  # Smaller size for faster inference
    JPEG_QUALITY = 70  # Lower quality for faster encoding/transmission
    
    # Pre-load model in background to avoid blocking first frames
    model = None
    model_loading = True
    last_annotated_frame = None  # Cache last processed frame
    
    print("[INFO] Starting frame generation...")
    
    def load_model_async():
        nonlocal model, model_loading
        print("[INFO] Loading YOLOv8 model in background...")
        model = get_yolo_model()
        model_loading = False
        print("[INFO] YOLOv8 model loaded and ready for inference")
    
    # Start loading model in background
    import threading
    threading.Thread(target=load_model_async, daemon=True).start()
    
    # Send first few frames immediately without waiting for model
    print("[INFO] Sending initial frames...")
    
    while True:
        success, frame = cam.read()
        if not success:
            print("[ERROR] Failed to read frame from camera")
            break
        
        try:
            frame_count += 1
            
            # If model is still loading, send raw frames with loading message
            if model_loading or model is None:
                annotated_frame = frame.copy()
                cv2.rectangle(annotated_frame, (5, 5), (350, 45), (0, 0, 0), -1)
                cv2.putText(annotated_frame, "Loading AI Model...", (15, 35), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 165, 255), 2)
            # OPTIMIZATION: Process only every Nth frame
            elif frame_count % PROCESS_EVERY_N_FRAMES == 0:
                # Resize frame for faster inference
                inference_frame = cv2.resize(frame, (INFERENCE_SIZE, INFERENCE_SIZE))
                
                # Run YOLOv8 prediction on smaller frame
                results = model.predict(inference_frame, conf=0.5, verbose=False)[0]
                
                # Get annotated frame with bounding boxes (resize back to display size)
                annotated_small = results.plot()
                annotated_frame = cv2.resize(annotated_small, (frame.shape[1], frame.shape[0]))
                
                # Cache this frame for skipped frames
                last_annotated_frame = annotated_frame.copy()
                
                # Count violations for alerts
                violation_count = 0
                no_helmet_count = 0
                no_vest_count = 0
                
                # Parse detections for alert generation
                if results.boxes is not None:
                    for box in results.boxes:
                        cls_id = int(box.cls[0])
                        class_name = model.names[cls_id]
                        conf = float(box.conf[0])
                        
                        # Check for violations
                        if 'NO-Hardhat' in class_name or 'NO-Safety Vest' in class_name:
                            violation_count += 1
                            
                            if 'NO-Hardhat' in class_name:
                                no_helmet_count += 1
                            if 'NO-Safety Vest' in class_name:
                                no_vest_count += 1
                
                # Send alerts every 30 frames (once per second at 30fps)
                if frame_count % 30 == 0:
                    if no_helmet_count > 0:
                        ALERTS.append({
                            "type": "NO_HELMET",
                            "ts": int(time.time() * 1000),
                            "zone": None,
                            "frame_path": None,
                            "meta": {"count": no_helmet_count}
                        })
                    
                    if no_vest_count > 0:
                        ALERTS.append({
                            "type": "NO_VEST",
                            "ts": int(time.time() * 1000),
                            "zone": None,
                            "frame_path": None,
                            "meta": {"count": no_vest_count}
                        })
                
                # Add "LIVE" indicator
                cv2.rectangle(annotated_frame, (5, 5), (120, 45), (0, 0, 0), -1)
                cv2.putText(annotated_frame, "LIVE", (15, 35), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                
                # Add detection counts
                total_detections = len(results.boxes) if results.boxes is not None else 0
                cv2.putText(annotated_frame, f"Detections: {total_detections}", (10, 70), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
                cv2.putText(annotated_frame, f"Violations: {violation_count}", (10, 95), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255) if violation_count > 0 else (0, 255, 0), 2)
            else:
                # OPTIMIZATION: Use cached frame for skipped frames
                if last_annotated_frame is not None:
                    annotated_frame = last_annotated_frame
                else:
                    annotated_frame = frame
            
        except Exception as e:
            print(f"[ERROR] Frame processing error: {e}")
            import traceback
            traceback.print_exc()
            annotated_frame = frame
            continue
        
        # Encode frame as JPEG with lower quality for faster transmission
        try:
            ret, buffer = cv2.imencode('.jpg', annotated_frame, [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY])
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

# ============================================================================
# MOBILE SENSOR DATA INTEGRATION
# ============================================================================

# Store sensor data in memory (last 1000 entries)
SENSOR_DATA_HISTORY: List[Dict[str, Any]] = []

# Pydantic models for sensor data
class AccelerometerData(BaseModel):
    x: float
    y: float
    z: float

class GyroscopeData(BaseModel):
    x: float
    y: float
    z: float

class MagnetometerData(BaseModel):
    x: float
    y: float
    z: float

class GPSData(BaseModel):
    latitude: float
    longitude: float
    altitude: float
    speed: float
    accuracy: float

class SensorDataIn(BaseModel):
    timestamp: str
    accelerometer: Optional[AccelerometerData] = None
    gyroscope: Optional[GyroscopeData] = None
    magnetometer: Optional[MagnetometerData] = None
    gps: Optional[GPSData] = None
    proximity: Optional[float] = None
    ambientLight: Optional[float] = None
    pressure: Optional[float] = None

class BatchSensorData(BaseModel):
    batch: List[SensorDataIn]

@app.post("/api/sensor-data")
def receive_sensor_data(sensor_data: SensorDataIn):
    """
    Receive real-time sensor data from mobile devices (phones/tablets).
    This endpoint accepts data from the Flutter sensor app.
    """
    try:
        # Convert to dict and add server timestamp
        data_dict = sensor_data.dict()
        data_dict["server_received_at"] = int(time.time() * 1000)
        
        # Add to history
        SENSOR_DATA_HISTORY.append(data_dict)
        
        # Keep only last 1000 entries
        if len(SENSOR_DATA_HISTORY) > 1000:
            SENSOR_DATA_HISTORY.pop(0)
        
        # Log for debugging
        print(f"[SENSOR] Received sensor data: Accel={sensor_data.accelerometer is not None}, "
              f"Gyro={sensor_data.gyroscope is not None}, GPS={sensor_data.gps is not None}, "
              f"Light={sensor_data.ambientLight}")
        
        # Optional: Generate alerts based on sensor data
        # Example: High acceleration might indicate a fall
        if sensor_data.accelerometer:
            accel_magnitude = (sensor_data.accelerometer.x**2 + 
                             sensor_data.accelerometer.y**2 + 
                             sensor_data.accelerometer.z**2)**0.5
            
            # Detect potential fall (acceleration > 2g)
            if accel_magnitude > 19.6:  # 2g in m/s^2
                ALERTS.append({
                    "type": "POTENTIAL_FALL",
                    "ts": int(time.time() * 1000),
                    "zone": None,
                    "frame_path": None,
                    "meta": {
                        "acceleration": accel_magnitude,
                        "source": "mobile_sensor"
                    }
                })
                print(f"[ALERT] Potential fall detected! Acceleration: {accel_magnitude:.2f} m/s²")
        
        return {
            "success": True,
            "message": "Sensor data received successfully",
            "timestamp": data_dict["server_received_at"],
            "entries_stored": len(SENSOR_DATA_HISTORY)
        }
    
    except Exception as e:
        print(f"[ERROR] Failed to process sensor data: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/sensor-data/batch")
def receive_batch_sensor_data(batch_data: BatchSensorData):
    """Receive batch sensor data from mobile devices"""
    try:
        received_count = len(batch_data.batch)
        
        for sensor_data in batch_data.batch:
            data_dict = sensor_data.dict()
            data_dict["server_received_at"] = int(time.time() * 1000)
            SENSOR_DATA_HISTORY.append(data_dict)
        
        # Keep only last 1000 entries
        if len(SENSOR_DATA_HISTORY) > 1000:
            SENSOR_DATA_HISTORY[:] = SENSOR_DATA_HISTORY[-1000:]
        
        print(f"[SENSOR] Received batch of {received_count} sensor data entries")
        
        return {
            "success": True,
            "message": f"{received_count} sensor data entries received",
            "timestamp": int(time.time() * 1000),
            "entries_stored": len(SENSOR_DATA_HISTORY)
        }
    
    except Exception as e:
        print(f"[ERROR] Failed to process batch sensor data: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/sensor-data/latest")
def get_latest_sensor_data(count: int = 10):
    """Get the latest sensor data entries"""
    if count > 100:
        count = 100  # Limit to 100 entries max
    
    latest = SENSOR_DATA_HISTORY[-count:] if SENSOR_DATA_HISTORY else []
    return {
        "data": latest,
        "count": len(latest),
        "total_stored": len(SENSOR_DATA_HISTORY)
    }

@app.get("/api/sensor-data/all")
def get_all_sensor_data():
    """Get all stored sensor data"""
    return {
        "data": SENSOR_DATA_HISTORY,
        "count": len(SENSOR_DATA_HISTORY)
    }

@app.delete("/api/sensor-data")
def clear_sensor_data():
    """Clear all sensor data history"""
    SENSOR_DATA_HISTORY.clear()
    return {
        "success": True,
        "message": "Sensor data history cleared"
    }

@app.get("/api/sensor-data/stats")
def get_sensor_stats():
    """Get statistics about received sensor data"""
    if not SENSOR_DATA_HISTORY:
        return {
            "total_entries": 0,
            "message": "No sensor data received yet"
        }
    
    # Calculate statistics
    has_accelerometer = sum(1 for d in SENSOR_DATA_HISTORY if d.get("accelerometer"))
    has_gyroscope = sum(1 for d in SENSOR_DATA_HISTORY if d.get("gyroscope"))
    has_magnetometer = sum(1 for d in SENSOR_DATA_HISTORY if d.get("magnetometer"))
    has_gps = sum(1 for d in SENSOR_DATA_HISTORY if d.get("gps"))
    has_light = sum(1 for d in SENSOR_DATA_HISTORY if d.get("ambientLight") is not None)
    
    latest = SENSOR_DATA_HISTORY[-1] if SENSOR_DATA_HISTORY else None
    
    return {
        "total_entries": len(SENSOR_DATA_HISTORY),
        "sensor_coverage": {
            "accelerometer": has_accelerometer,
            "gyroscope": has_gyroscope,
            "magnetometer": has_magnetometer,
            "gps": has_gps,
            "light": has_light
        },
        "latest_timestamp": latest.get("timestamp") if latest else None,
        "server_uptime": int(time.time())
    }

# ============================================================================
# TWILIO EMERGENCY CALLING SYSTEM
# ============================================================================

# Pydantic models for Twilio
class CallRequest(BaseModel):
    to: str
    message: Optional[str] = "This is a safety alert from the AI-powered construction monitoring system."

    @field_validator("to")
    @classmethod
    def validate_e164(cls, v: str):
        if not v.startswith("+") or not v[1:].replace(" ", "").replace("-", "").isdigit():
            raise ValueError("Phone number must be in E.164 format, e.g., +15551234567")
        return v

ContactName = Literal["fire", "ambulance", "police", "manager"]

# Emergency contacts configuration
EMERGENCY_CONTACTS: Dict[ContactName, Dict[str, str]] = {
    "fire": {
        "to": os.getenv("EMERGENCY_FIRE", "+47110110"),
        "message": "🚨 EMERGENCY: Possible fire hazard detected at the construction site. Immediate response required."
    },
    "ambulance": {
        "to": os.getenv("EMERGENCY_AMBULANCE", "+47110113"),
        "message": "🚑 MEDICAL EMERGENCY: Injury detected at the construction site. Please dispatch an ambulance immediately."
    },
    "police": {
        "to": os.getenv("EMERGENCY_POLICE", "+47110112"),
        "message": "🚓 SECURITY ALERT: Potential unauthorized access detected at the construction site. Please respond."
    },
    "manager": {
        "to": os.getenv("EMERGENCY_MANAGER", "+4712345678"),
        "message": "⚠️ AI SAFETY ALERT: Immediate attention required at the construction site. Check the dashboard now."
    },
}

# Simple cooldown mechanism to prevent spam
_last_call_timestamp: Dict[str, float] = {}
CALL_COOLDOWN_SECONDS = 20

def check_call_cooldown(key: str):
    """Check if enough time has passed since last call to prevent spam"""
    now = time.time()
    last_call = _last_call_timestamp.get(key, 0)
    if now - last_call < CALL_COOLDOWN_SECONDS:
        wait_time = int(CALL_COOLDOWN_SECONDS - (now - last_call))
        raise HTTPException(
            status_code=429,
            detail=f"Please wait {wait_time} seconds before calling again to prevent spam."
        )
    _last_call_timestamp[key] = now

@app.get("/voice/status")
def voice_status():
    """Check Twilio configuration status"""
    return {
        "configured": twilio_client is not None,
        "caller_number": TWILIO_CALLER_NUMBER if twilio_client else None,
        "base_url": BASE_URL,
        "emergency_contacts": {
            name: {"number": contact["to"]} 
            for name, contact in EMERGENCY_CONTACTS.items()
        } if twilio_client else None
    }

@app.post("/voice/call")
def voice_call_custom(body: CallRequest):
    """
    Place an emergency call to a custom verified number with a custom message.
    Used for calling any verified number during Twilio trial.
    """
    if not twilio_client:
        raise HTTPException(
            status_code=503,
            detail="Twilio is not configured. Please set TWILIO_* environment variables."
        )
    
    check_call_cooldown(f"custom:{body.to}")
    
    try:
        # Use TwiML directly without callback URL
        twiml = f'<Response><Say voice="alice">{body.message}</Say></Response>'
        
        call = twilio_client.calls.create(
            to=body.to,
            from_=TWILIO_CALLER_NUMBER,
            twiml=twiml
        )
        return {
            "ok": True,
            "sid": call.sid,
            "to": body.to,
            "message": "Call initiated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Twilio error: {str(e)}")

@app.post("/voice/call/{contact}")
def voice_call_emergency(contact: ContactName):
    """
    Place an emergency call to one of the preset contacts:
    - fire: Fire emergency services
    - ambulance: Medical emergency services  
    - police: Police/security services
    - manager: Site manager notification
    """
    if not twilio_client:
        raise HTTPException(
            status_code=503,
            detail="Twilio is not configured. Please set TWILIO_* environment variables."
        )
    
    check_call_cooldown(f"contact:{contact}")
    
    target = EMERGENCY_CONTACTS[contact]
    
    try:
        # Use TwiML directly without callback URL
        twiml = f'<Response><Say voice="alice">{target["message"]}</Say></Response>'
        
        call = twilio_client.calls.create(
            to=target["to"],
            from_=TWILIO_CALLER_NUMBER,
            twiml=twiml
        )
        
        # Log the emergency call
        ALERTS.append({
            "type": f"EMERGENCY_CALL_{contact.upper()}",
            "ts": int(time.time() * 1000),
            "zone": None,
            "frame_path": None,
            "meta": {
                "contact": contact,
                "to": target["to"],
                "call_sid": call.sid
            }
        })
        
        return {
            "ok": True,
            "sid": call.sid,
            "contact": contact,
            "to": target["to"],
            "message": f"Emergency call to {contact} initiated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Twilio error: {str(e)}")

@app.get("/voice/twiml", response_class=PlainTextResponse)
def voice_twiml(msg: str = "This is a safety alert from the construction site."):
    """
    TwiML endpoint that Twilio fetches to know what to do when the call is answered.
    This uses Twilio's text-to-speech to read the message.
    """
    # Sanitize message (remove non-printable characters)
    safe_msg = "".join(ch for ch in msg if ch.isprintable())
    
    # TwiML response with polly voice
    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna" language="en-US">{safe_msg}</Say>
  <Pause length="1"/>
  <Say voice="Polly.Joanna">This message will repeat.</Say>
  <Pause length="1"/>
  <Say voice="Polly.Joanna">{safe_msg}</Say>
</Response>"""
    return twiml

# Exception handler for better error responses
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail}
        )
    # Log unexpected errors
    print(f"[ERROR] Unexpected error: {exc}")
    import traceback
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    import uvicorn
    print("=" * 60)
    print("🚀 Construction Safety API with YOLOv8 + Emergency Calling")
    print("=" * 60)
    print("✅ Using YOLOv8 Helmet & Vest Detection Model")
    print("✅ Trained for: Hardhat, Safety Vest, and Violations")
    if twilio_client:
        print("✅ Twilio Emergency Calling System Active")
        print(f"📞 Caller Number: {TWILIO_CALLER_NUMBER}")
    else:
        print("⚠️  Twilio Emergency Calling Not Configured")
    print("📡 Server starting on http://localhost:8000")
    print("=" * 60)
    uvicorn.run(app, host="0.0.0.0", port=8000)