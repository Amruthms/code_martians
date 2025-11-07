# 🐳 Docker Deployment Guide

Complete guide for deploying the AI-Powered Construction Safety System using Docker.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Services Overview](#services-overview)
4. [Environment Configuration](#environment-configuration)
5. [Docker Commands](#docker-commands)
6. [Troubleshooting](#troubleshooting)
7. [Production Deployment](#production-deployment)

## Prerequisites

### Required Software
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher

### Check Installation
```bash
docker --version
docker-compose --version
```

### Install Docker
- **Windows**: [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
- **Mac**: [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
- **Linux**: [Docker Engine for Linux](https://docs.docker.com/engine/install/)

## Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd devhack3
```

### 2. Ensure Model File Exists
```bash
# Check if YOLOv8 model exists in backend
ls backend/best.pt

# If not, copy from yolov8_model folder
# cp yolov8_model/YOLOv8-Helmet-Vest-Detection-main/Testing_yolov8_model/best.pt backend/
```

### 3. Start Services
```bash
# Start backend + frontend (recommended)
docker-compose up -d

# Or start all services including vision
docker-compose --profile full up -d
```

### 4. Access Application
- **Frontend**: http://localhost:80 or http://localhost:3001
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/stats

### 5. View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 6. Stop Services
```bash
docker-compose down
```

## Services Overview

### 🔧 Backend Service
**Container**: `safety-backend`  
**Port**: 8000  
**Image**: Built from `backend/Dockerfile`

**Features**:
- FastAPI server
- YOLOv8 AI detection
- OpenCV video processing
- Multi-camera support
- Health checks enabled

**Environment Variables**:
```yaml
CORS_ORIGINS: http://localhost:80,http://localhost:3001,http://localhost:5173
PYTHONUNBUFFERED: 1
```

**Volumes**:
```yaml
- ./backend/frames:/app/frames      # Alert screenshots
- ./backend/logs:/app/logs          # Application logs
- yolo_model:/app/models            # Model storage
```

**Health Check**:
```bash
curl http://localhost:8000/stats
```

### 🎨 Frontend Service
**Container**: `safety-frontend`  
**Ports**: 80, 3001  
**Image**: Multi-stage build (Node.js + Nginx)

**Features**:
- React + TypeScript + Vite
- Production-optimized build
- Nginx web server
- Health checks enabled

**Environment Variables**:
```yaml
VITE_API_URL: http://localhost:8000
```

**Build Stages**:
1. **Builder**: Compiles React app with Vite
2. **Production**: Serves static files with Nginx

**Health Check**:
```bash
curl http://localhost:80
```

### 👁️ Vision Service (Optional)
**Container**: `safety-vision`  
**Profile**: `full`  
**Image**: Built from `vision/Dockerfile`

**Start with**:
```bash
docker-compose --profile full up -d
```

**Features**:
- Additional OpenCV processing
- Zone monitoring
- Custom detection algorithms

## Environment Configuration

### Create .env File (Optional)

Create `.env` in project root for custom configuration:

```env
# Backend Configuration
BACKEND_PORT=8000
CORS_ORIGINS=http://localhost:80,http://localhost:3001

# Frontend Configuration
FRONTEND_PORT=80
FRONTEND_PORT_ALT=3001
VITE_API_URL=http://localhost:8000

# Vision Configuration (if using)
BACKEND_URL=http://backend:8000

# Docker Configuration
COMPOSE_PROJECT_NAME=safety-monitoring
```

### Update docker-compose.yml

Modify ports if needed:

```yaml
services:
  backend:
    ports:
      - "${BACKEND_PORT:-8000}:8000"
  
  frontend:
    ports:
      - "${FRONTEND_PORT:-80}:80"
      - "${FRONTEND_PORT_ALT:-3001}:80"
```

## Docker Commands

### Service Management

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d backend
docker-compose up -d frontend

# Stop all services
docker-compose down

# Stop specific service
docker-compose stop backend

# Restart service
docker-compose restart backend

# Remove containers and volumes
docker-compose down -v
```

### Logs and Monitoring

```bash
# View all logs
docker-compose logs

# Follow logs (real-time)
docker-compose logs -f

# View specific service logs
docker-compose logs backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100 backend

# Since timestamp
docker-compose logs --since 2024-01-01T00:00:00
```

### Container Status

```bash
# List running containers
docker-compose ps

# Detailed container info
docker-compose ps -a

# Check health status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### Build and Update

```bash
# Rebuild all services
docker-compose build

# Rebuild specific service
docker-compose build backend

# Rebuild and start (after code changes)
docker-compose up -d --build

# Pull latest images
docker-compose pull

# Build without cache
docker-compose build --no-cache
```

### Resource Management

```bash
# View resource usage
docker stats

# Clean up unused resources
docker system prune

# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error**: `port is already allocated`

**Solution**:
```bash
# Check what's using the port
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # Mac/Linux

# Kill the process or change port in docker-compose.yml
ports:
  - "8001:8000"  # Use 8001 instead of 8000
```

#### 2. Container Fails to Start

**Check logs**:
```bash
docker-compose logs backend
```

**Common causes**:
- Missing dependencies
- Incorrect environment variables
- Port conflicts
- Volume permission issues

**Solution**:
```bash
# Rebuild container
docker-compose down
docker-compose up -d --build backend
```

#### 3. Model File Not Found

**Error**: `FileNotFoundError: best.pt`

**Solution**:
```bash
# Ensure model is in backend directory
cp yolov8_model/YOLOv8-Helmet-Vest-Detection-main/Testing_yolov8_model/best.pt backend/

# Rebuild
docker-compose up -d --build backend
```

#### 4. Camera Connection Failed

**Check backend logs**:
```bash
docker-compose logs -f backend | grep camera
```

**Verify camera access**:
```bash
# Test camera URL directly
curl -I http://YOUR_PHONE_IP:8080/video

# Test through backend
curl -I http://localhost:8000/video_feed?source=http://YOUR_PHONE_IP:8080/video
```

#### 5. Frontend Not Loading

**Check if container is running**:
```bash
docker-compose ps frontend
```

**Check logs**:
```bash
docker-compose logs frontend
```

**Solution**:
```bash
# Rebuild frontend
docker-compose down
docker-compose up -d --build frontend
```

#### 6. Health Check Failing

**View health status**:
```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```

**Check health endpoint**:
```bash
# Backend
curl http://localhost:8000/stats

# Frontend
curl http://localhost:80
```

**Solution**:
```bash
# Wait for startup period (40s for backend)
# Or disable health check temporarily in docker-compose.yml
```

### Performance Issues

#### High CPU Usage

```bash
# Check resource usage
docker stats

# Limit resources in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
```

#### Slow Detection

- Use YOLOv8n (nano) model for faster inference
- Reduce frame resolution
- Lower FPS in camera settings
- Enable GPU acceleration (if available)

### Network Issues

#### Cannot Access from Other Devices

**Solution**:
```bash
# Use host IP instead of localhost
# Find your IP: ipconfig (Windows) or ifconfig (Mac/Linux)
# Access: http://YOUR_IP:80

# Or expose on all interfaces
# Already configured in docker-compose.yml: 0.0.0.0:8000
```

## Production Deployment

### Security Hardening

1. **Use HTTPS**:
```yaml
# Add reverse proxy (nginx/traefik)
services:
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
```

2. **Environment Variables**:
```bash
# Use .env file for secrets
# Never commit .env to version control
echo ".env" >> .gitignore
```

3. **Update Default Ports**:
```yaml
# Don't expose on default ports in production
ports:
  - "8443:8000"  # Custom port
```

### Resource Limits

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 8G
        reservations:
          cpus: '2'
          memory: 4G
```

### Persistent Storage

```yaml
volumes:
  yolo_model:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /path/to/persistent/storage/models
```

### Auto-Restart Policy

```yaml
services:
  backend:
    restart: always  # Always restart on failure
```

### Logging Configuration

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Health Monitoring

Use Docker health checks with monitoring tools:
- Prometheus + Grafana
- Docker Health Check
- Custom monitoring scripts

### Backup Strategy

```bash
# Backup volumes
docker run --rm \
  -v safety-monitoring_yolo_model:/source \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/yolo_model_backup.tar.gz -C /source .

# Backup database (if applicable)
docker-compose exec backend python backup_script.py
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Docker Build and Deploy

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build images
        run: docker-compose build
      
      - name: Run tests
        run: docker-compose run --rm backend pytest
      
      - name: Deploy
        run: docker-compose up -d
```

## Monitoring Commands

```bash
# Real-time resource monitoring
docker stats

# Container events
docker events

# Inspect container
docker inspect safety-backend

# View container processes
docker-compose exec backend ps aux

# Execute command in container
docker-compose exec backend python -c "import cv2; print(cv2.__version__)"

# Access container shell
docker-compose exec backend /bin/bash
docker-compose exec frontend /bin/sh
```

## Useful Aliases

Add to `.bashrc` or `.zshrc`:

```bash
alias dcup='docker-compose up -d'
alias dcdown='docker-compose down'
alias dclogs='docker-compose logs -f'
alias dcps='docker-compose ps'
alias dcrestart='docker-compose restart'
alias dcrebuild='docker-compose up -d --build'
```

## Summary Cheat Sheet

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f backend

# Rebuild
docker-compose up -d --build

# Status
docker-compose ps

# Clean
docker system prune -a

# Shell access
docker-compose exec backend bash

# Stats
docker stats
```

---

For more help, check the main [README.md](./README.md) or open an issue.
