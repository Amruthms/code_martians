# 🏗️ AI-Powered Construction Site Safety Intelligence System

A comprehensive real-time construction site monitoring system that ensures compliance with Nordic safety standards using AI-powered computer vision (YOLOv8), IoT sensors, and intelligent alerts.

## 🎯 Overview

This system monitors construction sites in real-time to:
- Detect PPE (Personal Protective Equipment) compliance using **YOLOv8 AI model**
- Identify helmet, safety vest, and violation detection
- Support multiple camera feeds (IP cameras, phone cameras, RTSP streams)
- Monitor restricted zones and proximity alerts
- Track environmental conditions (dust, noise, temperature)
- Generate automated incident reports and CAPA
- Provide digital permits and training gamification
- Real-time emergency evacuation guidance

## 🏛️ Architecture

```
.
├── frontend/           # React + TypeScript + Vite dashboard (Port 80/3001)
├── backend/            # FastAPI + YOLOv8 detection server (Port 8000)
├── vision/             # Optional OpenCV processing
├── yolov8_model/       # Trained YOLOv8 model (best.pt)
├── docker-compose.yml  # Orchestration for all services
└── README.md           # This file
```

### Components

- **Frontend**: Modern React dashboard with real-time monitoring, multi-camera grid, alerts, and analytics
- **Backend**: FastAPI server with YOLOv8 detection, handling video streams, alerts, statistics, and API endpoints
- **YOLOv8 Model**: Trained model for detecting Hardhat, Safety Vest, NO-Hardhat, NO-Safety Vest, Person, Mask, and more
- **Vision** (Optional): Additional OpenCV-based processing and zone monitoring

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** (Recommended)
- OR manually: Node.js 18+, Python 3.11+, pip

### 🐳 Using Docker (Recommended - Production Ready)

```bash
# Clone the repository
git clone <repository-url>
cd devhack3

# Start all services with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

**Access the application:**
- Frontend Dashboard: http://localhost:80 or http://localhost:3001
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Health Check: http://localhost:8000/stats

### 📱 Multi-Camera Setup with Docker

1. **Access Settings Page**: http://localhost:3001 → Settings → Cameras
2. **Add IP Camera/Phone**:
   - Install "IP Webcam" app on Android
   - Camera URL: `http://YOUR_PHONE_IP:8080/video`
   - Name: `Phone - North Zone` (or any regional name)
3. **Go to Live Monitoring**: View real-time detection with bounding boxes
4. **Multi-Camera Grid**: Select multiple cameras by region for simultaneous monitoring

### Manual Setup (Development)

#### 1. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The dashboard will be available at `http://localhost:3001`

#### 2. Backend Setup (with YOLOv8)

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt
pip install ultralytics opencv-python

# Ensure best.pt model is in backend directory
# (Should already be there from setup)

# Run the server
python app.py
# OR with uvicorn:
# uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

API will be available at `http://localhost:8000`

#### 3. Vision Processing Setup (Optional)

```bash
cd vision
python -m venv myvenv
.\myvenv\Scripts\activate  # Windows
# source myvenv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python main.py
```

## 📋 Features

### 🎨 Frontend Dashboard
- **Main Dashboard**: Real-time site status, PPE compliance %, active alerts, risk levels
- **Live Monitoring**: 
  - Single camera view with AI-powered PPE detection overlays
  - Multi-camera grid (2x2, 1x4, 3x3) for regional monitoring
  - Support for local webcams, IP cameras, RTSP streams
- **Alerts & Incidents**: Comprehensive incident management with CAPA workflow
- **Worker Profiles**: Individual compliance tracking and training records
- **Zone Management**: Interactive site map with safety zones and environmental data
- **Reports**: Compliance trends, incident analytics, and PDF export
- **Training & Gamification**: Safety training modules with progress tracking
- **Digital Permits**: Work permit management and approval workflow
- **ESG Analytics**: Environmental, Social, and Governance metrics
- **Emergency Evacuation**: Real-time evacuation routes and guidance
- **Camera Settings**: Add and manage multiple camera sources

