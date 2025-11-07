# Mobile Sensor Integration Guide

## Overview

The Code Martians Construction Safety System now integrates real-time mobile sensor data from phones and tablets. This allows workers on-site to use their personal devices as additional safety monitoring sensors.

## Architecture

```
┌─────────────────┐
│  Flutter App    │  (Phone/Tablet)
│  Sensor Stream  │
└────────┬────────┘
         │ HTTP POST
         │ /api/sensor-data
         ▼
┌─────────────────────┐
│  FastAPI Backend    │  http://localhost:8000
│  Code Martians API  │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  React Dashboard    │  http://localhost:5173
│  Live Sensor View   │
└─────────────────────┘
```

## Features

### Sensor Data Collected
- **Accelerometer**: Detects falls, sudden movements, impacts (3-axis in m/s²)
- **Gyroscope**: Monitors device orientation and rotation (3-axis in rad/s)
- **Magnetometer**: Compass data for navigation (3-axis in µT)
- **GPS**: Real-time location tracking (latitude, longitude, altitude, speed, accuracy)
- **Ambient Light**: Environmental lighting conditions (lux)
- **Proximity**: Object detection near device (optional)
- **Pressure**: Atmospheric pressure (hPa)

### Safety Features
- **Fall Detection**: Automatically alerts when acceleration exceeds 2g (potential fall)
- **Location Tracking**: Real-time GPS coordinates of all workers
- **Environmental Monitoring**: Light levels, pressure changes
- **Historical Data**: Stores last 1000 sensor readings

## Setup Instructions

### 1. Backend Setup (Already Complete)

The backend has been updated with the following endpoints:

```
POST   /api/sensor-data          - Receive real-time sensor data
POST   /api/sensor-data/batch    - Receive batch sensor data
GET    /api/sensor-data/latest   - Get latest sensor readings
GET    /api/sensor-data/all      - Get all stored sensor data
GET    /api/sensor-data/stats    - Get statistics
DELETE /api/sensor-data          - Clear sensor data history
```

### 2. Frontend Setup

A new component has been created at `frontend/src/components/pages/SensorData.tsx`

To add it to your navigation, update your routing:

```typescript
// In your App.tsx or router configuration
import SensorData from './components/pages/SensorData';

// Add to your routes:
<Route path="/sensor-data" element={<SensorData />} />
```

### 3. Flutter App Configuration

#### Option A: Using Your Computer's Backend (Development)

1. Find your computer's IP address:
   - Windows: Open Command Prompt, run `ipconfig`, look for IPv4 Address
   - Mac/Linux: Open Terminal, run `ifconfig` or `ip addr`, look for inet address
   - Example: `192.168.1.100`

2. Open the Flutter app on your phone

3. Update the Server URL to:
   ```
   http://YOUR_COMPUTER_IP:8000/api/sensor-data
   ```
   Example: `http://192.168.1.100:8000/api/sensor-data`

4. Make sure your phone and computer are on the same WiFi network

5. Tap "Start Streaming"

#### Option B: Using Production Server

1. Deploy your backend to a cloud server (AWS, Azure, DigitalOcean, etc.)

2. Update the Server URL in the app to:
   ```
   https://your-domain.com/api/sensor-data
   ```

3. Start streaming

## Testing the Integration

### Test 1: Single Data Point

1. Open the Flutter app
2. Configure the server URL
3. Tap "Send Single Data Point"
4. Check the backend logs for: `[SENSOR] Received sensor data`
5. Open the React dashboard at `http://localhost:5173/sensor-data`
6. You should see the latest reading

### Test 2: Continuous Streaming

1. In the Flutter app, tap "Start Streaming"
2. Watch the data count increase
3. In the React dashboard, enable "Auto Refresh"
4. You should see real-time updates every second

### Test 3: Fall Detection

1. Start streaming sensor data
2. Simulate a fall by shaking the phone vigorously
3. Check the backend logs for: `[ALERT] Potential fall detected!`
4. The alert will appear in the main alerts feed

## API Reference

### POST /api/sensor-data

**Request Body:**
```json
{
  "timestamp": "2025-11-07T10:30:00.000Z",
  "accelerometer": {
    "x": 0.123,
    "y": 9.801,
    "z": 0.456
  },
  "gyroscope": {
    "x": 0.001,
    "y": 0.002,
    "z": 0.003
  },
  "magnetometer": {
    "x": 25.4,
    "y": -10.2,
    "z": 45.6
  },
  "gps": {
    "latitude": 59.9139,
    "longitude": 10.7522,
    "altitude": 25.0,
    "speed": 0.0,
    "accuracy": 10.0
  },
  "ambientLight": 450.0,
  "proximity": null,
  "pressure": 1013.25
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sensor data received successfully",
  "timestamp": 1699358400000,
  "entries_stored": 142
}
```

