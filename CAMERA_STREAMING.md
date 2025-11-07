# Camera Streaming Guide - Local to EC2

## Problem
EC2 instances don't support USB devices, so your Logitech webcam can't be directly connected to EC2.

## Solution
Stream video from your local machine (with webcam) to EC2 for AI processing.

---

## Quick Start

### 1. **On Your Local Machine (Arch Linux)**

```bash
# Make script executable
chmod +x stream-to-ec2.sh

# Start streaming
./stream-to-ec2.sh
```

This will:
- Check if ffmpeg is installed
- Verify video device `/dev/video0` exists
- Test EC2 backend connectivity
- Stream video to `http://54.206.93.52:8000/upload_stream`

### 2. **View Processed Stream**

**In Browser:**
```
http://54.206.93.52:8000/remote_stream
```

**Or access from Frontend:**
- The Live Monitoring page will automatically use remote stream on EC2

---

## Manual Streaming (Advanced)

### Basic Stream
```bash
ffmpeg -f v4l2 -i /dev/video0 \
  -f mpjpeg \
  http://54.206.93.52:8000/upload_stream
```

### Optimized Stream (Recommended)
```bash
ffmpeg -f v4l2 \
  -input_format mjpeg \
  -video_size 640x480 \
  -framerate 30 \
  -i /dev/video0 \
  -f mpjpeg \
  -q:v 5 \
  -content_type "multipart/x-mixed-replace;boundary=frame" \
  http://54.206.93.52:8000/upload_stream
```

### High Quality Stream
```bash
ffmpeg -f v4l2 \
  -input_format mjpeg \
  -video_size 1280x720 \
  -framerate 30 \
  -i /dev/video0 \
  -f mpjpeg \
  -q:v 3 \
  http://54.206.93.52:8000/upload_stream
```

### Low Bandwidth Stream
```bash
ffmpeg -f v4l2 \
  -video_size 320x240 \
  -framerate 15 \
  -i /dev/video0 \
  -f mpjpeg \
  -q:v 8 \
  http://54.206.93.52:8000/upload_stream
```

---

## Troubleshooting

### Camera Not Found

```bash
# List available video devices
ls -l /dev/video*

# Get camera info
v4l2-ctl --list-devices

# Test camera
ffplay /dev/video0
```

If camera is at different device (e.g., `/dev/video2`), update the script:
```bash
VIDEO_DEVICE="/dev/video2" ./stream-to-ec2.sh
```

### ffmpeg Not Installed

**Arch Linux:**
```bash
sudo pacman -S ffmpeg
```

**Ubuntu:**
```bash
sudo apt install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

### EC2 Backend Not Reachable

```bash
# Test backend
curl http://54.206.93.52:8000/stats

# Test upload endpoint
curl -X POST http://54.206.93.52:8000/upload_stream

# Check EC2 security group
# Ensure port 8000 is open for your IP
```

### Stream Lag or Stuttering

**Reduce resolution:**
```bash
-video_size 320x240
```

**Reduce framerate:**
```bash
-framerate 15
```

**Lower quality:**
```bash
-q:v 8  # Lower quality (1=best, 31=worst)
```

### Permission Denied on Camera

```bash
# Add user to video group
sudo usermod -aG video $USER

# Logout and login again, or:
newgrp video

