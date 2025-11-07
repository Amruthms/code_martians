# Twilio Emergency Calling Setup Guide

## Overview
This guide explains how to configure Twilio emergency calling for the safety monitoring system.

## Configuration Method
Twilio credentials are configured via a `.env` file that is **NOT** committed to version control for security.

## Local Setup

1. **Create `.env` file** in the project root:
```bash
# Copy the example file
cp .env.example .env

# Edit with your actual credentials
nano .env
```

2. **Add your Twilio credentials** to `.env`:
```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_CALLER_NUMBER=+1234567890

# Application Base URL
BASE_URL=http://localhost:8000

# Emergency Contact Numbers
EMERGENCY_FIRE_NUMBER=+1234567890
EMERGENCY_AMBULANCE_NUMBER=+1234567890
EMERGENCY_POLICE_NUMBER=+1234567890
EMERGENCY_MANAGER_NUMBER=+1234567890
```

3. **Start services**:
```bash
docker-compose up -d
```

Docker Compose will automatically load the environment variables from `.env`.

## EC2 Production Setup

### Step 1: Transfer `.env` file to EC2
```bash
# From your local machine
scp .env ubuntu@54.206.93.52:/home/ubuntu/code_martians/.env
```

**OR** create it manually on EC2:
```bash
# SSH into EC2
ssh ubuntu@54.206.93.52

# Navigate to project
cd code_martians

# Create .env file
nano .env
```

Paste the configuration (make sure `BASE_URL=http://54.206.93.52:8000` for EC2):
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_CALLER_NUMBER=+1234567890
BASE_URL=http://54.206.93.52:8000
EMERGENCY_FIRE_NUMBER=+1234567890
EMERGENCY_AMBULANCE_NUMBER=+1234567890
EMERGENCY_POLICE_NUMBER=+1234567890
EMERGENCY_MANAGER_NUMBER=+1234567890
```

### Step 2: Pull Latest Code
```bash
cd code_martians
git pull origin main
```

### Step 3: Rebuild Backend Container
```bash
# Rebuild backend (it now expects Twilio env vars)
docker-compose up -d --build backend
```

### Step 4: Rebuild Frontend Container
```bash
# Rebuild frontend to fix localhost URLs
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Step 5: Verify Configuration
```bash
# Check backend logs for Twilio initialization
docker-compose logs backend | grep -i twilio

# Check environment variables are loaded
docker-compose exec backend env | grep TWILIO
```

## How It Works

### Docker Compose
The `docker-compose.yml` file references environment variables:
```yaml
backend:
  environment:
    - TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
    - TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
    - TWILIO_CALLER_NUMBER=${TWILIO_CALLER_NUMBER}
    - BASE_URL=${BASE_URL:-http://54.206.93.52:8000}
    - EMERGENCY_FIRE_NUMBER=${EMERGENCY_FIRE_NUMBER}
    - EMERGENCY_AMBULANCE_NUMBER=${EMERGENCY_AMBULANCE_NUMBER}
    - EMERGENCY_POLICE_NUMBER=${EMERGENCY_POLICE_NUMBER}
    - EMERGENCY_MANAGER_NUMBER=${EMERGENCY_MANAGER_NUMBER}
```

### Variable Substitution
- `${VAR_NAME}` - Reads from `.env` file
- `${VAR_NAME:-default}` - Uses default if not set
- Docker Compose automatically loads `.env` from project root

## Testing Emergency Calls

### Test Fire Emergency
```bash
curl -X POST http://54.206.93.52:8000/voice/call/ \
  -H "Content-Type: application/json" \
  -d '{
    "emergency_type": "Fire",
    "location": "Warehouse Zone A",
    "description": "Test emergency call"
  }'
```

### Expected Response
```json
{
  "success": true,
  "call_sid": "CA...",
  "status": "queued",
  "to": "+919480677558",
  "message": "Emergency call initiated"
}
```

### Check Logs
```bash
docker-compose logs -f backend
```

## Troubleshooting

### Issue: "Twilio credentials not configured"
**Cause:** `.env` file missing or not loaded

**Fix:**
```bash
# Verify .env exists
ls -la .env

# Verify variables are set
docker-compose config | grep TWILIO
```

### Issue: Calls not going through
**Cause:** Invalid Twilio credentials or phone numbers

**Fix:**
1. Verify credentials at https://console.twilio.com/
2. Check phone numbers are E.164 format: `+919480677558`
3. Verify Twilio account has sufficient balance

### Issue: Wrong BASE_URL in TwiML
**Cause:** BASE_URL environment variable incorrect

**Fix:**
```bash
# Update .env
nano .env
# Change BASE_URL=http://54.206.93.52:8000

# Restart backend
docker-compose restart backend
```

## Security Best Practices

1. **Never commit `.env`** - Already in `.gitignore`
2. **Use `.env.example`** - Template without real credentials
3. **Rotate credentials** - If accidentally exposed, regenerate in Twilio console
4. **Restrict file permissions** on EC2:
   ```bash
   chmod 600 .env
   ```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `TWILIO_ACCOUNT_SID` | Twilio Account SID | `AC1b38b...` |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | `5f5e40a...` |
| `TWILIO_CALLER_NUMBER` | Your Twilio phone number | `+12568594638` |
| `BASE_URL` | Backend URL for TwiML callbacks | `http://54.206.93.52:8000` |
| `EMERGENCY_FIRE_NUMBER` | Fire department contact | `+919480677558` |
| `EMERGENCY_AMBULANCE_NUMBER` | Ambulance/medical contact | `+919480677558` |
| `EMERGENCY_POLICE_NUMBER` | Police contact | `+919480677558` |
| `EMERGENCY_MANAGER_NUMBER` | Site manager contact | `+919480677558` |

## Next Steps

After completing this setup:
1. ✅ Twilio configured via Docker environment variables
2. ⏳ Rebuild frontend on EC2 (for localhost URL fix)
3. ⏳ Test emergency calling from web UI
4. ⏳ Monitor call logs in Twilio console

## References
- Twilio Console: https://console.twilio.com/
- Docker Compose Environment: https://docs.docker.com/compose/environment-variables/
- Project Repository: https://github.com/Amruthms/code_martians
