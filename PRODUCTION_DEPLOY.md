# Production Deployment Guide - EC2

## Server Details
- **Public IP:** 54.206.93.52
- **Frontend Port:** 3000 → http://54.206.93.52:3000
- **Backend Port:** 8000 → http://54.206.93.52:8000
- **API Docs:** http://54.206.93.52:8000/docs

## Quick Deploy

### Option 1: Automated Script (Recommended)

```bash
# On EC2 instance
cd ~/code_martians
chmod +x deploy-production.sh
./deploy-production.sh
```

This script will:
1. Pull latest code from GitHub
2. Stop existing containers
3. Clean up old images
4. Build all images with production settings
5. Start services
6. Wait for health checks
7. Display access URLs

### Option 2: Manual Deployment

```bash
# On EC2 instance
cd ~/code_martians

# Pull latest code
git pull origin main

# Stop existing containers
docker-compose down

# Clean up (if low on disk space)
docker system prune -f

# Build images
docker-compose build --no-cache

# Start services
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f
```

## Pre-Deployment Checklist

### 1. Check Disk Space
```bash
df -h
# Need at least 5GB free
```

If low on space:
```bash
# Remove unused Docker resources
docker system prune -af --volumes

# Check again
df -h
```

### 2. Check Git Status
```bash
cd ~/code_martians
git status
git log --oneline -5
```

### 3. Verify Latest Code
Ensure these commits are present:
- `b076ed6` - Stream upload endpoint (upload_stream, remote_stream)
- `e12febc` - Removed device mounts
- `6583750` - CPU-only PyTorch
- `d72b256` - Model pre-loading optimizations

## Post-Deployment Verification

### 1. Check Service Status
```bash
docker-compose ps
```

All services should show "Up" and "healthy":
```
NAME                STATUS              PORTS
yolov8-model        Up                  
safety-backend      Up (healthy)        0.0.0.0:8000->8000/tcp
safety-frontend     Up (healthy)        0.0.0.0:3000->80/tcp
```

### 2. Test Backend Health
```bash
curl http://54.206.93.52:8000/stats
curl http://54.206.93.52:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "uptime_seconds": 123
}
```

### 3. Test Frontend
```bash
curl -I http://54.206.93.52:3000
```

Should return `HTTP/1.1 200 OK`

### 4. Check Backend Logs
```bash
docker-compose logs backend | grep -i "model\|error\|startup"
```

Look for:
- `[INFO] Model pre-loaded successfully!`
- `YOLOv8 classes loaded`
- No ERROR messages

### 5. Test Camera Streaming (From Local Machine)

On your local Arch Linux machine:
```bash
# Test if backend accepts stream
ffmpeg -f v4l2 -i /dev/video0 -t 5 -f mpjpeg \
  -content_type "multipart/x-mixed-replace;boundary=frame" \
  http://54.206.93.52:8000/upload_stream
```

Then access processed stream:
```bash
# In browser or curl
curl http://54.206.93.52:8000/remote_stream
```

## Troubleshooting

### Backend Not Starting

**Check logs:**
```bash
docker-compose logs backend
```

**Common issues:**
1. **Out of memory:** Reduce workers in backend/Dockerfile (change `--workers 2` to `--workers 1`)
2. **Model not loading:** Check volume mount `docker volume inspect yolo_model_data`
3. **Port conflict:** Check if port 8000 is in use `sudo netstat -tlnp | grep 8000`

### Frontend Not Accessible

**Check nginx logs:**
```bash
docker-compose logs frontend
```

**Common issues:**
1. **Build failed:** Check if `/app/build` exists: `docker-compose exec frontend ls -la /usr/share/nginx/html`
2. **Port conflict:** Check if port 3000 is in use `sudo netstat -tlnp | grep 3000`
3. **CORS errors:** Verify VITE_API_URL in docker-compose.yml

### Camera Stream Not Working

**Verify endpoint exists:**
```bash
curl -X POST http://54.206.93.52:8000/upload_stream
```

Should return `405 Method Not Allowed` (means endpoint exists but needs multipart data)