# Test access
ls -l /dev/video0
# Should show: crw-rw---- 1 root video
```

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Local Machine (Arch Linux)                         │
│  ┌──────────────┐                                   │
│  │  Logitech    │                                   │
│  │  Webcam      │                                   │
│  │  /dev/video0 │                                   │
│  └──────┬───────┘                                   │
│         │                                           │
│         ▼                                           │
│  ┌──────────────┐                                   │
│  │   ffmpeg     │                                   │
│  │   Encoder    │                                   │
│  └──────┬───────┘                                   │
└─────────┼───────────────────────────────────────────┘
          │ MJPEG Stream
          │ HTTP POST
          ▼
┌─────────────────────────────────────────────────────┐
│  EC2 (54.206.93.52:8000)                            │
│  ┌──────────────────────────────────┐               │
│  │  Backend (FastAPI)               │               │
│  │  /upload_stream (POST)           │               │
│  └──────────┬───────────────────────┘               │
│             │                                       │
│             ▼                                       │
│  ┌──────────────────────────────────┐               │
│  │  YOLOv8 Model                    │               │
│  │  - Helmet Detection              │               │
│  │  - Vest Detection                │               │
│  │  - Person Detection              │               │
│  └──────────┬───────────────────────┘               │
│             │                                       │
│             ▼                                       │
│  ┌──────────────────────────────────┐               │
│  │  /remote_stream (GET)            │               │
│  │  Annotated Video Output          │               │
│  └──────────────────────────────────┘               │
└─────────────────────────────────────────────────────┘
          │ MJPEG Stream
          │ HTTP GET
          ▼
┌─────────────────────────────────────────────────────┐
│  Browser / Frontend                                 │
│  http://54.206.93.52:3000/live-monitoring          │
│  - Shows AI-processed video                         │
│  - Bounding boxes around violations                 │
│  - Real-time alerts                                 │
└─────────────────────────────────────────────────────┘
```

---

## API Endpoints

### Upload Stream (POST)
```
POST http://54.206.93.52:8000/upload_stream
Content-Type: multipart/x-mixed-replace; boundary=frame

Accepts MJPEG stream from ffmpeg
Processes each frame with YOLOv8
Stores processed frames in memory
```

### Remote Stream (GET)
```
GET http://54.206.93.52:8000/remote_stream
Returns: MJPEG stream

Serves processed frames with:
- Bounding boxes (helmets, vests, violations)
- Confidence scores
- Alert annotations
```

### Stats (GET)
```
GET http://54.206.93.52:8000/stats
Returns: JSON

{
  "status": "healthy",
  "model_loaded": true,
  "uptime_seconds": 1234,
  "streaming_active": true
}
```

---

## Performance Tips

### Network Bandwidth

| Resolution | Framerate | Quality | Bandwidth   |
|-----------|-----------|---------|-------------|
| 320x240   | 15 fps    | q:v 8   | ~0.5 Mbps   |
| 640x480   | 30 fps    | q:v 5   | ~2-3 Mbps   |
| 1280x720  | 30 fps    | q:v 3   | ~5-8 Mbps   |

### Processing Speed

Backend processes **1 in 5 frames** by default (configurable):
- 30 fps input → 6 fps processing
- Reduces CPU usage by 80%
- Still provides smooth real-time detection

### Latency

- **Local network:** ~100-300ms
- **Internet (EC2):** ~500ms-2s
- Factors: Network speed, distance, processing time

---

## Alternative: Phone Camera

If you want to use your phone camera instead:

```bash
# Install IP Webcam app on Android
# Or use iOS camera apps

# Stream from phone to EC2
ffmpeg -i "http://phone-ip:8080/video" \
  -f mpjpeg \
  http://54.206.93.52:8000/upload_stream
```

See `MOBILE_SENSOR_INTEGRATION.md` for phone setup.

---

## Production Deployment

For production, consider:

1. **SSL/TLS:** Use HTTPS for secure streaming
2. **Authentication:** Add API keys or JWT tokens
3. **CDN:** Use CloudFront or similar for better performance
4. **Dedicated Streaming Server:** RTMP/WebRTC for lower latency
5. **Load Balancing:** Multiple backend instances

---

## Support

**Test streaming:**
```bash
./stream-to-ec2.sh
```

**View logs:**
```bash
# On EC2
docker-compose logs -f backend | grep -i "stream\|upload"
```

**Check status:**
```bash
curl http://54.206.93.52:8000/stats
```

For issues, check:
- `PRODUCTION_DEPLOY.md` - EC2 deployment guide
- `DOCKERFILE_ARCHITECTURE.md` - Docker setup
- `README.md` - General documentation
