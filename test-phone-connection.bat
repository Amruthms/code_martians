@echo off
setlocal enabledelayedexpansion

:: Phone Connection Troubleshooting Script
:: This script helps diagnose why your phone can't send data to the laptop

echo ╔════════════════════════════════════════════════════════════╗
echo ║  Phone to Laptop Connection Troubleshooting                ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

:: Get computer's IP
echo Step 1: Computer IP Address
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4"') do (
    set IP=%%a
    set IP=!IP:~1!
    echo ✓ Your computer's IP: !IP!
    echo ✓ Phone should use: http://!IP!:8000/api/sensor-data
    goto :checkbackend
)
:checkbackend
echo.

:: Check if backend is running
echo Step 2: Backend Server Status
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
curl -s http://localhost:8000/stats > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is running on port 8000
) else (
    echo ❌ Backend is NOT running
    echo    → Start it with: cd backend ^&^& python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
    echo.
    pause
    exit /b 1
)
echo.

:: Check if port 8000 is listening
echo Step 3: Port 8000 Listening Status
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
netstat -an | findstr ":8000" | findstr "LISTENING" > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Port 8000 is open and listening
    netstat -an | findstr ":8000" | findstr "LISTENING"
) else (
    echo ❌ Port 8000 is not listening
    echo    → Make sure backend is started with: --host 0.0.0.0
)
echo.

:: Check firewall
echo Step 4: Windows Firewall Check
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo Checking if port 8000 is allowed through firewall...
netsh advfirewall firewall show rule name="FastAPI Sensor Backend" > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Firewall rule exists for port 8000
) else (
    echo ⚠️  Firewall rule not found
    echo    → Run as Administrator:
    echo    → netsh advfirewall firewall add rule name="FastAPI Sensor Backend" dir=in action=allow protocol=TCP localport=8000
)
echo.

:: Test local connectivity
echo Step 5: Test Local Connectivity
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo Testing localhost...
curl -s http://localhost:8000/stats > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ localhost:8000 is accessible
) else (
    echo ❌ localhost:8000 is NOT accessible
)

echo.
echo Testing IP address...
curl -s http://!IP!:8000/stats > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ !IP!:8000 is accessible
) else (
    echo ❌ !IP!:8000 is NOT accessible
    echo    → This is why your phone can't connect!
)
echo.

:: Network information
echo Step 6: Network Information
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo Active network connections:
ipconfig | findstr /C:"Wireless LAN" /C:"Ethernet adapter" /C:"IPv4"
echo.

:: Test endpoint
echo Step 7: Test Sensor Data Endpoint
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo Sending test sensor data...

curl -s -X POST http://localhost:8000/api/sensor-data ^
  -H "Content-Type: application/json" ^
  -d "{\"timestamp\": \"2024-01-01T00:00:00.000Z\", \"accelerometer\": {\"x\": 0.1, \"y\": 9.8, \"z\": 0.2}, \"ambientLight\": 450.0}" > test_response.tmp 2>&1

type test_response.tmp | findstr "success" > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Sensor data endpoint is working!
    echo    Response:
    type test_response.tmp
) else (
    echo ❌ Sensor data endpoint failed
    echo    Response:
    type test_response.tmp
)
del test_response.tmp > nul 2>&1
echo.

:: Summary
echo ╔════════════════════════════════════════════════════════════╗
echo ║  CONFIGURATION SUMMARY                                      ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📱 Phone Configuration:
echo    Server URL: http://!IP!:8000/api/sensor-data
echo.
echo 🖥️  Laptop Configuration:
echo    Backend URL: http://localhost:8000
echo    Network IP: !IP!
echo.
echo ✅ Checklist:
echo    [ ] Backend is running (uvicorn)
echo    [ ] Using --host 0.0.0.0 (not 127.0.0.1)
echo    [ ] Port 8000 is open in firewall
echo    [ ] Phone and laptop on same WiFi
echo    [ ] Correct URL entered in phone app
echo.
echo 🔧 Common Issues:
echo    1. Firewall blocking port 8000
echo       → Run: netsh advfirewall firewall add rule name="FastAPI" dir=in action=allow protocol=TCP localport=8000
echo.
echo    2. Backend not listening on all interfaces
echo       → Must use: --host 0.0.0.0 (not --host 127.0.0.1)
echo.
echo    3. Different WiFi networks
echo       → Both devices must be on same WiFi
echo.
echo    4. Corporate WiFi blocking
echo       → Try mobile hotspot instead
echo.
echo 📖 For more help, see: PHONE_CONNECTION_GUIDE.md
echo.
pause
