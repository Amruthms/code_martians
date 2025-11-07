@echo off
echo ========================================
echo   Sensor Data Collector - Server Setup
echo ========================================
echo.

:menu
echo Select server to run:
echo 1. Node.js Server
echo 2. Python Server
echo 3. Install Node.js Dependencies
echo 4. Install Python Dependencies
echo 5. Exit
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto nodejs
if "%choice%"=="2" goto python
if "%choice%"=="3" goto installnode
if "%choice%"=="4" goto installpython
if "%choice%"=="5" goto end

echo Invalid choice. Please try again.
echo.
goto menu

:nodejs
echo.
echo Starting Node.js server...
echo Server will be available at http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
node example_server.js
goto end

:python
echo.
echo Starting Python server...
echo Server will be available at http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
python example_server.py
goto end

:installnode
echo.
echo Installing Node.js dependencies...
call npm install
echo.
echo Done! You can now run the Node.js server.
echo.
pause
goto menu

:installpython
echo.
echo Installing Python dependencies...
pip install flask flask-cors
echo.
echo Done! You can now run the Python server.
echo.
pause
goto menu

:end
echo.
echo Goodbye!
