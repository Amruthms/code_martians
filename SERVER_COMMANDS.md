# 🚀 Server Startup Commands

## Quick Start (All Services at Once)

### Windows
```powershell
.\start.ps1
```

### Linux/Mac
```bash
chmod +x start.sh
./start.sh
```

### Docker
```bash
docker-compose up -d
```

---

## Manual Startup (Individual Services)

### 🔌 Backend Server (FastAPI)

#### Windows PowerShell
```powershell
# Navigate to backend folder
cd D:\devhack3\backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start the server
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

#### Linux/Mac
```bash
cd /path/to/devhack3/backend
source venv/bin/activate
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

**Access:**
- API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

### 👁️ Vision Processing (OpenCV)

#### Windows PowerShell
```powershell
# Navigate to vision folder
cd D:\devhack3\vision

# Activate virtual environment
.\myvenv\Scripts\Activate.ps1

# Start vision processing
python main.py
```

#### Linux/Mac
```bash
cd /path/to/devhack3/vision
source myvenv/bin/activate
python main.py
```

**Output:**
- Console shows detection logs
- Frames saved to: `vision/frames/`
- Alerts sent to: http://localhost:8000/alerts

---

### 🎨 Frontend Dashboard (React + Vite)

#### Windows PowerShell
```powershell
# Navigate to frontend folder
cd D:\devhack3\frontend

# Start development server
npm run dev
```

#### Linux/Mac
```bash
cd /path/to/devhack3/frontend
npm run dev
```

**Access:**
- Dashboard: http://localhost:5173

---

## Step-by-Step Complete Startup

### Terminal 1: Backend
```powershell
cd D:\devhack3\backend
.\venv\Scripts\Activate.ps1
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 2: Vision Processing
```powershell
cd D:\devhack3\vision
.\myvenv\Scripts\Activate.ps1
python main.py
```

### Terminal 3: Frontend
```powershell
cd D:\devhack3\frontend
npm run dev
```

---

## First Time Setup Commands

### Backend Setup
```powershell
cd D:\devhack3\backend

# Create virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### Vision Setup
```powershell
cd D:\devhack3\vision

# Create virtual environment
python -m venv myvenv

# Activate it
.\myvenv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### Frontend Setup
```powershell
cd D:\devhack3\frontend

# Install dependencies
npm install

# Create .env file
copy .env.example .env
```

---

## Stopping Services

### Manual Stop
Press `Ctrl + C` in each terminal window

### Docker Stop
```bash
docker-compose down
```

---

## Checking Service Status

### Check if Backend is running
```powershell
# Windows
Test-NetConnection -ComputerName localhost -Port 8000

# Or visit in browser
# http://localhost:8000/docs
```

### Check if Frontend is running
```powershell
# Visit in browser
# http://localhost:5173
```

### Check running processes
```powershell
# Windows - Check what's using ports
netstat -ano | findstr :8000
netstat -ano | findstr :5173
```

---

## Production Commands

### Backend (Production)
```bash
cd backend
source venv/bin/activate
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app:app --bind 0.0.0.0:8000
```

### Frontend (Build)
```bash
cd frontend
npm run build
# Output will be in frontend/dist/
# Serve with nginx or any static server
```

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## Troubleshooting Commands

### Kill process on port 8000
```powershell
# Find PID
netstat -ano | findstr :8000

# Kill process (replace <PID> with actual number)
taskkill /PID <PID> /F
```

### Kill process on port 5173
```powershell
# Find PID
netstat -ano | findstr :5173

# Kill process
taskkill /PID <PID> /F
```

### Reinstall dependencies

**Backend:**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

**Frontend:**
```powershell
cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

**Vision:**
```powershell
cd vision
.\myvenv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

---

## Environment Variables

### Create .env files
```powershell
# Root .env
copy .env.example .env

# Frontend .env
copy frontend\.env.example frontend\.env
```

### Edit .env
```env
# Root .env
VITE_API_URL=http://localhost:8000
VIDEO_SOURCE=0
BACKEND_API_URL=http://localhost:8000

# frontend/.env
VITE_API_URL=http://localhost:8000
```

---

## Quick Commands Reference

| Action | Command |
|--------|---------|
| Start All | `.\start.ps1` |
| Start Backend | `cd backend; .\venv\Scripts\Activate.ps1; uvicorn app:app --reload` |
| Start Vision | `cd vision; .\myvenv\Scripts\Activate.ps1; python main.py` |
| Start Frontend | `cd frontend; npm run dev` |
| Stop Service | `Ctrl + C` |
| Check Backend | http://localhost:8000/docs |
| Check Frontend | http://localhost:5173 |
| View Logs (Docker) | `docker-compose logs -f` |

---

## Testing API Endpoints

### Test Backend Manually
```powershell
# Get stats
Invoke-WebRequest -Uri http://localhost:8000/stats

# Get alerts
Invoke-WebRequest -Uri http://localhost:8000/alerts

# Post alert (test)
$body = @{
    type = "no_helmet"
    ts = [int][double]::Parse((Get-Date -UFormat %s)) * 1000
    zone = "Test Area"
    meta = @{}
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:8000/alerts -Method POST -Body $body -ContentType "application/json"
```

---

## Complete Workflow

```powershell
# 1. First time setup (run once)
.\init.ps1

# 2. Configure environment
notepad .env
notepad vision\config.yaml

# 3. Start all services
.\start.ps1

# 4. Access dashboard
start http://localhost:5173

# 5. Check API
start http://localhost:8000/docs

# 6. When done, press Ctrl+C in each terminal
```
