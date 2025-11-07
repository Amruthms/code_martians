# 🔧 Phone Connection Troubleshooting Guide

## ❌ Problem: Phone Cannot Send Data to Laptop

If your phone cannot send sensor data to the laptop, follow these steps systematically:

---

## 📋 Pre-Flight Checklist

Before troubleshooting, verify:

- ✅ **Backend is running** on laptop
- ✅ **Phone and laptop on same WiFi network**
- ✅ **Correct IP address** entered in phone app
- ✅ **Port 8000 not blocked** by firewall

---

## 🔍 Step-by-Step Diagnosis

### Step 1: Start the Backend Server

**Open a NEW terminal/command prompt and run:**

```bash
# Navigate to backend directory
cd D:/Ronith/devhck/code_martians/backend

# Start the server (IMPORTANT: use 0.0.0.0, not 127.0.0.1)
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

**✅ Expected Output:**
```
INFO:     Will watch for changes in these directories: ['D:\\Ronith\\devhck\\code_martians\\backend']
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using WatchFiles
INFO:     Started server process [67890]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
Model pre-loaded successfully with 10 classes: Hardhat, Mask, NO-Hardhat, ...
```

**⚠️ Warning Signs:**
- If you see `Uvicorn running on http://127.0.0.1:8000` → **WRONG!** Phone cannot reach 127.0.0.1
- If server shuts down immediately → Check for port conflicts or errors
- If you see NumPy warnings → **Ignore them** (not critical)

**👉 Leave this terminal window OPEN! Do NOT close it!**

---

### Step 2: Find Your Computer's IP Address

Your phone needs your laptop's **local network IP address** (not localhost).

**Run the diagnostic script:**

```bash
# Windows
test-phone-connection.bat

# Or manually:
ipconfig | findstr "IPv4"
```

**Example Output:**
```
IPv4 Address. . . . . . . . . . . : 10.130.181.39
```

**📝 Write down this IP!** Example: `10.130.181.39`

---

### Step 3: Test Backend from Laptop

Before testing from phone, verify backend works locally:

```bash
# Test the stats endpoint
curl http://localhost:8000/stats

# Should return something like:
# {"total_entries":0,"sensor_coverage":{},"latest_timestamp":null}
```

**✅ If this works:** Backend is running correctly!  
**❌ If this fails:** Backend is not running or has errors

---

### Step 4: Test Backend from Your Network IP

This is the **critical test** - can the backend be reached via your network IP?

```bash
# Replace 10.130.181.39 with YOUR IP from Step 2
curl http://10.130.181.39:8000/stats
```

**✅ If this works:** Backend is accessible on network!  
**❌ If this fails:** Firewall is likely blocking port 8000

---

### Step 5: Configure Windows Firewall

If Step 4 failed, you need to allow port 8000 through the firewall.

**Option A: Run the automated script (REQUIRES ADMINISTRATOR)**

```bash
# Right-click and select "Run as Administrator"
add-firewall-rule.bat
```

**Option B: Add firewall rule manually**

1. Open Command Prompt **as Administrator**
2. Run this command:

```bash
netsh advfirewall firewall add rule name="FastAPI Sensor Backend" dir=in action=allow protocol=TCP localport=8000
```

**Option C: Use Windows Defender Firewall UI**

1. Open **Windows Defender Firewall with Advanced Security**
2. Click **Inbound Rules** → **New Rule**
3. Select **Port** → Next
4. Select **TCP**, enter **8000** → Next
5. Select **Allow the connection** → Next
6. Check all profiles (Domain, Private, Public) → Next
7. Name: "FastAPI Sensor Backend" → Finish

**After adding the rule, repeat Step 4 to verify!**

---

### Step 6: Verify Same WiFi Network

**On Laptop:**
```bash
ipconfig | findstr "Wireless"
```

**On Phone:**
- Open **WiFi Settings**
- Check the network name

**👉 Both must show the SAME network name!**

**Common Issues:**
- ❌ Laptop on Ethernet, Phone on WiFi
- ❌ Laptop on WiFi-5G, Phone on WiFi-2.4G (different bands)
- ❌ Corporate WiFi with device isolation enabled

**Solution:** Connect both to the same network or use **phone's mobile hotspot**.

---

### Step 7: Test from Phone Browser

**Before using the Flutter app**, test connectivity from your phone's web browser:

1. Open **Chrome/Safari** on your phone
2. Navigate to: `http://YOUR_IP:8000/stats` (replace with your IP)
   
   Example: `http://10.130.181.39:8000/stats`

**✅ Expected Result:**
```json
{"total_entries":0,"sensor_coverage":{},"latest_timestamp":null}
```

**❌ If you see:**
- "This site can't be reached" → Firewall blocking or wrong IP
- "Connection refused" → Backend not running
- "Timeout" → Different WiFi networks or device isolation

---

### Step 8: Configure Flutter App

Once Step 7 works, configure the Flutter app:

1. Open the sensor app on your phone
2. Go to **Settings** (gear icon)
3. Enter the **Server URL**: `http://YOUR_IP:8000/api/sensor-data`
   
   Example: `http://10.130.181.39:8000/api/sensor-data`

4. Click **Save**
5. Return to main screen
6. Toggle sensors ON

---

### Step 9: Monitor Backend Logs

Watch the backend terminal for incoming requests:

**✅ Successful Request:**
```
INFO:     10.130.181.XXX:XXXXX - "POST /api/sensor-data HTTP/1.1" 200 OK
Received sensor data: {'accelerometer': {'x': 0.12, 'y': 9.81, 'z': 0.03}, ...}
```

**❌ No Logs Appear:**
- Backend not receiving requests
- Check firewall or network connectivity

**❌ Error Logs:**
```
INFO:     10.130.181.XXX:XXXXX - "POST /api/sensor-data HTTP/1.1" 422 Unprocessable Entity
```
- Phone sending invalid data format

---

### Step 10: View Data on Website

1. Open **Chrome/Edge** on laptop
2. Navigate to: `http://localhost:5173` (or your frontend URL)
3. Click **"Mobile Sensors"** in sidebar
4. You should see real-time sensor data!

**Toggle "Auto Refresh" ON** to see live updates every second.

---

## 🚨 Common Issues & Solutions

### Issue 1: "Connection Refused"

**Symptoms:**
- Phone app shows "Failed to connect"
- Browser shows "Connection refused"

**Solutions:**
✅ Backend is not running → Start it (Step 1)  
✅ Wrong port → Verify using 8000, not 5173 or other ports  
✅ Backend crashed → Check terminal for error messages

---

### Issue 2: "This Site Can't Be Reached"

**Symptoms:**
- Long timeout before error
- Phone browser cannot load the URL

**Solutions:**
✅ Wrong IP address → Re-check with `ipconfig` (Step 2)  
✅ Different WiFi networks → Connect both to same network (Step 6)  
✅ Firewall blocking → Add firewall rule (Step 5)  
✅ Corporate WiFi blocking → Use mobile hotspot instead

---

### Issue 3: "422 Unprocessable Entity"

**Symptoms:**
- Backend receives request but returns error 422

**Solutions:**
✅ Update Flutter app to latest code (check `api_service.dart`)  
✅ Verify JSON payload format matches backend expectations  
✅ Check backend logs for validation errors

---

### Issue 4: Backend Keeps Shutting Down

**Symptoms:**
- Server starts then immediately stops
- "Application shutdown complete" in logs

**Solutions:**
✅ **DO NOT** run backend with automated scripts - use manual terminal  
✅ Close other processes using port 8000: `netstat -ano | findstr :8000`  
✅ NumPy warnings are OK - ignore them if model loads successfully  
✅ Check for Python errors in terminal output

---

### Issue 5: Data Not Showing on Website

**Symptoms:**
- Backend receives data (logs show 200 OK)
- Website shows "No sensor data available"

**Solutions:**
✅ Refresh the browser page  
✅ Toggle "Auto Refresh" ON  
✅ Click "Retry" button if error shown  
✅ Check browser console for JavaScript errors (F12)  
✅ Verify frontend is running: `http://localhost:5173`

---

## 🧪 Quick Test Commands

Run these from laptop terminal to diagnose issues:

```bash
# 1. Check if backend is running
curl http://localhost:8000/stats

# 2. Check if backend accessible on network
curl http://YOUR_IP:8000/stats

# 3. Test sensor data submission
curl -X POST http://localhost:8000/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{"timestamp":"2024-01-01T00:00:00.000Z","accelerometer":{"x":0.1,"y":9.8,"z":0.2},"ambientLight":450.0}'

# 4. View recent sensor data
curl http://localhost:8000/api/sensor-data/latest?count=5

# 5. Check port 8000 status
netstat -an | findstr :8000
```

