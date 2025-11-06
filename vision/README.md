# Vision Processing - PPE Detection & Zone Monitoring

## Overview
OpenCV-based computer vision system for real-time:
- Person detection
- PPE (helmet and vest) detection using HSV color masking
- Zone intrusion monitoring
- Proximity alerts
- Automated alert generation with frame snapshots

## Setup

### Local Development

```bash
# Create virtual environment
python -m venv myvenv

# Activate virtual environment
# Windows:
.\myvenv\Scripts\activate
# Linux/Mac:
source myvenv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run vision processing
python main.py
```

### Docker

```bash
# Build
docker build -t safety-vision .

# Run (with camera access)
docker run --privileged -v ./frames:/app/frames safety-vision
```

## Configuration

Edit `config.yaml`:

```yaml
# Video source (0 for default webcam, or RTSP URL)
video_source: 0

# HSV color ranges for detection
helmet_hsv: { h1: 15, h2: 40, s1: 100, s2: 255, v1: 120, v2: 255 }
vest_hsv: { h1: 20, h2: 45, s1: 120, s2: 255, v1: 120, v2: 255 }

# Detection thresholds
helmet_ratio_thresh: 0.10  # 10% of head ROI must be helmet color
vest_ratio_thresh: 0.15    # 15% of torso ROI must be vest color

# Proximity detection
proximity_pixels: 120

# Safety zones (polygon coordinates)
zones:
  - name: "Crane Area"
    polygon: [[120,420],[360,420],[380,600],[100,600]]
  - name: "Excavation Zone"
    polygon: [[500,300],[700,300],[700,500],[500,500]]

# Backend API
backend_url: "http://localhost:8000"
```

## Features

### Person Detection
Uses Haar Cascade or HOG for person detection in video frames.

### PPE Detection
- **Helmet Detection**: HSV color masking for hi-vis yellow/orange helmets
- **Vest Detection**: HSV color masking for safety vests
- ROI-based detection (head region for helmet, torso for vest)

### Zone Management
- Define restricted/danger zones as polygons
- Real-time intrusion detection
- Visual overlay on video feed

### Alert Types
- `no_helmet` - Worker without helmet
- `no_vest` - Worker without safety vest
- `zone_intrusion` - Unauthorized entry to restricted zone
- `proximity_alert` - Workers too close together

## Architecture

### Core Modules

**`main.py`** - Main processing loop
- Video capture
- Frame processing
- Alert coordination

**`detector.py`** - Person detection
- Implements detection algorithms
- Returns bounding boxes

**`ppe.py`** - PPE detection logic
- ROI extraction
- HSV color masking
- Compliance checking

**`zones.py`** - Zone management
- Polygon operations
- Intrusion detection
- Visualization

## Calibration

### HSV Color Tuning
Use OpenCV trackbars or tools to find optimal HSV ranges for your environment:

```python
# Example HSV ranges
# Yellow/Orange Helmet: H(15-40), S(100-255), V(120-255)
# Orange Vest: H(20-45), S(120-255), V(120-255)
```

### Zone Configuration
Define polygons by clicking points on a reference frame or using image coordinates.

## Troubleshooting

### No Video Feed
- Check camera connection
- Verify `video_source` in config.yaml
- Try different camera indices (0, 1, 2...)

### Poor Detection
- Adjust HSV ranges for your lighting
- Modify threshold values
- Ensure proper camera angle

### High False Positives
- Increase `helmet_ratio_thresh` and `vest_ratio_thresh`
- Refine HSV color ranges
- Filter by detection confidence

## Output

### Saved Frames
Alert frames are saved to `frames/` directory with format:
- `{timestamp}_{unique_id}.jpg`
- Includes bounding boxes for detected violations

### Alert Format
```json
{
  "type": "no_helmet",
  "ts": 1699372800000,
  "zone": "Crane Area",
  "frame_path": "frames/1699372800_abc123.jpg",
  "meta": {
    "bbox": [100, 200, 150, 300],
    "confidence": 0.85
  }
}
```

## Performance

- Target: 15-30 FPS on standard hardware
- Resize frames for faster processing
- Adjust detection intervals if needed

## Future Enhancements

- [ ] Deep learning-based PPE detection (YOLO)
- [ ] Multi-camera support
- [ ] Worker identification and tracking
- [ ] Advanced pose estimation
- [ ] Real-time video streaming to dashboard
- [ ] GPU acceleration
