# AI-Powered Safety Monitoring System - Main Branch (Local Development)

## Overview

This is the **main** branch for **local development**. For EC2 production deployment, use the **master** branch.

## Key Differences: Main vs Master Branch

| Feature | Main Branch (Local Dev) | Master Branch (Production) |
|---------|------------------------|----------------------------|
| **Purpose** | Local development | EC2 production deployment |
| **Build Type** | Single-stage | Multi-stage (optimized) |
| **Image Size** | Larger (~3-4 GB) | Smaller (~1.6 GB) |
| **Hot Reload** | ✅ Enabled | ❌ Disabled |
| **Frontend Port** | 5173 (Vite dev) | 3000 (nginx) |
| **Backend Mode** | `--reload` flag | Production mode |
| **Source Mounting** | ✅ Volumes mounted | ❌ Copied into image |

## Quick Start (Local Development)

### Prerequisites
- Docker & Docker Compose installed
- 8GB+ RAM recommended
- Git

### Setup

```bash
# Clone repository
git clone https://github.com/Amruthms/code_martians.git
cd code_martians

# Make sure you're on main branch
git checkout main

# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Access Your Application

- **Frontend (Vite Dev Server)**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Alternative API Docs**: http://localhost:8000/redoc

## Development Workflow

### Making Changes

The Docker setup includes **hot reload** for both frontend and backend:

#### Frontend Changes
1. Edit files in `frontend/src/`
2. Vite will automatically reload in browser
3. No rebuild needed!

#### Backend Changes
1. Edit files in `backend/`
2. Uvicorn will automatically restart
3. No rebuild needed!

### Useful Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f backend
docker-compose logs -f frontend

# Rebuild after dependency changes
docker-compose build --no-cache
docker-compose up -d

# Restart a service
docker-compose restart backend

# Check service status
docker-compose ps

# Access container shell
docker exec -it safety-backend /bin/bash
docker exec -it safety-frontend /bin/sh
```

## Project Structure

```
code_martians/
├── backend/
│   ├── Dockerfile              # Backend development image
│   ├── requirements.txt        # Python dependencies
│   ├── app.py                  # FastAPI application
│   ├── detector.py             # Detection logic
│   ├── ppe.py                  # PPE detection
│   └── best.pt                 # YOLOv8 model
│
├── frontend/
│   ├── Dockerfile              # Frontend development image
│   ├── package.json            # Node dependencies
│   ├── vite.config.ts          # Vite configuration
│   ├── index.html
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       └── components/
│
├── yolov8_model/
│   ├── Dockerfile
│   └── YOLOv8-Helmet-Vest-Detection-main/
│       └── Testing_yolov8_model/
│           └── best.pt
│
└── docker-compose.yml          # Local development setup
```

## Environment Variables

### Backend
- `CORS_ORIGINS`: Allowed origins for CORS
- `PYTHONUNBUFFERED`: Python output buffering
- `MODEL_PATH`: Path to YOLOv8 model

### Frontend
- `VITE_API_URL`: Backend API URL

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 8000 or 5173
sudo lsof -i :8000
sudo lsof -i :5173

# Kill the process
sudo kill -9 <PID>
```

### Container Won't Start

```bash
# Check logs for errors
docker-compose logs backend
docker-compose logs frontend

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Hot Reload Not Working

```bash
# Restart the service
docker-compose restart backend
docker-compose restart frontend

# Or rebuild
docker-compose build backend --no-cache
docker-compose up -d backend
```

### Model Not Found

```bash
# Check if model volume is populated
docker volume inspect yolo_model_data

# Restart model service
docker-compose restart yolov8-model
```

### Permission Issues

```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Or run with sudo
sudo docker-compose up -d
```

## Adding New Dependencies

### Python (Backend)

```bash
# Add to backend/requirements.txt
echo "new-package==1.0.0" >> backend/requirements.txt

# Rebuild backend
docker-compose build backend --no-cache
docker-compose up -d backend
```

### Node (Frontend)

```bash
# Add package
cd frontend
npm install new-package

# Rebuild frontend
cd ..
docker-compose build frontend --no-cache
docker-compose up -d frontend
```

## Testing

```bash
# Test backend health
curl http://localhost:8000/stats

# Test frontend
curl http://localhost:5173
```

## Switching to Production (Master Branch)

When ready to deploy to EC2:

```bash
# Commit your changes
git add -A
git commit -m "Your changes"
git push origin main

# Switch to master branch for production
git checkout master

# Follow the deployment guide
cat EC2_DEPLOYMENT.md
```

## Performance Tips

1. **Allocate more resources to Docker**
   - Docker Desktop → Settings → Resources
   - Increase CPU & Memory

2. **Clean up unused resources**
   ```bash
   docker system prune -a
   docker volume prune
   ```

3. **Use BuildKit for faster builds**
   ```bash
   export DOCKER_BUILDKIT=1
   export COMPOSE_DOCKER_CLI_BUILD=1
   ```

## Support

- **Issues**: [GitHub Issues](https://github.com/Amruthms/code_martians/issues)
- **Documentation**: Check README files in each directory

## License

[Your License Here]

---

**Note**: This main branch is for **local development only**. For EC2 production deployment, switch to the **master** branch which has optimized multi-stage Docker builds.
