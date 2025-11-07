# System Architecture

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     MOBILE APP (Flutter)                     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              User Interface (main.dart)              │   │
│  │  • Server URL Configuration                          │   │
│  │  • Start/Stop Streaming                             │   │
│  │  • Send Single Data Point                           │   │
│  │  • Display Real-time Sensor Readings               │   │
│  └────────────────────┬────────────────────────────────┘   │
│                       │                                      │
│  ┌────────────────────▼────────────────────────────────┐   │
│  │          SensorService (sensor_service.dart)        │   │
│  │  • Accelerometer Stream                             │   │
│  │  • Gyroscope Stream                                │   │
│  │  • Magnetometer Stream                             │   │
│  │  • GPS Stream                                      │   │
│  │  • Light Sensor Stream                             │   │
│  └────────────────────┬────────────────────────────────┘   │
│                       │                                      │
│  ┌────────────────────▼────────────────────────────────┐   │
│  │         ApiService (api_service.dart)               │   │
│  │  • HTTP POST to Server                              │   │
│  │  • Batch Data Upload                               │   │
│  │  • Server URL Management                           │   │
│  └────────────────────┬────────────────────────────────┘   │
│                       │                                      │
└───────────────────────┼──────────────────────────────────────┘
                        │
                        │ JSON over HTTP/HTTPS
                        │
         ┌──────────────▼───────────────┐
         │       INTERNET/NETWORK        │
         └──────────────┬───────────────┘
                        │
        ┌───────────────▼────────────────┐
        │         WEB SERVER              │
        │  (Node.js or Python Flask)     │
        │                                 │
        │  ┌──────────────────────────┐  │
        │  │  API Endpoints            │  │
        │  │  • POST /api/sensor-data  │  │
        │  │  • GET  /api/sensor-data  │  │
        │  │  • DELETE /api/sensor-data│  │
        │  └──────────────────────────┘  │
        │                                 │
        │  ┌──────────────────────────┐  │
        │  │  Data Storage             │  │
        │  │  • In-Memory Array        │  │
        │  │  • JSON Files on Disk     │  │
        │  └──────────────────────────┘  │
        │                                 │
        │  ┌──────────────────────────┐  │
        │  │  Web Dashboard            │  │
        │  │  • Real-time Display      │  │
        │  │  • Download Data          │  │
        │  │  • Clear History          │  │
        │  └──────────────────────────┘  │
        └─────────────────────────────────┘
                        │
                        │
         ┌──────────────▼───────────────┐
         │       WEB BROWSER             │
         │  http://localhost:3000        │
         └───────────────────────────────┘
```

## Data Flow

### 1. Sensor Data Collection
```
Phone Sensors → SensorService → Local Storage (Latest Values)
     ↓
  Timer (1 sec)
     ↓
Get Current Data → Create JSON Payload
```

### 2. Data Transmission
```
JSON Payload → ApiService → HTTP POST → Server Endpoint
                                            ↓
                                     Server Receives
                                            ↓
                                   Store in Memory + File
                                            ↓
                                     Send Success Response
```

### 3. Data Visualization
```
Browser → GET /api/sensor-data/latest → Server
                                         ↓
                                    Retrieve Data
                                         ↓
                                    Send JSON Response
                                         ↓
                              Dashboard Updates Display
```

## JSON Data Structure

```json
{
  "timestamp": "2025-11-07T12:34:56.789Z",
  "accelerometer": {
    "x": 0.123,
    "y": -0.456,
    "z": 9.789
  },
  "gyroscope": {
    "x": 0.012,
    "y": -0.023,
    "z": 0.001
  },
  "magnetometer": {
    "x": 23.456,
    "y": -12.345,
    "z": 45.678
  },
  "gps": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "altitude": 10.5,
    "speed": 0.0,
    "accuracy": 5.0
  },
  "ambientLight": 250.0,
  "proximity": null,
  "pressure": null
}
```

## Component Responsibilities

### Mobile App
- ✅ Collect sensor data from device hardware
- ✅ Format data into JSON structure
- ✅ Send data to configured server URL
- ✅ Display real-time sensor readings
- ✅ Manage user preferences

### Server
- ✅ Receive HTTP POST requests
- ✅ Validate incoming data
- ✅ Store data in memory and files
- ✅ Serve web dashboard
- ✅ Provide API for data retrieval

### Dashboard
- ✅ Display received data
- ✅ Show statistics (count, last update)
- ✅ Provide controls (refresh, clear, download)
- ✅ Auto-refresh every 2 seconds

## Network Requirements

- Both devices must be on the same network (for local testing)
- Server must be accessible from mobile device
- Port 3000 must be open and not blocked by firewall
- Stable internet/WiFi connection required

## Security Considerations

⚠️ Current Implementation (Development):
- HTTP (unencrypted)
- No authentication
- No input validation
- Public endpoints

✅ Production Recommendations:
- Use HTTPS (TLS/SSL)
- Implement authentication (JWT, OAuth)
- Add input validation and sanitization
- Use rate limiting
- Implement CORS properly
- Add request logging
- Use environment variables for configuration