---

## 📱 Phone App Troubleshooting

### Verify App Configuration

Open `my_sensor_app/lib/services/api_service.dart` and check:

```dart
String _serverUrl = 'http://YOUR_IP:8000/api/sensor-data';  // ✅ Correct
String _serverUrl = 'http://localhost:8000/api/sensor-data';  // ❌ Wrong!
String _serverUrl = 'https://...';  // ❌ Wrong! (use http, not https)
```

### Check Phone Permissions

Android: Settings → Apps → Sensor App → Permissions
- ✅ Location (for GPS)
- ✅ Physical activity (for sensors)

iOS: Settings → Privacy → Sensor App
- ✅ Location Services
- ✅ Motion & Fitness

---

## 🌐 Network Configuration

### Using Mobile Hotspot (Recommended for Testing)

If WiFi doesn't work, use your phone as a hotspot:

1. **On Phone:**
   - Enable **Mobile Hotspot**
   - Note the network name and password

2. **On Laptop:**
   - Connect to phone's hotspot
   - Run `ipconfig` to get new IP
   - Start backend with new IP

3. **On Phone App:**
   - Since phone IS the hotspot, use laptop's hotspot IP
   - Enter: `http://NEW_IP:8000/api/sensor-data`

### Corporate/University WiFi

Some networks block device-to-device communication (AP isolation).

**Solutions:**
- Use mobile hotspot instead
- Connect both devices via Ethernet
- Request IT to allow port 8000
- Use VPN/ZeroTier for virtual network

---

## 📊 Monitoring

### Backend Logs

Keep backend terminal visible to see:
- Incoming POST requests
- Sensor data values
- Fall detection alerts
- Error messages

### Frontend Logs

Open browser console (F12) to see:
- API fetch attempts
- JavaScript errors
- Network request status

### Phone App Logs

Check Flutter debug console for:
- HTTP request attempts
- Response codes
- Connection errors

---

## ✅ Success Checklist

When everything works, you should see:

**Backend Terminal:**
```
INFO:     10.130.181.XXX:XXXXX - "POST /api/sensor-data HTTP/1.1" 200 OK
Received sensor data: {'accelerometer': {'x': 0.12, 'y': 9.81, 'z': 0.03}, ...}
```

**Phone App:**
- ✅ All sensors showing values
- ✅ Green "Connected" status
- ✅ Data sending every second

**Website Dashboard:**
- ✅ Real-time sensor values updating
- ✅ Statistics showing sensor coverage
- ✅ GPS location on map (if enabled)
- ✅ No error messages

---

## 🆘 Still Not Working?

If you've tried everything and it still doesn't work:

1. **Run the full diagnostic:**
   ```bash
   test-phone-connection.bat
   ```

2. **Check all outputs carefully**

3. **Look for these specific indicators:**
   - Backend status: Running/Not running
   - Port 8000 listening: Yes/No
   - Firewall rule: Exists/Missing
   - IP accessibility: Reachable/Unreachable
   - Endpoint test: Success/Failed

4. **Take a screenshot of:**
   - Backend terminal output
   - `ipconfig` output
   - Phone WiFi settings
   - Test script results

5. **Common final issues:**
   - Antivirus blocking port (temporarily disable to test)
   - VPN interfering (disconnect VPN)
   - Windows network set to "Public" (change to "Private")

---

## 📚 Related Documentation

- **PHONE_CONNECTION_GUIDE.md** - Basic setup instructions
- **MOBILE_SENSOR_INTEGRATION.md** - Full integration details
- **SENSOR_QUICKSTART.md** - Quick start guide
- **TROUBLESHOOTING_BLACK_SCREEN.md** - Frontend issues

---

## 🔄 Reset Everything

If all else fails, start fresh:

1. **Stop backend:** Ctrl+C in terminal
2. **Restart backend:** 
   ```bash
   cd D:/Ronith/devhck/code_martians/backend
   python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
   ```
3. **Restart phone app:** Force close and reopen
4. **Clear phone app cache:** Settings → Server URL → Enter fresh
5. **Restart laptop WiFi:** Disable/Enable WiFi adapter
6. **Get new IP:** Run `ipconfig` again

---

**Last Updated:** 2024
**Tested On:** Windows 10/11, Android/iOS