### 🔧 Backend API
- `/video_feed` - Real-time video streaming with YOLOv8 detection
- `/alerts` - POST/GET alerts from vision system
- `/stats` - Real-time safety statistics and compliance scores
- `/camera/sources` - List available camera sources
- `/camera/switch` - Switch between camera sources
- `/camera/release` - Release camera resources
- RESTful API with Pydantic validation
- CORS enabled for frontend integration
- Health check endpoint

### 🤖 YOLOv8 AI Detection
- **Model**: Custom trained YOLOv8 model (`best.pt`)
- **Detection Classes**:
  - ✅ Hardhat (Green bounding box)
  - ✅ Safety Vest (Green bounding box)
  - ❌ NO-Hardhat (Red bounding box - violation)
  - ❌ NO-Safety Vest (Red bounding box - violation)
  - 👤 Person detection
  - 😷 Mask detection
  - 🚧 Safety Cone
  - 🚜 Machinery
  - 🚗 Vehicle
- **Features**:
  - Real-time inference at 30 FPS
  - Confidence threshold: 50%
  - Automatic alert generation for violations
  - Frame-by-frame annotation with bounding boxes
  - Support for multiple video sources simultaneously

### 👁️ Vision Processing (Optional)
- Real-time person detection using YOLO/CV2
- Zone intrusion detection with polygon-based boundaries
- Proximity alerts between workers
- Automated alert generation with frame snapshots

## ⚙️ Configuration

### Environment Variables

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

#### Backend
Configuration via environment variables in docker-compose.yml:
```yaml
environment:
  - CORS_ORIGINS=http://localhost:80,http://localhost:3001
  - PYTHONUNBUFFERED=1
```

#### Vision (config.yaml)
```yaml
video_source: 0  # Camera index or RTSP URL
backend_url: "http://localhost:8000"
zones:
  - name: "Crane Area"
    polygon: [[120,420],[360,420],[380,600],[100,600]]
```

## 🐳 Docker Details

### Services

1. **Backend** (Port 8000)
   - Python 3.11 with FastAPI
   - YOLOv8 (ultralytics) + OpenCV
   - Health checks enabled
   - Volume mounts for frames and logs

2. **Frontend** (Port 80/3001)
   - Node.js 18 build stage
   - Nginx production server
   - Optimized multi-stage build
   - Health checks enabled

3. **Vision** (Optional - Profile: full)
   - Only starts with: `docker-compose --profile full up`
   - For additional OpenCV processing

### Docker Commands

```bash
# Start only backend + frontend
docker-compose up -d

# Start all services including vision
docker-compose --profile full up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a service
docker-compose restart backend

# Stop all services
docker-compose down

# Remove volumes (careful - deletes data)
docker-compose down -v

# Rebuild after code changes
docker-compose up -d --build

# Check service health
docker-compose ps
```

### Volume Mounts
- `./backend/frames` → Alert frame screenshots
- `./backend/logs` → Application logs
- `yolo_model` → YOLOv8 model storage
- `frames_data` → Shared frame storage
- **Training & Gamification**: Safety training modules with progress tracking
- **Digital Permits**: Work permit management and approval workflow
- **ESG Analytics**: Environmental, Social, and Governance metrics
- **Emergency Evacuation**: Real-time evacuation routes and guidance

### 🔧 Backend API
- `/alerts` - POST/GET alerts from vision system
- `/stats` - Real-time safety statistics and compliance scores
- RESTful API with Pydantic validation
- CORS enabled for frontend integration

### 👁️ Vision Processing
- Real-time person detection using YOLO/CV2
- PPE detection (helmet and vest) using HSV color masking
- Zone intrusion detection with polygon-based boundaries
- Proximity alerts between workers
- Automated alert generation with frame snapshots

## ⚙️ Configuration

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

### Backend
Configuration via FastAPI settings and environment variables.

