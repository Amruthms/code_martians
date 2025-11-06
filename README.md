# 🏗️ AI-Powered Construction Site Safety Intelligence System

A comprehensive real-time construction site monitoring system that ensures compliance with Nordic safety standards using AI-powered computer vision, IoT sensors, and intelligent alerts.

## 🎯 Overview

This system monitors construction sites in real-time to:
- Detect PPE (Personal Protective Equipment) compliance (helmets, vests)
- Monitor restricted zones and proximity alerts
- Track environmental conditions (dust, noise, temperature)
- Generate automated incident reports and CAPA
- Provide digital permits and training gamification
- Real-time emergency evacuation guidance

## 🏛️ Architecture

```
.
├── frontend/          # React + TypeScript + Vite dashboard
├── backend/           # FastAPI REST API server
├── vision/            # OpenCV computer vision processing
└── docker-compose.yml # Orchestration for all services
```

### Components

- **Frontend**: Modern React dashboard with real-time monitoring, alerts, and analytics
- **Backend**: FastAPI server handling alerts, statistics, and API endpoints
- **Vision**: OpenCV-based PPE detection and zone monitoring system

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.8+
- (Optional) Docker & Docker Compose

### Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Manual Setup

#### 1. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The dashboard will be available at `http://localhost:5173`

#### 2. Backend Setup

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

API will be available at `http://localhost:8000`

#### 3. Vision Processing Setup

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
- **Live Monitoring**: Camera feeds with AI-powered PPE detection overlays
- **Alerts & Incidents**: Comprehensive incident management with CAPA workflow
- **Worker Profiles**: Individual compliance tracking and training records
- **Zone Management**: Interactive site map with safety zones and environmental data
- **Reports**: Compliance trends, incident analytics, and PDF export
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

### Technology Stack

**Frontend:**
- React 18 + TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Radix UI components
- Recharts for analytics
- TensorFlow.js for in-browser AI
- Lucide icons

**Backend:**
- FastAPI (Python)
- Pydantic for validation
- Uvicorn ASGI server

**Vision:**
- OpenCV (cv2)
- YOLO for object detection
- NumPy for image processing
- Requests for API integration

## 📊 API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🔒 Safety & Compliance

This system is designed to help achieve compliance with:
- Nordic construction safety standards
- ISO 45001 (Occupational Health & Safety)
- Real-time PPE monitoring requirements
- Incident reporting and CAPA workflows

## 🛠️ Development

### Project Structure

```
frontend/
├── src/
│   ├── components/       # React components
│   │   ├── pages/        # Page components
│   │   ├── ui/           # Shadcn UI components
│   │   └── figma/        # Figma-imported components
│   ├── context/          # React Context providers
│   ├── services/         # API services, utilities
│   └── styles/           # Global styles

backend/
├── app.py               # FastAPI application
└── requirements.txt     # Python dependencies

vision/
├── main.py              # Main processing loop
├── detector.py          # Person detection
├── ppe.py               # PPE detection logic
├── zones.py             # Zone management
├── config.yaml          # Configuration
└── frames/              # Saved alert frames
```

### Adding New Features

1. **Frontend**: Add components in `frontend/src/components/pages/`
2. **Backend**: Add endpoints in `backend/app.py`
3. **Vision**: Extend detection logic in `vision/*.py`

## 🐛 Troubleshooting

### Camera Not Working
- Check `vision/config.yaml` - ensure correct video_source
- Try `video_source: 0` for default webcam
- For IP camera: `video_source: "rtsp://..."`

### Backend Connection Issues
- Verify backend is running on port 8000
- Check CORS settings in `backend/app.py`
- Update `VITE_API_URL` in frontend `.env`

### Build Issues
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Python cache: `rm -rf __pycache__`

## 📝 License

This project is developed for construction site safety monitoring.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📧 Support

For issues and questions, please open an issue on the repository.

---

**Built with ❤️ for Construction Safety**
