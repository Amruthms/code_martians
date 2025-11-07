# 📱 Mobile Sensor Integration - Quick Start

## ✅ What's Been Done

### Backend Changes
- ✅ Added `/api/sensor-data` endpoint to receive sensor data
- ✅ Added `/api/sensor-data/stats` endpoint for statistics
- ✅ Added fall detection (alerts when acceleration > 2g)
- ✅ In-memory storage for last 1000 sensor readings
- ✅ Full CORS configuration for cross-origin requests

### Frontend Changes
- ✅ Created `SensorData.tsx` component with real-time visualization
- ✅ Live sensor readings display (accelerometer, gyroscope, GPS, light, etc.)
- ✅ Auto-refresh capability
- ✅ Statistics dashboard

### Mobile App Changes
- ✅ Updated default server URL to `http://localhost:8000/api/sensor-data`
- ✅ Ready to connect to Code Martians backend

## 🚀 How to Use

### Step 1: Start the Backend
```bash
cd backend
source .venv/Scripts/activate  # Windows Git Bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### Step 2: Start the Frontend
```bash
cd frontend
npm run dev
```

### Step 3: Configure the Mobile App

1. Find your computer's IP address:
   ```bash
   # Windows
   ipconfig
   
   # Look for "IPv4 Address" - Example: 192.168.1.100
   ```

2. Open the Flutter sensor app on your phone

3. Enter the server URL:
   ```
   http://YOUR_IP:8000/api/sensor-data
   ```
   Example: `http://192.168.1.100:8000/api/sensor-data`

4. Tap "Update URL"

5. Tap "Start Streaming"

### Step 4: View the Data

1. Open browser: `http://localhost:5173`
2. Navigate to the Sensor Data page (add routing)
3. Enable "Auto Refresh"
4. Watch live sensor data!

## 📊 Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sensor-data` | POST | Send sensor data from phone |
| `/api/sensor-data/latest?count=10` | GET | Get latest N readings |
| `/api/sensor-data/all` | GET | Get all stored readings |
| `/api/sensor-data/stats` | GET | Get statistics |
| `/api/sensor-data` | DELETE | Clear history |

## 🔧 Quick Fixes

### Can't connect from phone?
```bash
# Make sure backend is on 0.0.0.0 (all interfaces)
uvicorn app:app --host 0.0.0.0 --port 8000

# Check firewall (Windows)
netsh advfirewall firewall add rule name="FastAPI" dir=in action=allow protocol=TCP localport=8000
```

### No data showing?
1. Check backend logs for `[SENSOR] Received sensor data`
2. Test endpoint: `curl http://localhost:8000/api/sensor-data/latest`
3. Check browser console for errors

### Phone and computer on same WiFi?
- Both must be on the same network
- Corporate/public WiFi may block device-to-device communication
- Try a mobile hotspot as alternative

## 📱 Sensor Data Format

The phone sends this JSON every second:

```json
{
  "timestamp": "2025-11-07T10:30:00.000Z",
  "accelerometer": {"x": 0.123, "y": 9.801, "z": 0.456},
  "gyroscope": {"x": 0.001, "y": 0.002, "z": 0.003},
  "magnetometer": {"x": 25.4, "y": -10.2, "z": 45.6},
  "gps": {
    "latitude": 59.9139,
    "longitude": 10.7522,
    "altitude": 25.0,
    "speed": 0.0,
    "accuracy": 10.0
  },
  "ambientLight": 450.0,
  "pressure": 1013.25
}
```

## 🎯 Next Steps

### Add to Navigation

In your frontend router, add:

```typescript
import SensorData from './components/pages/SensorData';

// Add route:
<Route path="/sensor-data" element={<SensorData />} />
```

### Test Fall Detection

1. Start streaming
2. Shake phone vigorously
3. Check backend logs for fall alert
4. Alert appears in main alerts feed

## 📖 Full Documentation

See `MOBILE_SENSOR_INTEGRATION.md` for complete documentation.

## 🆘 Need Help?

1. Check backend is running: `curl http://localhost:8000/stats`
2. Check phone can reach backend: `curl http://YOUR_IP:8000/stats`
3. Review backend logs
4. Check Flutter app console logs
5. Verify CORS settings in `backend/app.py`
