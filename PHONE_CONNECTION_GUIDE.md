# 📱 How to Connect Your Phone to Code Martians

## Your Specific Configuration

**Your Computer's IP:** `10.130.181.39`  
**Server URL for Phone:** `http://10.130.181.39:8000/api/sensor-data`

---

## 🔌 Connection Architecture

```
Phone App (WiFi) ──HTTP POST──> Computer Backend ──Data──> React Dashboard
     📱                              💻                        🖥️
192.168.x.x              http://10.130.181.39:8000      http://localhost:5173
```

---

## 📋 Setup Instructions

### 1️⃣ Make Sure Both Devices Are on Same WiFi

**Phone:** Go to Settings → WiFi → Connected to same network as computer  
**Computer:** Already connected (you're using it now)

⚠️ **Important:** Both must be on the **same WiFi network**. Public/corporate WiFi may block device-to-device communication.

---

### 2️⃣ Start the Backend Server

Open terminal and run:

```bash
cd d:/Ronith/devhck/code_martians/backend

# Make sure you have a virtual environment
python -m venv .venv
source .venv/Scripts/activate  # Windows Git Bash
# OR
.venv\Scripts\activate.bat     # Windows CMD
# OR
.venv\Scripts\Activate.ps1     # PowerShell

# Install requirements (if not done already)
pip install -r requirements.txt

# Start server on ALL network interfaces (not just localhost)
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

**Critical:** Must use `--host 0.0.0.0` so phone can connect!

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

### 3️⃣ Test Connection from Computer

Open a new terminal and test:

```bash
curl http://10.130.181.39:8000/stats
```

Expected response:
```json
{"total": 0, "by_type": {}, "safety_score": 100}
```

If this works, your server is accessible on the network! ✅

---

### 4️⃣ Configure Flutter App on Phone

1. **Open** the Flutter sensor app on your phone
2. **Find** the "Server URL" text field (should be at the top)
3. **Clear** the existing URL
4. **Type** exactly:
   ```
   http://10.130.181.39:8000/api/sensor-data
   ```
5. **Tap** "Update URL" button
6. **Wait** for confirmation message

---

### 5️⃣ Start Streaming Data

1. **Tap** "Start Streaming" button (should turn red)
2. **Watch** the data count increase
3. Phone should show: "Data sent successfully (1)", "(2)", etc.

---

### 6️⃣ View Data on Dashboard

1. **Open browser** on your computer
2. **Navigate to:** `http://localhost:5173`
3. **Click** "Mobile Sensors" in the left navigation menu
4. **Enable** "Auto Refresh" toggle
5. **Watch** live sensor data appear!

---

## 🧪 Troubleshooting

### ❌ "Failed to send data" on Phone

**Check 1: Are both on same WiFi?**
```bash
# On computer, verify IP:
ipconfig
# Look for "Wireless LAN adapter Wi-Fi" → IPv4 Address
```

**Check 2: Is backend running?**
```bash
# Test from computer:
curl http://10.130.181.39:8000/stats
```

**Check 3: Is port open?**
```bash
# Windows - Open port in firewall:
netsh advfirewall firewall add rule name="FastAPI Sensor Backend" dir=in action=allow protocol=TCP localport=8000
```

**Check 4: Try from phone's browser**
- Open Chrome/Safari on phone
- Go to: `http://10.130.181.39:8000/stats`
- Should see JSON response
- If this works, the app can connect too!

---

### ❌ "Connection Refused"

**Solution:** Backend must use `0.0.0.0` not `127.0.0.1`:

```bash
# ✅ Correct (allows external connections):
uvicorn app:app --host 0.0.0.0 --port 8000

# ❌ Wrong (only localhost):
uvicorn app:app --host 127.0.0.1 --port 8000
```

---

### ❌ "No sensor data yet" on Dashboard

**Check backend logs:**
Look for lines like:
```
[SENSOR] Received sensor data: Accel=True, Gyro=True, GPS=True, Light=450.0
```

If you see this, data is arriving! Just refresh the dashboard.

**Test endpoint manually:**
```bash
curl http://localhost:8000/api/sensor-data/stats
```

Should show:
```json
{"total_entries": 42, "sensor_coverage": {...}}
```

---

### ❌ Phone Can't Find Server

**Reason:** Computer's IP changed (DHCP reassignment)

**Solution:** Re-check IP address:
```bash
ipconfig | findstr "IPv4"
```

Update the URL in the phone app with new IP.

---

## 🔐 Network Security Note

### Corporate/Public WiFi
- May have AP Isolation (devices can't talk to each other)
- May block ports
- May require VPN

**Solution:** Use a mobile hotspot:
1. Enable hotspot on phone
2. Connect computer to phone's hotspot
3. Find computer's new IP: `ipconfig`
4. Update URL in app to new IP
5. Now phone (hotspot host) can reach computer!

---

## 📊 What Data Is Sent?

Every second, the phone sends this JSON:

```json
{
  "timestamp": "2025-11-07T10:30:00.000Z",
  "accelerometer": {
    "x": 0.123,    // Forward/backward tilt (m/s²)
    "y": 9.801,    // Gravity (m/s²)
    "z": 0.456     // Side-to-side tilt (m/s²)
  },
  "gyroscope": {
    "x": 0.001,    // Pitch rotation (rad/s)
    "y": 0.002,    // Roll rotation (rad/s)
    "z": 0.003     // Yaw rotation (rad/s)
  },
  "magnetometer": {
    "x": 25.4,     // Magnetic field X (µT)
    "y": -10.2,    // Magnetic field Y (µT)
    "z": 45.6      // Magnetic field Z (µT)
  },
  "gps": {
    "latitude": 59.9139,      // Degrees
    "longitude": 10.7522,     // Degrees
    "altitude": 25.0,         // Meters
    "speed": 0.0,             // m/s
    "accuracy": 10.0          // Meters
  },
  "ambientLight": 450.0,      // Lux
  "pressure": 1013.25         // hPa (hectopascals)
}
```

This data is sent via HTTP POST to:
```
http://10.130.181.39:8000/api/sensor-data
```

---

## 🎯 Quick Verification Checklist

Before connecting phone, verify:

- [ ] Backend running: `curl http://10.130.181.39:8000/stats` works
- [ ] Port open: Firewall allows port 8000
- [ ] Same WiFi: Phone and computer on same network
- [ ] Using 0.0.0.0: Backend started with `--host 0.0.0.0`
- [ ] Correct IP: Using `10.130.181.39` (your current IP)

---

## 🚀 Full Test Command

Run this on your computer to test everything:

```bash
# 1. Check IP
ipconfig | findstr "IPv4"

# 2. Start backend
cd d:/Ronith/devhck/code_martians/backend
source .venv/Scripts/activate
uvicorn app:app --host 0.0.0.0 --port 8000 --reload

# 3. In another terminal, test endpoint
curl http://10.130.181.39:8000/stats

# 4. Send test sensor data
curl -X POST http://10.130.181.39:8000/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2025-11-07T10:30:00.000Z",
    "accelerometer": {"x": 0.1, "y": 9.8, "z": 0.2},
    "ambientLight": 450.0
  }'

# 5. Verify data received
curl http://10.130.181.39:8000/api/sensor-data/latest?count=1
```

If all these work, your phone will be able to connect! ✅

---

## 📱 In-App Configuration

When you open the Flutter app, you'll see this screen:

```
┌─────────────────────────────────┐
│  Sensor Data Collector          │
├─────────────────────────────────┤
│                                  │
│  Server Configuration            │
│  ┌───────────────────────────┐  │
│  │ Server URL                │  │
│  │ http://10.130.181.39:8000│  │ ← Type this
│  │ /api/sensor-data          │  │
│  └───────────────────────────┘  │
│  [Update URL]                    │
│                                  │
│  Status: Ready                   │
│  Data sent: 0                    │
│                                  │
│  [Send Single Data Point]        │
│  [Start Streaming]               │
│                                  │
│  Current Sensor Readings         │
│  Accelerometer: X:0.1 Y:9.8 ...  │
│  Gyroscope: X:0.0 Y:0.0 ...      │
│  GPS: Lat:59.91 Lon:10.75 ...    │
│  Light: 450 lux                  │
└─────────────────────────────────┘
```

---

## 🎉 Success Indicators

**Phone App:**
- ✅ Status: "Data sent successfully (N)"
- ✅ Data count increasing
- ✅ Button shows "Stop Streaming" (red)

**Backend Terminal:**
- ✅ Logs: `[SENSOR] Received sensor data: Accel=True, Gyro=True...`

**Dashboard:**
- ✅ Shows latest readings
- ✅ Statistics update
- ✅ GPS shows on map

---

## 💡 Pro Tips

1. **Battery Life:** Streaming continuously drains battery. Use "Send Single Data Point" for testing.

2. **Data Usage:** Uses minimal data (~1KB per second). Safe on mobile data if needed.

3. **Permissions:** App needs:
   - Location (for GPS)
   - Motion sensors (usually automatic)
   - Internet (obviously!)

4. **Multiple Phones:** Can connect multiple phones simultaneously! Each sends data to the same backend.

5. **Background Mode:** On Android, make sure battery optimization doesn't kill the app when screen is off.

---

## 🆘 Still Having Issues?

1. **Ping test from phone:**
   - Install "Network Tools" app on phone
   - Ping `10.130.181.39`
   - Should get response

2. **Try phone's browser:**
   - Open `http://10.130.181.39:8000/stats`
   - If works → app will work
   - If doesn't work → network issue

3. **Check backend logs:**
   - Should see connection attempts
   - Look for CORS errors

4. **Restart everything:**
   - Stop backend (Ctrl+C)
   - Close phone app
   - Start backend again
   - Open phone app fresh
   - Reconfigure URL

---

Your specific connection string:
```
http://10.130.181.39:8000/api/sensor-data
```

Good luck! 🚀