### Vision (config.yaml)
```yaml
video_source: 0  # Camera index or RTSP URL
backend_url: "http://localhost:8000"
zones:
  - name: "Crane Area"
    polygon: [[120,420],[360,420],[380,600],[100,600]]
# HSV thresholds for helmet/vest detection
helmet_hsv: { h1: 15, h2: 40, s1: 100, s2: 255, v1: 120, v2: 255 }
vest_hsv: { h1: 20, h2: 45, s1: 120, s2: 255, v1: 120, v2: 255 }
```

## 🎨 Design System

### Color Palette
- **Safety Orange**: `#FF7A00` - Primary actions, alerts
- **Dark Gray**: `#1E1E1E` - Backgrounds, text
- **Steel Blue**: `#3A4E7A` - Secondary elements
- **White**: `#FFFFFF` - Content areas
- **Green**: Detection success (Hardhat, Safety Vest)
- **Red**: Violations (NO-Hardhat, NO-Safety Vest)

### Technology Stack

**Frontend:**
- React 18 + TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Radix UI components
- Recharts for analytics
- Lucide icons
- Nginx (production)

**Backend:**
- FastAPI (Python 3.11)
- **YOLOv8** (Ultralytics) - AI object detection
- **OpenCV** - Video processing
- Pydantic for validation
- Uvicorn ASGI server

**Vision (Optional):**
- OpenCV (cv2)
- YOLO for object detection
- NumPy for image processing
- Requests for API integration

**DevOps:**
- Docker & Docker Compose
- Multi-stage builds for optimization
- Health checks for all services
- Volume persistence for data

## 📊 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

- `GET /video_feed?source={source}` - MJPEG stream with YOLOv8 detection
- `GET /camera/sources` - List available cameras
- `POST /camera/switch` - Switch camera source
- `GET /alerts` - Get recent alerts
- `POST /alerts` - Create new alert
- `GET /stats` - Get safety statistics
- `GET /vision/status` - Check vision processing status
- `POST /vision/start` - Start vision processing
- `POST /vision/stop` - Stop vision processing

## 🔒 Safety & Compliance

This system is designed to help achieve compliance with:
- Nordic construction safety standards
- ISO 45001 (Occupational Health & Safety)
- Real-time PPE monitoring requirements
- Incident reporting and CAPA workflows
- Multi-camera monitoring for comprehensive coverage

## 🛠️ Development

### Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── pages/           # Page components
│   │   │   ├── LiveMonitoring.tsx      # Main monitoring page
│   │   │   ├── Dashboard.tsx           # Stats dashboard
│   │   │   └── SettingsPage.tsx        # Camera settings
│   │   ├── ui/              # Shadcn UI components
│   │   ├── MultiCameraGrid.tsx         # Multi-camera view
│   │   ├── CameraSettings.tsx          # Camera management
│   │   └── WebcamDetection.tsx         # Single camera view
│   ├── context/             # React Context providers
│   ├── services/            # API services, utilities
│   └── styles/              # Global styles
├── Dockerfile               # Production-ready build
└── package.json

backend/
├── app.py                   # FastAPI application with YOLOv8
├── best.pt                  # Trained YOLOv8 model
├── requirements.txt         # Python dependencies
├── Dockerfile               # Backend container
└── frames/                  # Alert frame storage

vision/                      # Optional additional processing
├── main.py                  # Main processing loop
├── detector.py              # Person detection
├── ppe.py                   # PPE detection logic
├── zones.py                 # Zone management
├── config.yaml              # Configuration
└── frames/                  # Saved alert frames

yolov8_model/                # Model training data
├── Testing_yolov8_model/
│   ├── best.pt              # Trained model
│   └── Test_yolo_model.py   # Test script
└── Training/                # Training dataset