### GET /api/sensor-data/latest?count=10

**Response:**
```json
{
  "data": [
    {
      "timestamp": "2025-11-07T10:30:00.000Z",
      "server_received_at": 1699358400000,
      "accelerometer": { "x": 0.123, "y": 9.801, "z": 0.456 },
      // ... more sensor data
    }
  ],
  "count": 10,
  "total_stored": 142
}
```

### GET /api/sensor-data/stats

**Response:**
```json
{
  "total_entries": 142,
  "sensor_coverage": {
    "accelerometer": 142,
    "gyroscope": 142,
    "magnetometer": 140,
    "gps": 135,
    "light": 142
  },
  "latest_timestamp": "2025-11-07T10:30:00.000Z",
  "server_uptime": 1699358400
}
```

## Network Configuration

### Firewall Rules

If you're having connection issues, make sure port 8000 is open:

**Windows Firewall:**
```powershell
netsh advfirewall firewall add rule name="FastAPI Backend" dir=in action=allow protocol=TCP localport=8000
```

**Linux (ufw):**
```bash
sudo ufw allow 8000/tcp
```

### CORS Configuration

The backend is configured to accept requests from:
- http://localhost:5173 (Vite dev server)
- http://localhost:3000 (Production frontend)
- http://localhost:3001

If you need to add more origins, update `backend/app.py`:

```python
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://YOUR_IP:5173").split(",")
```

## Troubleshooting

### Issue: "Failed to send data"

**Solution:**
1. Check that the backend is running: `curl http://localhost:8000/stats`
2. Verify the server URL in the app is correct
3. Make sure phone and computer are on the same network
4. Check firewall settings
5. Try pinging your computer from the phone

### Issue: "Connection refused"

**Solution:**
1. Make sure backend is running with `0.0.0.0` not `127.0.0.1`
2. Use your computer's actual IP address, not `localhost`
3. Check that FastAPI is listening on all interfaces:
   ```bash
   uvicorn app:app --host 0.0.0.0 --port 8000
   ```

### Issue: "No sensor data appearing on dashboard"

**Solution:**
1. Check browser console for errors
2. Verify API_URL in frontend `.env` file
3. Check Network tab in browser dev tools
4. Try manually fetching: `curl http://localhost:8000/api/sensor-data/latest`

### Issue: "Sensor readings are all zeros"

**Solution:**
1. Grant sensor permissions in phone settings
2. Restart the Flutter app
3. Some sensors may not be available on all devices
4. Try on a different device

## Production Deployment

### Docker Compose

The sensor data endpoints are automatically included when you deploy with Docker Compose:

```bash
docker-compose up --build
```

Access points:
- Backend API: `http://localhost:8000`
- Frontend: `http://localhost:3000`

### Environment Variables

Add these to your `.env` file in the backend:

```env
# CORS origins (add your production domain)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,https://yourdomain.com

# Optional: Twilio for emergency alerts
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_CALLER_NUMBER=+1234567890
```

## Advanced Features

### Custom Alert Triggers

You can customize alert triggers in `backend/app.py`:

```python
# Example: Alert on high light levels (outdoor work in bright sun)
if sensor_data.ambientLight and sensor_data.ambientLight > 50000:
    ALERTS.append({
        "type": "HIGH_UV_EXPOSURE",
        "ts": int(time.time() * 1000),
        "meta": {"light_level": sensor_data.ambientLight}
    })
```

### GPS Geofencing

Add geofencing to alert when workers leave the site:

```python
# Define site boundaries
SITE_LAT = 59.9139
SITE_LON = 10.7522
SITE_RADIUS_METERS = 100

if sensor_data.gps:
    distance = calculate_distance(
        sensor_data.gps.latitude, 
        sensor_data.gps.longitude,
        SITE_LAT, SITE_LON
    )
    if distance > SITE_RADIUS_METERS:
        # Alert: Worker outside site boundary
        pass
```

### Data Persistence

Currently, sensor data is stored in memory (last 1000 entries). To persist data:

1. Add a database (PostgreSQL, MongoDB, etc.)
2. Store sensor data in the database
3. Query historical data for analytics

## Support

For issues or questions:
1. Check the backend logs: `backend/logs/`
2. Check the Flutter app logs in your IDE console
3. Review the browser console for frontend errors
4. File an issue on GitHub

## License

Part of the Code Martians Construction Safety System
