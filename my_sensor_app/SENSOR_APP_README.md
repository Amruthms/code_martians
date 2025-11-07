# Sensor Data Collector App

A Flutter mobile application that collects sensor data from your phone and sends it to a web server.

## Features

This app collects data from the following sensors:
- **Accelerometer** - Motion and orientation
- **Gyroscope** - Rotation and angular velocity
- **Magnetometer** - Compass direction
- **GPS** - Location, altitude, speed, accuracy
- **Ambient Light Sensor** - Light levels in lux
- **Proximity Sensor** - Object proximity (if available)
- **Barometer** - Atmospheric pressure (if available)

## Functionality

- **Real-time sensor monitoring** - View current sensor readings in the app
- **Single data point** - Send individual sensor snapshots to your server
- **Continuous streaming** - Automatically send sensor data every second
- **Configurable endpoint** - Set your custom server URL
- **Data persistence** - Server URL is saved locally

## Installation

1. Install dependencies:
```bash
flutter pub get
```

2. Run the app:
```bash
flutter run
```

## Configuration

1. Open the app
2. Enter your server URL in the "Server Configuration" section
3. Click "Update URL" to save
4. The URL will be persisted across app restarts

## Usage

### Send Single Data Point
Click the "Send Single Data Point" button to capture current sensor readings and send them once to your server.

### Start Streaming
Click "Start Streaming" to automatically send sensor data every second. Click "Stop Streaming" to stop.

### View Sensor Data
The app displays real-time sensor readings at the bottom of the screen.

## API Integration

The app sends sensor data to your server as JSON via HTTP POST requests.

### Data Format

```json
{
  "timestamp": "2025-11-07T10:30:00.000Z",
  "accelerometer": {
    "x": 0.12,
    "y": -0.05,
    "z": 9.81
  },
  "gyroscope": {
    "x": 0.01,
    "y": -0.02,
    "z": 0.00
  },
  "magnetometer": {
    "x": 23.5,
    "y": -12.3,
    "z": 45.6
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

### Server Endpoint

Your server should accept POST requests at the configured endpoint. Example with Node.js/Express:

```javascript
app.post('/api/sensor-data', (req, res) => {
  const sensorData = req.body;
  console.log('Received sensor data:', sensorData);
  
  // Process the data (save to database, etc.)
  
  res.status(200).json({ success: true });
});
```

## Permissions

The app requires the following permissions:

### Android
- Internet access
- Location (GPS)
- Camera
- Microphone
- Network state

### iOS
- Location when in use
- Camera
- Microphone
- Motion sensors

All permissions are requested at runtime when needed.

## Project Structure

```
lib/
├── main.dart                    # Main app UI
├── models/
│   └── sensor_data.dart        # Data models
├── services/
│   ├── sensor_service.dart     # Sensor data collection
│   └── api_service.dart        # HTTP API communication
```

## Dependencies

- `sensors_plus` - Accelerometer, gyroscope, magnetometer
- `geolocator` - GPS location
- `light` - Ambient light sensor
- `camera` - Camera access
- `permission_handler` - Runtime permissions
- `http` - HTTP requests
- `shared_preferences` - Local storage

## Troubleshooting

### Sensors not working
- Ensure permissions are granted
- Check that your device has the required sensors
- Some sensors may not be available on all devices

### Data not sending
- Verify your server URL is correct and accessible
- Check your internet connection
- Ensure your server accepts POST requests
- Check server logs for errors

### GPS not working
- Enable location services on your device
- Grant location permissions to the app
- Test outdoors for better GPS signal

## Notes

- Not all sensors are available on all devices
- Sensors that are unavailable will show "No data"
- Battery usage may be high during continuous streaming
- GPS accuracy depends on environment and device

## License

This project is open source and available for use and modification.
