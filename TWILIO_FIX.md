# 🔧 Twilio Configuration Fix - Variable Name Mismatch

## Problem Identified

When calling "Site Manager" on EC2, the error message was:
```
"Twilio not configured"
```

## Root Cause

**Variable name mismatch** between `.env` file and `backend/app.py`:

### What was in `.env`:
```env
EMERGENCY_FIRE_NUMBER=+919480677558      ❌ Wrong
EMERGENCY_AMBULANCE_NUMBER=+919480677558  ❌ Wrong
EMERGENCY_POLICE_NUMBER=+919480677558     ❌ Wrong
EMERGENCY_MANAGER_NUMBER=+919480677558    ❌ Wrong
```

### What `app.py` expects (line 838-850):
```python
EMERGENCY_CONTACTS: Dict[ContactName, Dict[str, str]] = {
    "fire": {
        "to": os.getenv("EMERGENCY_FIRE", "+47110110"),     ✅ Correct
    },
    "ambulance": {
        "to": os.getenv("EMERGENCY_AMBULANCE", "+47110113"), ✅ Correct
    },
    "police": {
        "to": os.getenv("EMERGENCY_POLICE", "+47110112"),   ✅ Correct
    },
    "manager": {
        "to": os.getenv("EMERGENCY_MANAGER", "+4712345678"), ✅ Correct
    }
}
```

**The `_NUMBER` suffix was causing the variables to be undefined!**

## Solution Applied

### 1. Fixed Root `.env` File
```env
# ✅ CORRECT variable names (no _NUMBER suffix)
EMERGENCY_FIRE=+916361986326
EMERGENCY_AMBULANCE=+917204200386
EMERGENCY_POLICE=+918618464709
EMERGENCY_MANAGER=+919342739999
```

### 2. Updated `docker-compose.yml`
```yaml
backend:
  environment:
    # ✅ CORRECT variable names
    - EMERGENCY_FIRE=${EMERGENCY_FIRE}
    - EMERGENCY_AMBULANCE=${EMERGENCY_AMBULANCE}
    - EMERGENCY_POLICE=${EMERGENCY_POLICE}
    - EMERGENCY_MANAGER=${EMERGENCY_MANAGER}
```

### 3. Updated `.env.example` (Template)
Added comprehensive Twilio configuration section with correct variable names.

## Deploy to EC2

### Option 1: Automated Script
```bash
./deploy-twilio-fix.sh
```

This script will:
1. ✅ Pull latest code
2. ✅ Create correct `.env` file
3. ✅ Restart backend container
4. ✅ Verify Twilio initialization

### Option 2: Manual Deployment

#### Step 1: SSH into EC2
```bash
ssh ubuntu@54.206.93.52
cd code_martians
```

#### Step 2: Pull Latest Code
```bash
git pull origin main
```

#### Step 3: Update `.env` File
```bash
nano .env
```

**Paste this (with correct variable names):**
```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_CALLER_NUMBER=+1234567890

# Application Base URL
BASE_URL=http://54.206.93.52:8000

# Emergency Contact Numbers (NO _NUMBER suffix!)
EMERGENCY_FIRE=+1234567890
EMERGENCY_AMBULANCE=+1234567890
EMERGENCY_POLICE=+1234567890
EMERGENCY_MANAGER=+1234567890
```

Save with `Ctrl+O`, `Enter`, `Ctrl+X`

#### Step 4: Restart Backend
```bash
docker-compose restart backend
```

#### Step 5: Verify Configuration
```bash
# Check backend logs
docker-compose logs backend | grep -i twilio

# Should see:
# [INFO] Twilio client initialized. Caller: +12174396550
```

#### Step 6: Test Emergency Call
```bash
curl -X POST http://54.206.93.52:8000/voice/call/ \
  -H "Content-Type: application/json" \
  -d '{
    "emergency_type": "Manager",
    "location": "Test Zone",
    "description": "Test emergency call"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "call_sid": "CAxxxx...",
  "status": "queued",
  "to": "+919342739999",
  "message": "Emergency call initiated"
}
```

## Verification Checklist

After deployment, verify:

- [ ] Backend logs show: `[INFO] Twilio client initialized`
- [ ] Environment variables loaded correctly:
  ```bash
  docker-compose exec backend env | grep EMERGENCY
  ```
  Should show:
  ```
  EMERGENCY_FIRE=+916361986326
  EMERGENCY_AMBULANCE=+917204200386
  EMERGENCY_POLICE=+918618464709
  EMERGENCY_MANAGER=+919342739999
  ```
- [ ] Test call to Site Manager returns `"success": true`
- [ ] Phone rings at +919342739999

## Key Takeaways

1. **Variable Names Must Match Exactly**
   - `app.py` uses `EMERGENCY_FIRE` (no suffix)
   - `.env` must use same name
   - Docker Compose passes variable as-is

2. **Check Backend Logs**
   - Look for `[INFO] Twilio client initialized` on startup
   - If you see `[WARN] Twilio not configured`, env vars missing

3. **Restart Required**
   - After changing `.env`, always restart backend:
     ```bash
     docker-compose restart backend
     ```

4. **Test Each Contact Type**
   - Fire: `"emergency_type": "Fire"`
   - Ambulance: `"emergency_type": "Ambulance"`
   - Police: `"emergency_type": "Police"`
   - Manager: `"emergency_type": "Manager"`

## Troubleshooting

### Still getting "Twilio not configured"?

1. **Check `.env` exists in project root:**
   ```bash
   ls -la .env
   ```

2. **Verify variable names (no _NUMBER suffix):**
   ```bash
   cat .env | grep EMERGENCY
   ```

3. **Check container environment:**
   ```bash
   docker-compose exec backend env | grep TWILIO
   docker-compose exec backend env | grep EMERGENCY
   ```

4. **Restart with fresh env:**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

5. **Check app.py startup logs:**
   ```bash
   docker-compose logs backend | head -50
   ```

### Calls not going through?

1. **Verify phone numbers are E.164 format:**
   ```
   +[country code][number]
   +919342739999  ✅ Correct
   9342739999     ❌ Missing country code
   ```

2. **For Twilio trial accounts:**
   - All numbers must be verified at: https://www.twilio.com/console/phone-numbers/verified
   - Both caller and recipient numbers

3. **Check Twilio account:**
   - Sufficient balance
   - Phone numbers are active
   - Account not suspended

## Files Changed

1. ✅ `.env` - Updated variable names
2. ✅ `docker-compose.yml` - Updated environment variables
3. ✅ `.env.example` - Added Twilio section with correct names
4. ✅ `deploy-twilio-fix.sh` - Automated deployment script
5. ✅ `TWILIO_FIX.md` - This documentation

## Next Steps

1. Run deployment script or deploy manually
2. Test all 4 emergency contact types
3. Monitor Twilio console for call logs: https://console.twilio.com/
4. Update phone numbers as needed (in `.env` only)

## References

- **Backend Code:** `backend/app.py` lines 836-851
- **Docker Compose:** `docker-compose.yml` lines 39-48
- **Twilio Setup Guide:** `TWILIO_SETUP.md`
- **Twilio Console:** https://console.twilio.com/
