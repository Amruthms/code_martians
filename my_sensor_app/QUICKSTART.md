# Quick Start Guide - Sensor Data Collector

## 📱 Mobile App Setup

### 1. Install Dependencies
```bash
cd my_sensor_app
flutter pub get
```

### 2. Run on Device/Emulator

For Android:
```bash
flutter run -d android
```

For iOS:
```bash
flutter run -d ios
```

For Chrome (limited sensors):
```bash
flutter run -d chrome
```

### 3. Configure the App

1. Launch the app on your device
2. In the "Server Configuration" section, enter your server URL
   - For local testing: `http://YOUR_COMPUTER_IP:3000/api/sensor-data`
   - For production: `https://your-domain.com/api/sensor-data`
3. Click "Update URL"

**Note:** Replace `YOUR_COMPUTER_IP` with your actual computer's local IP address (e.g., 192.168.1.100)

---

## 🖥️ Server Setup

### Option 1: Node.js Server

#### Install Dependencies
```bash
npm install express body-parser cors
```

#### Run the Server
```bash
node example_server.js
```

The server will start on `http://localhost:3000`

### Option 2: Python Flask Server

#### Install Dependencies
```bash
pip install flask flask-cors
```

#### Run the Server
```bash
python example_server.py
```

The server will start on `http://localhost:3000`

---

## 🔧 Configuration

### Finding Your Computer's IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.1.100)

**Mac/Linux:**
```bash
ifconfig
# or
ip addr show
```

### Mobile App Configuration

Use the format:
```
http://YOUR_IP:3000/api/sensor-data
```

Example:
```
http://192.168.1.100:3000/api/sensor-data
```

---

## 📊 Using the Dashboard

1. Open a web browser
2. Navigate to `http://localhost:3000` (or your server address)
3. You'll see:
   - Total entries received
   - Last update time
   - Latest sensor data
   - Controls to refresh, clear, or download data

---

## 🚀 Usage

### Send Single Data Point
1. Open the app
2. Click "Send Single Data Point"
3. Check the dashboard to see the received data

### Stream Continuous Data
1. Click "Start Streaming"
2. Data will be sent every second
3. Watch the dashboard update in real-time
4. Click "Stop Streaming" when done

---

## 🐛 Troubleshooting

### App can't connect to server
- ✅ Ensure your phone and computer are on the same Wi-Fi network
- ✅ Check that the server is running
- ✅ Verify the IP address is correct
- ✅ Make sure port 3000 is not blocked by firewall
- ✅ Use `http://` not `https://` for local testing

### Sensors showing "No data"
- ✅ Grant all permissions to the app
- ✅ Some sensors may not be available on your device
- ✅ For GPS, ensure location services are enabled
- ✅ For light sensor, make sure the app has sensor permissions

### Cannot run on iOS
- ✅ You need a Mac with Xcode installed
- ✅ Or use Android/web instead

### Data not appearing on dashboard
- ✅ Check browser console for errors (F12)
- ✅ Verify server logs show incoming requests
- ✅ Try clicking "Refresh" on the dashboard

---

## 📱 Testing Without a Physical Device

You can test with the Android emulator, but note:
- GPS will need to be simulated
- Some sensors may not work in emulator
- Physical device recommended for full functionality

To send fake GPS location in Android emulator:
1. Click the "..." button in emulator toolbar
2. Go to "Location" tab
3. Enter coordinates and click "Send"

---

## 🔒 Security Notes

For production use:
- Use HTTPS instead of HTTP
- Add authentication to your API
- Validate and sanitize incoming data
- Use environment variables for configuration
- Consider rate limiting

---

## 📦 Project Structure

```
my_sensor_app/
├── lib/
│   ├── main.dart              # Main UI
│   ├── models/
│   │   └── sensor_data.dart   # Data models
│   └── services/
│       ├── sensor_service.dart # Sensor collection
│       └── api_service.dart    # HTTP communication
├── example_server.js          # Node.js server
├── example_server.py          # Python server
└── SENSOR_APP_README.md       # Full documentation
```

---

## 🎯 Next Steps

1. ✅ Run the server
2. ✅ Launch the app
3. ✅ Configure server URL
4. ✅ Start collecting sensor data!
5. 📊 View data on dashboard
6. 💾 Download collected data

---

## 📞 Need Help?

Check the full documentation in `SENSOR_APP_README.md` for:
- Detailed API documentation
- Data format specifications
- Advanced configuration options
- Additional troubleshooting tips