**Check if backend has latest code:**
```bash
docker-compose exec backend grep -n "upload_stream" /app/app.py
```

Should return line numbers. If not, rebuild:
```bash
docker-compose down
docker-compose build --no-cache backend
docker-compose up -d
```

### Out of Disk Space

**Check usage:**
```bash
df -h
docker system df
```

**Clean up:**
```bash
# Remove unused images, containers, volumes
docker system prune -af --volumes

# Remove old logs
docker-compose exec backend rm -rf /app/logs/*
```

**If still not enough space:**
1. Stop services: `docker-compose down`
2. Remove ALL images: `docker image rm $(docker image ls -q) -f`
3. Rebuild: `docker-compose build`
4. Start: `docker-compose up -d`

### Services Keep Restarting

**Check health status:**
```bash
docker-compose ps
docker inspect safety-backend | grep -A 10 Health
```

**Check resource usage:**
```bash
docker stats
```

**If high CPU/Memory:**
- Backend: Reduce `PROCESS_EVERY_N_FRAMES` to 10 or 15
- Backend: Reduce workers to 1
- Frontend: Should be low (<100MB RAM)

## Monitoring

### Real-time Logs
```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100
```

### Resource Usage
```bash
# Live stats
docker stats

# Disk usage
docker system df -v
```

### Network Testing
```bash
# Test backend from EC2
curl -I http://localhost:8000

# Test backend from outside
curl -I http://54.206.93.52:8000

# Test frontend from EC2
curl -I http://localhost:3000

# Test frontend from outside
curl -I http://54.206.93.52:3000
```

## Rollback

If deployment fails:

```bash
# Stop current containers
docker-compose down

# Go back to previous commit
git log --oneline -10
git checkout <previous-commit-hash>

# Rebuild and restart
docker-compose build
docker-compose up -d

# Or go back to main branch
git checkout main
git pull
```

## Security Notes

1. **Firewall Rules:** Ensure EC2 security group allows:
   - Port 3000 (Frontend)
   - Port 8000 (Backend)
   - Port 22 (SSH)

2. **HTTPS:** Currently using HTTP. For production, add:
   - SSL certificate (Let's Encrypt)
   - Nginx reverse proxy
   - Update URLs to https://

3. **Non-root Users:** All containers run as non-root users (appuser, nginx, modeluser)

## Maintenance

### Update Dependencies

**Backend:**
```bash
cd backend
# Update requirements.txt
docker-compose build --no-cache backend
```

**Frontend:**
```bash
cd frontend
npm update
# Update package.json in git
docker-compose build --no-cache frontend
```

### Update Model

```bash
# Copy new best.pt to YOLOv8-Helmet-Vest-Detection-main/Testing_yolov8_model/
docker-compose down yolov8-model backend
docker-compose build yolov8-model backend
docker-compose up -d
```

### Backup Data

```bash
# Backup logs
tar -czf logs-backup-$(date +%Y%m%d).tar.gz backend/logs/

# Backup frames
tar -czf frames-backup-$(date +%Y%m%d).tar.gz backend/frames/

# Backup Docker volumes
docker run --rm -v yolo_model_data:/data -v $(pwd):/backup \
  alpine tar -czf /backup/yolo-model-$(date +%Y%m%d).tar.gz /data
```

## Access URLs Summary

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://54.206.93.52:3000 | Web Dashboard |
| Backend API | http://54.206.93.52:8000 | REST API |
| API Docs | http://54.206.93.52:8000/docs | Swagger UI |
| Health Check | http://54.206.93.52:8000/stats | Service Status |
| Video Stream | http://54.206.93.52:8000/video | Live Detection |
| Upload Stream | http://54.206.93.52:8000/upload_stream | Receive Camera (POST) |
| Remote Stream | http://54.206.93.52:8000/remote_stream | Processed Video |

## Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Review this guide
3. Check main documentation: `README.md`, `DOCKER_GUIDE.md`
4. Check Dockerfile architecture: `DOCKERFILE_ARCHITECTURE.md`