docker-compose.yml           # Orchestration
README.md                    # This file
```

### Adding New Features

1. **Frontend**: Add components in `frontend/src/components/pages/`
2. **Backend**: Add endpoints in `backend/app.py`
3. **YOLOv8 Detection**: Modify `generate_frames()` in `backend/app.py`
4. **Vision**: Extend detection logic in `vision/*.py`

### Camera Source Configuration

The system supports multiple camera types:

**Local Webcam:**
```json
{
  "type": "local",
  "index": 0
}
```

**IP Camera (Phone - IP Webcam app):**
```json
{
  "type": "ip",
  "url": "http://192.168.1.100:8080/video"
}
```

**RTSP Stream:**
```json
{
  "type": "rtsp",
  "url": "rtsp://192.168.1.100:8554/stream"
}
```

## 🐛 Troubleshooting

### Docker Issues

**Containers won't start:**
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild containers
docker-compose down
docker-compose up -d --build
```

**Port already in use:**
```bash
# Change ports in docker-compose.yml
# Backend: Change "8000:8000" to "8001:8000"
# Frontend: Change "80:80" to "8080:80"
```

**Model not loading:**
```bash
# Ensure best.pt is in backend directory
ls backend/best.pt

# Check backend logs
docker-compose logs -f backend
```

### Camera Issues

**Camera Not Working:**
- Check camera URL is accessible: `http://YOUR_PHONE_IP:8080/video`
- Ensure phone and computer are on same network
- For IP Webcam: Make sure app is running and "Start Server" is clicked
- Check backend logs for connection errors

**No Detection Boxes:**
- Ensure you're accessing through backend: `http://localhost:8000/video_feed?source=...`
- Not directly: `http://PHONE_IP:8080/video`
- Check that YOLOv8 model loaded successfully in backend logs
- Look for: `[INFO] YOLOv8 model loaded successfully!`

**Multiple Cameras:**
- Add each camera in Settings → Cameras
- Use descriptive names: "Phone - North Zone", "Phone - East Zone"
- Go to Live Monitoring → Multi-Camera Grid
- Select cameras and click "Start Selected"

### Backend Connection Issues

- Verify backend is running: `docker-compose ps`
- Check health: `http://localhost:8000/stats`
- Check CORS settings in `backend/app.py`
- Update `VITE_API_URL` in frontend `.env` if needed

### Build Issues

**Frontend:**
```bash
# Clear and rebuild
cd frontend
rm -rf node_modules dist
npm install
npm run build
```

**Backend:**
```bash
# Clear Python cache
cd backend
rm -rf __pycache__ venv
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

**Docker:**
```bash
# Clean rebuild
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

## 📈 Performance Tips

1. **YOLOv8 Inference**: Runs at ~30 FPS on CPU, faster with GPU
2. **Multi-Camera**: Limit to 4 simultaneous cameras for smooth performance
3. **Model Optimization**: Use YOLOv8n (nano) for faster inference if needed
4. **Frame Quality**: Adjust JPEG quality in `backend/app.py` (currently 85)
5. **Docker Resources**: Allocate at least 4GB RAM to Docker Desktop

## � Security Considerations

- Change default ports in production
- Use HTTPS with reverse proxy (nginx/traefik)
- Implement authentication for API endpoints
- Secure camera URLs with authentication
- Use environment variables for sensitive data
- Regular security updates: `docker-compose pull`

## �📝 License

This project is developed for construction site safety monitoring.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Create a Pull Request

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues and discussions
- Review troubleshooting section above

## 🎯 Roadmap

- [ ] GPU acceleration for YOLOv8
- [ ] WebRTC for lower latency streaming
- [ ] Mobile app for camera configuration
- [ ] Cloud storage for alert frames
- [ ] Advanced analytics dashboard
- [ ] Integration with existing safety management systems

---

**Built with ❤️ for Construction Safety**

### Quick Start Summary

```bash
# 1. Clone and navigate
git clone <repo-url>
cd devhack3

# 2. Start with Docker
docker-compose up -d

# 3. Access application
# Frontend: http://localhost:80
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs

# 4. Add phone camera
# Settings → Cameras → Add Phone Camera
# URL: http://YOUR_PHONE_IP:8080/video

# 5. Monitor
# Live Monitoring → Multi-Camera Grid
# Select cameras → Start Selected
```

🚀 **You're ready to monitor construction site safety with AI!**
