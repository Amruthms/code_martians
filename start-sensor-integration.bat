@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo    Code Martians - Mobile Sensor Integration
echo    Quick Start Script (Windows)
echo ========================================================
echo.

REM Get computer's IP address
echo Finding your computer's IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set IP=%%a
    set IP=!IP:~1!
    goto :found_ip
)
:found_ip
echo Your computer's IP: %IP%
echo.

REM Check if backend virtual environment exists
if not exist "backend\.venv" (
    echo Virtual environment not found. Creating...
    cd backend
    python -m venv .venv
    echo Virtual environment created
    cd ..
    echo.
)

REM Activate virtual environment and check dependencies
echo Checking backend dependencies...
cd backend
call .venv\Scripts\activate.bat
python -c "import fastapi" 2>nul
if errorlevel 1 (
    echo Installing backend dependencies...
    pip install -r requirements.txt
    echo Dependencies installed
    echo.
)
cd ..

REM Check frontend dependencies
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    echo Frontend dependencies installed
    cd ..
    echo.
)

echo ========================================================
echo    CONFIGURATION INSTRUCTIONS
echo ========================================================
echo.
echo To connect your phone:
echo   1. Open the Flutter sensor app
echo   2. Enter this URL:
echo      http://%IP%:8000/api/sensor-data
echo   3. Tap 'Update URL'
echo   4. Tap 'Start Streaming'
echo.
echo To view the dashboard:
echo   Open: http://localhost:5173
echo   Click: 'Mobile Sensors' in the menu
echo.
echo ========================================================
echo    STARTING SERVICES
echo ========================================================
echo.
echo Starting backend server...
echo Backend will be accessible at: http://%IP%:8000
echo.

REM Start backend in new window
cd backend
start "Code Martians Backend" cmd /k "call .venv\Scripts\activate.bat && uvicorn app:app --host 0.0.0.0 --port 8000 --reload"
cd ..

REM Wait for backend to start
timeout /t 5 /nobreak >nul

REM Check if backend is running
curl -s http://localhost:8000/stats >nul 2>&1
if errorlevel 1 (
    echo Backend failed to start
    pause
    exit /b 1
)

echo Backend started successfully
echo.
echo Starting frontend server...
echo Frontend will run on: http://localhost:5173
echo.

REM Start frontend in new window
cd frontend
start "Code Martians Frontend" cmd /k "npm run dev"
cd ..

timeout /t 3 /nobreak >nul

echo.
echo ========================================================
echo    ALL SERVICES RUNNING
echo ========================================================
echo.
echo Backend:  http://localhost:8000 (API)
echo           http://%IP%:8000 (Phone access)
echo Frontend: http://localhost:5173 (Dashboard)
echo.
echo Phone URL: http://%IP%:8000/api/sensor-data
echo.
echo Services are running in separate windows.
echo Close those windows to stop the services.
echo.
pause
