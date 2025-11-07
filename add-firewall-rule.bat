@echo off
:: Add Windows Firewall Rule for Backend Port 8000
:: Run this script as Administrator

echo ════════════════════════════════════════
echo  Adding Firewall Rule for Port 8000
echo ════════════════════════════════════════
echo.

:: Check for admin rights
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: This script must be run as Administrator!
    echo.
    echo Right-click this file and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo ✓ Running with administrator privileges
echo.

:: Add inbound rule for port 8000
echo Adding inbound rule for TCP port 8000...
netsh advfirewall firewall add rule name="FastAPI Sensor Backend" dir=in action=allow protocol=TCP localport=8000

if %errorlevel% equ 0 (
    echo ✅ SUCCESS: Firewall rule added!
    echo.
    echo Port 8000 is now allowed through Windows Firewall
    echo Your phone should now be able to connect to:
    echo    http://YOUR_IP:8000/api/sensor-data
) else (
    echo ❌ ERROR: Failed to add firewall rule
    echo Please add it manually in Windows Firewall settings
)

echo.
echo ════════════════════════════════════════
pause
