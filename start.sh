#!/bin/bash

# AI-Powered Construction Safety System - Startup Script
# This script starts all components of the system

echo "🏗️  Starting AI-Powered Construction Safety System..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Copying from .env.example..."
    cp .env.example .env
    echo "✅ Please configure .env file before proceeding"
    exit 1
fi

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo "❌ Port $1 is already in use!"
        return 1
    else
        return 0
    fi
}

# Check required ports
echo "🔍 Checking ports..."
check_port 5173 || exit 1
check_port 8000 || exit 1

echo "✅ All ports available"
echo ""

# Start Backend
echo "🚀 Starting Backend (FastAPI)..."
cd backend
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1
uvicorn app:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..
echo "✅ Backend started (PID: $BACKEND_PID)"
echo ""

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
sleep 3

# Start Vision Processing
echo "🎥 Starting Vision Processing..."
cd vision
if [ ! -d "myvenv" ]; then
    echo "Creating virtual environment..."
    python -m venv myvenv
fi
source myvenv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1
python main.py &
VISION_PID=$!
cd ..
echo "✅ Vision processing started (PID: $VISION_PID)"
echo ""

# Start Frontend
echo "🎨 Starting Frontend (React + Vite)..."
cd frontend
if [ ! -f ".env" ]; then
    cp .env.example .env
fi
npm install > /dev/null 2>&1
npm run dev &
FRONTEND_PID=$!
cd ..
echo "✅ Frontend started (PID: $FRONTEND_PID)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 System is ready!"
echo ""
echo "📊 Dashboard:     http://localhost:5173"
echo "🔌 Backend API:   http://localhost:8000"
echo "📚 API Docs:      http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Stopping all services...'; kill $BACKEND_PID $VISION_PID $FRONTEND_PID 2>/dev/null; exit 0" INT
wait
