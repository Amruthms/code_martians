# 🚀 Quick Setup Guide

## First Time Setup

### 1. Clone or Navigate to Project
```bash
cd d:\devhack3
```

### 2. Configure Environment
```bash
# Copy environment template
copy .env.example .env

# Edit .env file and configure:
# - VITE_API_URL (frontend API endpoint)
# - VIDEO_SOURCE (camera index or RTSP URL)
```

### 3. Option A: Docker Setup (Recommended)

#### Prerequisites
- Docker Desktop installed
- Docker Compose installed

#### Start with Docker
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Access Points:**
- Dashboard: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### 3. Option B: Manual Setup

#### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Git (for version control)

#### Windows Setup

**Run the startup script:**
```powershell
.\start.ps1
```

Or manually:

**1. Backend Setup:**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

**2. Vision Setup (in new terminal):**
```powershell
cd vision
python -m venv myvenv
.\myvenv\Scripts\activate
pip install -r requirements.txt
python main.py
```

**3. Frontend Setup (in new terminal):**
```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

#### Linux/Mac Setup

**Run the startup script:**
```bash
chmod +x start.sh
./start.sh
```

Or manually follow the steps above with appropriate path separators.

## Verification

### 1. Check Backend
Visit: http://localhost:8000/docs

You should see the Swagger API documentation.

### 2. Check Frontend
Visit: http://localhost:5173

You should see the Safety Dashboard login page.

### 3. Check Vision Processing
Look for console output showing frame processing and person detection.

## Common Issues

### Port Already in Use

**Windows:**
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# Find and kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

### Camera Not Working

1. Edit `vision/config.yaml`
2. Change `video_source: 0` to another index (1, 2, etc.)
3. For IP camera: `video_source: "rtsp://..."`
4. For video file: `video_source: "path/to/video.mp4"`

### Python Dependencies Failed

```bash
# Upgrade pip
python -m pip install --upgrade pip

# Retry installation
pip install -r requirements.txt
```

### Node Modules Issues

```bash
# Clear and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. **Configure Zones**: Edit `vision/config.yaml` to define safety zones
2. **Calibrate PPE Detection**: Adjust HSV color ranges for your environment
3. **Add Workers**: Use the dashboard to add worker profiles
4. **Set Up Alerts**: Configure alert thresholds and notifications
5. **Test System**: Walk in front of camera with/without PPE

## Default Credentials

**Login Page:**
- Username: `admin`
- Password: `admin123`

(Change in production!)

## Production Deployment

### Using Docker
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment
1. Build frontend: `cd frontend && npm run build`
2. Serve with Nginx or Apache
3. Run backend with gunicorn: `gunicorn -w 4 -k uvicorn.workers.UvicornWorker app:app`
4. Set up systemd services for vision processing

## Support

- Check README.md files in each folder
- Review API documentation at /docs
- Open an issue on GitHub

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Frontend                         │
│              React Dashboard (Port 5173)            │
│  - Real-time monitoring                             │
│  - Alert management                                 │
│  - Analytics & reports                              │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP/REST
                   ▼
┌─────────────────────────────────────────────────────┐
│                    Backend                          │
│              FastAPI Server (Port 8000)             │
│  - Alert API endpoints                              │
│  - Statistics & compliance                          │
│  - Data persistence                                 │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP POST
                   ▲
┌─────────────────────────────────────────────────────┐
│                Vision Processing                    │
│              OpenCV + Python                        │
│  - Camera input                                     │
│  - Person detection                                 │
│  - PPE detection (helmet/vest)                      │
│  - Zone monitoring                                  │
│  - Alert generation                                 │
└─────────────────────────────────────────────────────┘
```

---

**Ready to start? Run `.\start.ps1` (Windows) or `./start.sh` (Linux/Mac)**
