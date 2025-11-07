#!/bin/bash

# Phone Connection Troubleshooting Script
# This script helps diagnose why your phone can't send data to the laptop

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Phone to Laptop Connection Troubleshooting                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Get computer's IP
echo "Step 1: Computer IP Address"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
COMPUTER_IP=$(ipconfig | grep "IPv4" | head -1 | awk '{print $NF}')
echo "✓ Your computer's IP: $COMPUTER_IP"
echo "✓ Phone should use: http://$COMPUTER_IP:8000/api/sensor-data"
echo ""

# Check if backend is running
echo "Step 2: Backend Server Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if curl -s http://localhost:8000/stats > /dev/null 2>&1; then
    echo "✅ Backend is running on port 8000"
else
    echo "❌ Backend is NOT running"
    echo "   → Start it with: cd backend && uvicorn app:app --host 0.0.0.0 --port 8000 --reload"
    echo ""
    echo "   Press any key to exit..."
    read -n 1
    exit 1
fi
echo ""

# Check if port 8000 is listening on all interfaces
echo "Step 3: Port 8000 Listening Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if netstat -an | grep ":8000" | grep "LISTENING" > /dev/null 2>&1; then
    echo "✅ Port 8000 is open and listening"
    netstat -an | grep ":8000" | grep "LISTENING"
else
    echo "❌ Port 8000 is not listening"
    echo "   → Make sure backend is started with: --host 0.0.0.0"
fi
echo ""

# Check firewall status
echo "Step 4: Windows Firewall Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Checking if port 8000 is allowed through firewall..."

# Try to add firewall rule (requires admin)
netsh advfirewall firewall show rule name="FastAPI Sensor Backend" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Firewall rule exists for port 8000"
else
    echo "⚠️  Firewall rule not found"
    echo "   → Run as Administrator:"
    echo "   → netsh advfirewall firewall add rule name=\"FastAPI Sensor Backend\" dir=in action=allow protocol=TCP localport=8000"
fi
echo ""

# Test local connectivity
echo "Step 5: Test Local Connectivity"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing localhost..."
if curl -s http://localhost:8000/stats > /dev/null 2>&1; then
    echo "✅ localhost:8000 is accessible"
else
    echo "❌ localhost:8000 is NOT accessible"
fi

echo ""
echo "Testing IP address..."
if curl -s http://$COMPUTER_IP:8000/stats > /dev/null 2>&1; then
    echo "✅ $COMPUTER_IP:8000 is accessible"
else
    echo "❌ $COMPUTER_IP:8000 is NOT accessible"
    echo "   → This is why your phone can't connect!"
fi
echo ""

# Network information
echo "Step 6: Network Information"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Active network connections:"
ipconfig | grep -A 4 "Wireless LAN\|Ethernet" | head -10
echo ""

# Test endpoint
echo "Step 7: Test Sensor Data Endpoint"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Sending test sensor data..."

TEST_RESPONSE=$(curl -s -X POST http://localhost:8000/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
    "accelerometer": {"x": 0.1, "y": 9.8, "z": 0.2},
    "ambientLight": 450.0
  }' 2>&1)

if echo "$TEST_RESPONSE" | grep -q "success"; then
    echo "✅ Sensor data endpoint is working!"
    echo "   Response: $TEST_RESPONSE"
else
    echo "❌ Sensor data endpoint failed"
    echo "   Response: $TEST_RESPONSE"
fi
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  CONFIGURATION SUMMARY                                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📱 Phone Configuration:"
echo "   Server URL: http://$COMPUTER_IP:8000/api/sensor-data"
echo ""
echo "🖥️  Laptop Configuration:"
echo "   Backend URL: http://localhost:8000"
echo "   Network IP: $COMPUTER_IP"
echo ""
echo "✅ Checklist:"
echo "   [ ] Backend is running (uvicorn)"
echo "   [ ] Using --host 0.0.0.0 (not 127.0.0.1)"
echo "   [ ] Port 8000 is open in firewall"
echo "   [ ] Phone and laptop on same WiFi"
echo "   [ ] Correct URL entered in phone app"
echo ""
echo "🔧 Common Issues:"
echo "   1. Firewall blocking port 8000"
echo "      → Run: netsh advfirewall firewall add rule name=\"FastAPI\" dir=in action=allow protocol=TCP localport=8000"
echo ""
echo "   2. Backend not listening on all interfaces"
echo "      → Must use: --host 0.0.0.0 (not --host 127.0.0.1)"
echo ""
echo "   3. Different WiFi networks"
echo "      → Both devices must be on same WiFi"
echo ""
echo "   4. Corporate WiFi blocking"
echo "      → Try mobile hotspot instead"
echo ""
echo "📖 For more help, see: PHONE_CONNECTION_GUIDE.md"
echo ""
