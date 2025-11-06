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

# Global variable for video stream
camera = None

def get_camera():
    """Get or create camera instance"""
    global camera
    if camera is None or not camera.isOpened():
        camera = cv2.VideoCapture(0)
        # Set camera properties for better performance
        camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        camera.set(cv2.CAP_PROP_FPS, 30)
    return camera

def generate_frames():
    """Generate video frames with detections"""
    cam = get_camera()
    
    while True:
        success, frame = cam.read()
        if not success:
            print("Failed to read frame from camera")
            break
        
        # Resize for display
        try:
            frame = cv2.resize(frame, (960, 540))
            
            # Add "LIVE" indicator
            cv2.putText(frame, "LIVE", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            cv2.putText(frame, "OpenCV Camera Feed", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
            
        except Exception as e:
            print(f"Frame processing error: {e}")
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
def video_feed():
    """Video streaming endpoint"""
    return StreamingResponse(
        generate_frames(),
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