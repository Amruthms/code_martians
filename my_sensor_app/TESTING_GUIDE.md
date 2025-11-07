# Testing Guide

## Pre-flight Checklist

Before testing, ensure you have:
- ✅ Flutter installed (`flutter doctor` should pass)
- ✅ Either Node.js or Python installed
- ✅ A physical device or emulator
- ✅ Both devices on the same network (for local testing)

---

## Test 1: Server Setup

### Node.js Server Test

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Expected output:
```
🚀 Sensor data server running on http://localhost:3000
📊 Dashboard: http://localhost:3000
📡 API endpoint: http://localhost:3000/api/sensor-data
```

4. Test the server:
   - Open browser: `http://localhost:3000`
   - You should see the dashboard with 0 entries

### Python Server Test

1. Install dependencies:
```bash
pip install flask flask-cors
```

2. Start the server:
```bash
python example_server.py
```

3. Expected output:
```
🚀 Sensor data server running on http://localhost:3000
📊 Dashboard: http://localhost:3000
📡 API endpoint: http://localhost:3000/api/sensor-data
```

4. Test the server:
   - Open browser: `http://localhost:3000`
   - You should see the dashboard

---

## Test 2: Mobile App Build

### Install Dependencies

```bash
cd my_sensor_app
flutter pub get
```

Expected: All dependencies downloaded successfully

### Run on Android

```bash
flutter run -d android
```

Expected:
- App builds successfully
- App launches on device/emulator
- No errors in console

### Run on iOS (Mac only)

```bash
flutter run -d ios
```

Expected:
- App builds successfully
- App launches on simulator
- No errors in console

---

## Test 3: Sensor Data Collection

### Test Accelerometer

1. Launch the app
2. Look at "Current Sensor Readings" section
3. Tilt your device
4. Expected: Accelerometer values change in real-time

### Test Gyroscope

1. Rotate your device
2. Expected: Gyroscope values change

### Test Magnetometer

1. Rotate device horizontally (like a compass)
2. Expected: Magnetometer values change

### Test GPS

1. Ensure location services are enabled
2. Grant location permission when prompted
3. Expected: GPS coordinates appear
4. Note: May take 30-60 seconds to get first fix

### Test Light Sensor

1. Cover phone's light sensor with your hand
2. Expected: Light value decreases
3. Expose to bright light
4. Expected: Light value increases

---

## Test 4: Server Communication

### Find Your IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.1.100)

**Mac/Linux:**
```bash
ifconfig | grep "inet "
```

### Configure App

1. In the app, enter server URL:
   ```
   http://YOUR_IP:3000/api/sensor-data
   ```
   Example: `http://192.168.1.100:3000/api/sensor-data`

2. Click "Update URL"
3. Expected: Status shows "Server URL updated"

### Test Single Send

1. Click "Send Single Data Point"
2. Expected:
   - App shows "Data sent successfully!"
   - Server console shows received data
   - Dashboard counter increases by 1

### Test Streaming

1. Click "Start Streaming"
2. Expected:
   - Button turns red and shows "Stop Streaming"
   - Status updates every second
   - Dashboard auto-refreshes
   - Counter increases continuously

3. Click "Stop Streaming"
4. Expected:
   - Streaming stops
   - Status shows "Streaming stopped"

---

## Test 5: Dashboard Features

### Test Auto-Refresh

1. Start streaming from app
2. Watch the dashboard
3. Expected:
   - Data updates every 2 seconds
   - "Last Update" time changes
   - Latest data displays

### Test Manual Refresh

1. Click "🔄 Refresh" button
2. Expected:
   - Data updates immediately
   - Statistics update

### Test Clear History

1. Click "🗑️ Clear History"
2. Confirm
3. Expected:
   - Total entries resets to 0
   - Latest data section clears

### Test Download Data

1. Collect some data (10+ entries)
2. Click "💾 Download Data"
3. Expected:
   - JSON file downloads
   - File contains all collected data

---

## Test 6: Error Handling

### Test Wrong Server URL

1. Enter incorrect URL: `http://999.999.999.999:3000/api/sensor-data`
2. Click "Send Single Data Point"
3. Expected: "Failed to send data" message

### Test Server Offline

1. Stop the server
2. Try to send data from app
3. Expected: Error message appears

### Test No Internet

1. Turn off WiFi on phone
2. Try to send data
3. Expected: Error message

---

## Test 7: Permissions

### Android Permissions Test

