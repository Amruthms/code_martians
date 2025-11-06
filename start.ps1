# AI-Powered Construction Safety System - Startup Script (Windows)
# This script starts all components of the system

Write-Host "🏗️  Starting AI-Powered Construction Safety System..." -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "⚠️  No .env file found. Copying from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ Please configure .env file before proceeding" -ForegroundColor Green
    exit 1
}

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $null -ne $connection
}

# Check required ports
Write-Host "🔍 Checking ports..." -ForegroundColor Yellow
if (Test-Port 5173) {
    Write-Host "❌ Port 5173 is already in use!" -ForegroundColor Red
    exit 1
}
if (Test-Port 8000) {
    Write-Host "❌ Port 8000 is already in use!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ All ports available" -ForegroundColor Green
Write-Host ""

# Start Backend
Write-Host "🚀 Starting Backend (FastAPI)..." -ForegroundColor Cyan
Set-Location backend
if (-not (Test-Path venv)) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt | Out-Null
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .\venv\Scripts\Activate.ps1; uvicorn app:app --reload --host 0.0.0.0 --port 8000"
Set-Location ..
Write-Host "✅ Backend started" -ForegroundColor Green
Write-Host ""

# Wait for backend to be ready
Write-Host "⏳ Waiting for backend to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Start Vision Processing
Write-Host "🎥 Starting Vision Processing..." -ForegroundColor Cyan
Set-Location vision
if (-not (Test-Path myvenv)) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv myvenv
}
.\myvenv\Scripts\Activate.ps1
pip install -r requirements.txt | Out-Null
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .\myvenv\Scripts\Activate.ps1; python main.py"
Set-Location ..
Write-Host "✅ Vision processing started" -ForegroundColor Green
Write-Host ""

# Start Frontend
Write-Host "🎨 Starting Frontend (React + Vite)..." -ForegroundColor Cyan
Set-Location frontend
if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
}
npm install | Out-Null
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"
Set-Location ..
Write-Host "✅ Frontend started" -ForegroundColor Green
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🎉 System is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Dashboard:     http://localhost:5173" -ForegroundColor White
Write-Host "🔌 Backend API:   http://localhost:8000" -ForegroundColor White
Write-Host "📚 API Docs:      http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to close this window (services will continue running)" -ForegroundColor Yellow
Write-Host "To stop services, close their individual PowerShell windows" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Keep window open
Read-Host "Press Enter to close this window..."
