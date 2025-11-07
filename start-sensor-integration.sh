#!/bin/bash

# Sensor Integration Quick Start Script
# This script helps you start the backend and frontend for sensor data integration

echo "╔═══════════════════════════════════════════════════════╗"
echo "║   Code Martians - Mobile Sensor Integration          ║"
echo "║   Quick Start Script                                  ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Get current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# Get computer's IP address
echo "🔍 Detecting your computer's IP address..."
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows
    COMPUTER_IP=$(ipconfig | grep -A 4 "Wireless LAN\|Ethernet" | grep "IPv4" | head -1 | awk '{print $NF}')
else
    # Mac/Linux
    COMPUTER_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
fi

echo "✅ Your computer's IP: $COMPUTER_IP"
echo ""

# Check if backend virtual environment exists
if [ ! -d "$BACKEND_DIR/.venv" ]; then
    echo "⚠️  Backend virtual environment not found"
    echo "Creating virtual environment..."
    cd "$BACKEND_DIR"
    python -m venv .venv
    echo "✅ Virtual environment created"
    echo ""
fi

# Check if backend dependencies are installed
echo "📦 Checking backend dependencies..."
cd "$BACKEND_DIR"
source .venv/Scripts/activate 2>/dev/null || source .venv/bin/activate 2>/dev/null

if ! python -c "import fastapi" 2>/dev/null; then
    echo "⚠️  Installing backend dependencies..."
    pip install -r requirements.txt
    echo "✅ Dependencies installed"
    echo ""
fi

# Check if frontend dependencies are installed
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo "⚠️  Frontend dependencies not found"
    echo "Installing frontend dependencies..."
    cd "$FRONTEND_DIR"
    npm install
    echo "✅ Frontend dependencies installed"
    echo ""
fi

echo "╔═══════════════════════════════════════════════════════╗"
echo "║   CONFIGURATION INSTRUCTIONS                          ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "📱 To connect your phone:"
echo "   1. Open the Flutter sensor app"
echo "   2. Enter this URL:"
echo "      http://$COMPUTER_IP:8000/api/sensor-data"
echo "   3. Tap 'Update URL'"
echo "   4. Tap 'Start Streaming'"
echo ""
echo "🌐 To view the dashboard:"
echo "   Open: http://localhost:5173"
echo "   Click: 'Mobile Sensors' in the menu"
echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║   STARTING SERVICES                                   ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "🚀 Starting backend server..."
echo "   Backend will run on: http://0.0.0.0:8000"
echo "   Accessible at: http://$COMPUTER_IP:8000"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Start backend in background
cd "$BACKEND_DIR"
source .venv/Scripts/activate 2>/dev/null || source .venv/bin/activate 2>/dev/null
uvicorn app:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Check if backend is running
if curl -s http://localhost:8000/stats > /dev/null 2>&1; then
    echo "✅ Backend started successfully"
else
    echo "❌ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🚀 Starting frontend server..."
echo "   Frontend will run on: http://localhost:5173"
echo ""

# Start frontend
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!

# Wait a bit for frontend to start
sleep 2

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║   ✅ ALL SERVICES RUNNING                            ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "Backend:  http://localhost:8000 (API)"
echo "          http://$COMPUTER_IP:8000 (Phone access)"
echo "Frontend: http://localhost:5173 (Dashboard)"
echo ""
echo "📱 Phone URL: http://$COMPUTER_IP:8000/api/sensor-data"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for user to stop
trap "echo ''; echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '✅ All services stopped'; exit 0" INT

# Keep script running
wait