Expected permissions to be requested:
- ✅ Location (for GPS)
- ✅ Camera (if you add camera features)
- ✅ Microphone (if you add audio features)

### iOS Permissions Test

Expected permission dialogs:
- ✅ Location
- ✅ Motion sensors
- ✅ Camera (if implemented)
- ✅ Microphone (if implemented)

---

## Test 8: Battery & Performance

### Battery Test

1. Start streaming for 5 minutes
2. Check battery usage in device settings
3. Expected: Moderate battery usage (varies by device)

### Performance Test

1. Stream for 10 minutes
2. Check app responsiveness
3. Expected:
   - App remains responsive
   - No crashes
   - Smooth UI updates

---

## Test 9: Data Validation

### Check Data Format

1. Send data from app
2. Download JSON from dashboard
3. Verify structure matches:

```json
{
  "timestamp": "ISO 8601 format",
  "accelerometer": { "x": number, "y": number, "z": number },
  "gyroscope": { "x": number, "y": number, "z": number },
  "magnetometer": { "x": number, "y": number, "z": number },
  "gps": {
    "latitude": number,
    "longitude": number,
    "altitude": number,
    "speed": number,
    "accuracy": number
  },
  "ambientLight": number,
  "proximity": null,
  "pressure": null
}
```

### Check Value Ranges

Expected ranges:
- **Accelerometer**: ±20 m/s² (typically around ±10)
- **Gyroscope**: ±35 rad/s (typically around ±2)
- **Magnetometer**: ±100 μT (varies by location)
- **GPS Latitude**: -90 to 90
- **GPS Longitude**: -180 to 180
- **Light**: 0 to 100,000+ lux

---

## Test 10: Edge Cases

### Test App Restart

1. Stream data
2. Close app completely
3. Reopen app
4. Expected:
   - Server URL persisted
   - Streaming stopped (must restart)

### Test Server Restart

1. Stream data
2. Restart server
3. Expected:
   - Previous data lost (in-memory only)
   - New data accepted
   - App continues sending

### Test Network Switch

1. Stream on WiFi
2. Switch to mobile data (update URL if needed)
3. Expected:
   - Data continues sending (if URL accessible)

---

## Common Issues & Solutions

### Issue: App won't connect to server

**Solutions:**
- ✅ Check both devices on same network
- ✅ Verify IP address is correct
- ✅ Ensure server is running
- ✅ Check firewall settings
- ✅ Use `http://` not `https://`

### Issue: No GPS data

**Solutions:**
- ✅ Enable location services
- ✅ Grant location permission
- ✅ Test outdoors (better GPS signal)
- ✅ Wait 30-60 seconds for GPS fix

### Issue: Light sensor shows "No data"

**Solutions:**
- ✅ Not all devices have light sensor
- ✅ Check device specifications
- ✅ Try on different device

### Issue: High battery drain

**Solutions:**
- ✅ Increase streaming interval (modify code)
- ✅ Use "Send Single Data Point" instead
- ✅ Stop streaming when not needed

### Issue: Dashboard not updating

**Solutions:**
- ✅ Hard refresh browser (Ctrl+F5)
- ✅ Check browser console for errors
- ✅ Verify server is receiving data

---

## Success Criteria

✅ All sensors collecting data
✅ Data successfully sent to server
✅ Dashboard displaying received data
✅ No errors in console
✅ App remains stable during streaming
✅ Data format is correct
✅ Permissions properly requested

---

## Performance Benchmarks

Expected performance:
- **Data send frequency**: 1 per second
- **Data size**: ~500-1000 bytes per message
- **Network latency**: <100ms (local network)
- **Battery drain**: ~5-10% per hour (varies)
- **Memory usage**: <100MB
- **CPU usage**: <15%

---

## Next Steps After Testing

1. ✅ Verify all tests pass
2. ✅ Note any device-specific issues
3. ✅ Document sensor availability by device
4. ✅ Consider implementing missing features
5. ✅ Plan for production deployment
6. ✅ Add authentication if needed
7. ✅ Implement data persistence
8. ✅ Add data visualization

---

## Automated Testing (Future Enhancement)

Consider adding:
- Unit tests for sensor service
- Integration tests for API service
- Widget tests for UI
- End-to-end tests for full flow

---

## Troubleshooting Resources

- Flutter Docs: https://flutter.dev/docs
- Sensor Plus Plugin: https://pub.dev/packages/sensors_plus
- Geolocator Plugin: https://pub.dev/packages/geolocator
- Project Documentation: See SENSOR_APP_README.md

---

Happy Testing! 🧪✅
