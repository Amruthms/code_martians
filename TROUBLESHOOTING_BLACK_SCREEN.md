# 🐛 Troubleshooting: "Mobile Sensors" Page Goes Black

## Problem
The "Mobile Sensors" page in the Code Martians dashboard loads briefly and then goes black.

## Root Cause
The backend server is **not running** or **not accessible**. The React component tries to fetch sensor data from `http://localhost:8000/api/sensor-data/stats` and when it fails, the page appears black.

---

## ✅ Quick Fix

### Solution 1: Start the Backend (Easiest)

**Windows:**
```cmd
cd d:\Ronith\devhck\code_martians
start-sensor-integration.bat
```

**Mac/Linux/Git Bash:**
```bash
cd /d/Ronith/devhck/code_martians
bash start-sensor-integration.sh
```

### Solution 2: Manual Start

**Step 1: Start Backend**
```bash
cd d:/Ronith/devhck/code_martians/backend

# Activate virtual environment
source .venv/Scripts/activate  # Git Bash
# OR
.venv\Scripts\activate.bat     # CMD
# OR
.venv\Scripts\Activate.ps1     # PowerShell

# Start server
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

**Step 2: Verify Backend is Running**
```bash
# Open a new terminal and test:
curl http://localhost:8000/stats
```

Expected response:
```json
{"total": 0, "by_type": {}, "safety_score": 100}
```

**Step 3: Refresh the Frontend**
- Go to `http://localhost:5173`
- Click "Mobile Sensors" in menu
- Should now show the sensor data page (even if no data yet)

---

## 🔍 What Changed (Error Handling Improvements)

I've updated the `SensorData.tsx` component to show proper error messages instead of a black screen:

### Before:
- Page loads → API call fails → Page goes black → No error message

### After:
- Page loads → API call fails → Shows red error card with:
  - Error message
  - Troubleshooting steps
  - "Retry Connection" button

---

## 🎯 Expected Behavior

### When Backend is NOT Running:
You'll see a red error card:
```
⚠️ Connection Error

Failed to connect to backend

Troubleshooting:
1. Make sure the backend server is running
2. Check that it's accessible at: http://localhost:8000
3. Run: cd backend && uvicorn app:app --host 0.0.0.0 --port 8000 --reload
4. Test endpoint: curl http://localhost:8000/stats

[Retry Connection]
```

### When Backend IS Running (No Sensor Data Yet):
You'll see:
```
📱 No Sensor Data Yet

Waiting for mobile devices to send sensor data...

To connect your phone:
1. Open the Flutter sensor app on your phone
2. Update the server URL to: http://YOUR_IP:8000/api/sensor-data
3. Tap "Start Streaming" to begin sending data
```

### When Backend IS Running (With Sensor Data):
You'll see live sensor readings:
- Accelerometer readings
- Gyroscope readings
- GPS location
- Ambient light levels
- etc.

---

## 🧪 Testing the Fix

### Test 1: Backend Not Running
```bash
# Make sure backend is stopped (Ctrl+C if running)
# Open browser: http://localhost:5173
# Click "Mobile Sensors"
# Should see: Red error card with instructions
```

### Test 2: Backend Running
```bash
# Start backend
cd backend
uvicorn app:app --host 0.0.0.0 --port 8000 --reload

# Open browser: http://localhost:5173
# Click "Mobile Sensors"
# Should see: "No Sensor Data Yet" card
```

### Test 3: With Sensor Data
```bash
# Backend already running
# Send test data:
curl -X POST http://localhost:8000/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2025-11-07T10:30:00.000Z",
    "accelerometer": {"x": 0.1, "y": 9.8, "z": 0.2},
    "ambientLight": 450.0
  }'

# Refresh browser
# Should see: Sensor data cards with readings
```

---

## 🛠️ Files Modified

### `frontend/src/components/pages/SensorData.tsx`
**Changes:**
1. Added `error` state to track connection errors
2. Added `setError()` in catch blocks
3. Added error display UI with:
   - Error message
   - Troubleshooting steps
   - Retry button

**Before:**
```typescript
const [loading, setLoading] = useState(true);
// No error state

try {
  // fetch data
} catch (error) {
  console.error('Error fetching sensor data:', error);
  setLoading(false); // Just stop loading
}
```

**After:**
```typescript
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

try {
  setError(null); // Clear previous errors
  // fetch data
} catch (error) {
  console.error('Error fetching sensor data:', error);
  setError(error instanceof Error ? error.message : 'Failed to connect to backend');
  setLoading(false);
}
```

---

## 🚀 Prevention

To avoid this issue in the future:

1. **Always start the backend before accessing the dashboard:**
   ```bash
   # Use the startup script:
   ./start-sensor-integration.bat  # Windows
   # OR
   bash start-sensor-integration.sh  # Mac/Linux
   ```

2. **Check backend is running:**
   ```bash
   curl http://localhost:8000/stats
   ```

3. **Keep backend terminal open:**
   - Don't close the terminal running uvicorn
   - You should see logs like:
     ```
     INFO:     Uvicorn running on http://0.0.0.0:8000
     INFO:     Application startup complete
     ```

4. **Monitor backend logs:**
   - When phone sends data, you'll see:
     ```
     [SENSOR] Received sensor data: Accel=True, Gyro=True...
     ```

---

## 📝 Summary

**Problem:** Black screen on Mobile Sensors page  
**Cause:** Backend not running → API fetch fails → No error handling  
**Solution:** Start backend + Improved error handling  
**Result:** Clear error messages instead of black screen  

**Quick Start:**
```bash
# Run this:
cd d:\Ronith\devhck\code_martians
start-sensor-integration.bat

# Or manually:
cd backend
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

---

## ✅ Success Checklist

- [ ] Backend running on port 8000
- [ ] Can access `http://localhost:8000/stats`
- [ ] Frontend shows sensor page (not black screen)
- [ ] If no data: Shows "No Sensor Data Yet" message
- [ ] If connection error: Shows red error card with instructions
- [ ] "Retry Connection" button works

Now the page will never go black - it will always show helpful error messages! 🎉
