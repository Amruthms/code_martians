# Docker Multi-Stage Architecture Documentation

## Overview

This project uses **multi-stage Docker builds** for all components to achieve:
- **Minimal image sizes** (production images exclude build tools)
- **Fast build times** (efficient layer caching)
- **Security** (non-root users, minimal attack surface)
- **Reproducibility** (deterministic builds)

---

## 1. Backend Dockerfile (3-Stage Build)

**Location:** `backend/Dockerfile`  
**Final Size:** ~1.5-2GB (down from 8.1GB with CUDA PyTorch)

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Stage 1: BASE (python:3.10-slim)                            │
│ - Common runtime dependencies (libgl1, libglib, curl, etc.) │
│ - Shared by both builder and runtime stages                 │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ├──────────────────────────────────────────┐
                   │                                          │
    ┌──────────────▼────────────────┐      ┌─────────────────▼─────────────┐
    │ Stage 2: BUILDER              │      │ Stage 3: RUNTIME              │
    │ - Inherits from BASE          │      │ - Inherits from BASE          │
    │ - Adds build tools            │      │ - No build tools              │
    │ - Creates venv                │      │ - Copies venv from BUILDER    │
    │ - Installs Python packages    │◄─────┤ - Copies only app code        │
    │ - CPU-only PyTorch (700MB)    │      │ - Non-root user (appuser)     │
    │ - Cleans __pycache__          │      │ - Production-ready            │
    └───────────────────────────────┘      └───────────────────────────────┘
                                                     FINAL IMAGE
```

### Stage Breakdown

#### Stage 1: Base (Shared Foundation)
```dockerfile
FROM python:3.10-slim AS base
```
- **Purpose:** Common dependencies for both build and runtime
- **Includes:** libgl1, libglib2.0-0, libsm6, libxext6, curl
- **Why:** Avoid duplicating dependency installation in multiple stages

#### Stage 2: Builder (Dependency Installation)
```dockerfile
FROM base AS builder
```
- **Purpose:** Install Python packages with build tools
- **Includes:** gcc, g++, build-essential, git, wget
- **Key Steps:**
  1. Create virtual environment in `/opt/venv`
  2. Install CPU-only PyTorch first (saves 1.6GB vs CUDA)
  3. Install remaining packages from `requirements.txt`
  4. Clean up `__pycache__`, `.pyc`, `.pyo` files
- **Output:** `/opt/venv` with all Python dependencies

#### Stage 3: Runtime (Production Image)
```dockerfile
FROM base AS runtime
```
- **Purpose:** Minimal production image
- **Copies From Builder:** `/opt/venv` (Python packages only)
- **App Files:** Only necessary Python files (app.py, detector.py, etc.)
- **Security:**
  - Non-root user `appuser` (UID 1000)
  - No build tools or compilers
- **Directories:** `/app/models`, `/app/frames`, `/app/logs`
- **Environment:**
  - `PYTHONUNBUFFERED=1` (immediate log output)
  - `MODEL_PATH=/app/models/best.pt`
  - `PROCESS_EVERY_N_FRAMES=5`
  - `INFERENCE_SIZE=480`
  - `JPEG_QUALITY=70`

### Key Optimizations

1. **CPU-only PyTorch:** 700MB vs 2.3GB (70% reduction)
2. **Virtual Environment:** Clean separation of dependencies
3. **Layer Caching:** requirements.txt copied before source code
4. **Cleanup:** Removes .pyc, __pycache__, .map files
5. **Non-root User:** Security best practice

### Health Check

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/stats || exit 1
```
- Uses `/stats` endpoint (lightweight)
- 40s start period (allows model loading)
- 3 retries before marking unhealthy

---

## 2. Frontend Dockerfile (6-Stage Build)

**Location:** `frontend/Dockerfile`  
**Final Size:** ~50-100MB (nginx:alpine + static files)

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Stage 1: BASE (node:18-alpine)                                          │
│ - Common Node.js environment                                            │
│ - libc6-compat for compatibility                                        │
└──────────────────┬──────────────────────────────────────────────────────┘
                   │
          ┌────────┴────────┐
          │                 │
    ┌─────▼─────────┐  ┌────▼─────────────┐
    │ Stage 2:      │  │ Stage 3:         │
    │ DEPS-PROD     │  │ DEPS-DEV         │
    │ - Production  │  │ - All deps       │
    │   deps only   │  │   (for build)    │
    └───────────────┘  └────┬─────────────┘
                            │
                       ┌────▼─────────────┐
                       │ Stage 4: BUILDER │
                       │ - npm run build  │
                       │ - Outputs to     │
                       │   /app/build     │
                       └────┬─────────────┘
                            │
┌───────────────────────────┼─────────────────────────────┐
│ Stage 5: NGINX-BASE       │                             │
│ - nginx:alpine            │                             │
│ - curl, security updates  │                             │
└───────────────────┬───────┘                             │
                    │                                     │
              ┌─────▼─────────────────────────────────────▼───┐
              │ Stage 6: PRODUCTION                           │
              │ - Copies /app/build from BUILDER              │
              │ - Custom nginx.conf                           │
              │ - Non-root nginx user                         │
              │ - Security hardened                           │
              └───────────────────────────────────────────────┘
                            FINAL IMAGE
```

### Stage Breakdown

#### Stage 1: Base (Node Environment)
```dockerfile
FROM node:18-alpine AS base
```
- **Purpose:** Common Node.js setup
- **Includes:** libc6-compat for binary compatibility
- **Why:** Avoid repeating Node setup in deps stages

#### Stage 2: Deps-Prod (Production Dependencies)
```dockerfile
FROM base AS deps-prod
```
- **Purpose:** Install only production dependencies
- **Command:** `npm ci --silent --only=production`
- **Why:** Creates a clean production dependency layer (not used in final image but good for caching)

#### Stage 3: Deps-Dev (All Dependencies)
```dockerfile
FROM base AS deps-dev
```
- **Purpose:** Install all dependencies including devDependencies
- **Command:** `npm ci --silent`
- **Why:** Required for TypeScript, Vite, and build tools

#### Stage 4: Builder (Build Application)
```dockerfile
FROM deps-dev AS builder
```
- **Purpose:** Build React application with Vite
- **Build Arg:** `VITE_API_URL` (backend API URL)
- **Output:** `/app/build` directory with static files
- **Post-Build:**
  - Removes source maps (`.map` files) for security
  - Logs build directory size
  - Verifies build output

#### Stage 5: Nginx-Base (Prepare Nginx)
```dockerfile
FROM nginx:alpine AS nginx-base
```
- **Purpose:** Prepare nginx with security updates
- **Includes:** curl for health checks
- **Removes:** Default nginx configs and HTML

#### Stage 6: Production (Final Image)
```dockerfile
FROM nginx-base AS production
```
- **Purpose:** Serve static files with nginx
- **Copies From Builder:** `/app/build` → `/usr/share/nginx/html`
- **Configuration:** Custom `nginx.conf`
- **Security:**
  - Runs as `nginx` user (non-root)
  - Proper file permissions (755)
- **Metadata:** Labels for image identification

### Key Optimizations

1. **Separate Dep Stages:** Better caching, faster rebuilds
2. **Source Map Removal:** Reduces size, improves security
3. **Nginx Alpine:** Minimal base image (~5MB)
4. **Build Args:** API URL configurable at build time
5. **Clean Layers:** No dev tools in final image

### Build Arguments

```bash
docker build --build-arg VITE_API_URL=http://your-backend:8000 -t frontend .
```

---

## 3. YOLOv8 Model Dockerfile (3-Stage Build)

**Location:** `yolov8_model/Dockerfile`  
**Final Size:** ~25-30MB (Alpine + model file)

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Stage 1: BASE (alpine:3.19)                             │
│ - bash, coreutils                                       │
│ - Security updates                                      │
└──────────────────┬──────────────────────────────────────┘
                   │
          ┌────────┴────────┐
          │                 │
    ┌─────▼─────────────┐   │
    │ Stage 2:          │   │
    │ MODEL-PREP        │   │
    │ - Copy best.pt    │   │
    │ - Verify size     │   │
    │ - SHA256 checksum │   │
    └────┬──────────────┘   │
         │                  │
    ┌────▼──────────────────▼───┐
    │ Stage 3: RUNTIME          │
    │ - Copies verified model   │
    │ - Non-root user           │
    │ - Volume mount /models    │
    │ - copy_model.sh script    │
    └───────────────────────────┘
              FINAL IMAGE
```

### Stage Breakdown

#### Stage 1: Base (Minimal Alpine)
```dockerfile
FROM alpine:3.19 AS base
```
- **Purpose:** Minimal Linux with bash
- **Includes:** bash, coreutils
- **Updates:** Latest security patches

#### Stage 2: Model-Prep (Verify Model)
```dockerfile
FROM base AS model-prep
```
- **Purpose:** Copy and verify model file integrity
- **Source:** `../YOLOv8-Helmet-Vest-Detection-main/Testing_yolov8_model/best.pt`
- **Verification:**
  - File size check
  - SHA256 checksum generation
  - Existence validation
- **Why:** Fail fast if model is corrupted or missing

#### Stage 3: Runtime (Model Serving)
```dockerfile
FROM base AS runtime
```
- **Purpose:** Lightweight model provider
- **Copies From Model-Prep:** Verified `best.pt`
- **Script:** `copy_model.sh` (copies model to volume)
- **Security:**
  - Non-root user `modeluser` (UID 1000)
  - Proper ownership of /models directory
- **Volume:** `/models` (shared with backend)
- **Labels:** Metadata for model type and version

### Copy Script (`copy_model.sh`)

```bash
#!/bin/bash
set -e

# Verify model exists
[ -f "/app/best.pt" ] || exit 1

# Copy to shared volume
cp -v /app/best.pt /models/best.pt

# Keep container alive
while true; do sleep 3600; done
```

### Key Optimizations

1. **Alpine Base:** Smallest possible Linux (~5MB)
2. **Model Verification:** Prevents corrupted deployments
3. **Non-root User:** Security best practice
4. **Keep Alive:** Container stays running to maintain volume
5. **Metadata Labels:** Easy image identification

---

## Build Commands

### Backend
```bash
cd backend
docker build -t safety-backend:latest .

# With custom Python version
docker build --build-arg PYTHON_VERSION=3.11 -t safety-backend:py311 .
```

### Frontend
```bash
cd frontend
docker build --build-arg VITE_API_URL=http://54.206.93.52:8000 -t safety-frontend:latest .

# For local development
docker build --build-arg VITE_API_URL=http://localhost:8000 -t safety-frontend:dev .
```

### YOLOv8 Model
```bash
cd yolov8_model
docker build -t yolov8-model:latest .
```

---

## Docker Compose Integration

```yaml
services:
  yolov8-model:
    build: ./yolov8_model
    volumes:
      - yolo_model:/models
    healthcheck:
      test: ["CMD", "test", "-f", "/models/best.pt"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      target: runtime  # Use specific stage
    depends_on:
      yolov8-model:
        condition: service_healthy
    volumes:
      - yolo_model:/app/models:ro  # Read-only
      - backend_logs:/app/logs
      - backend_frames:/app/frames
    environment:
      - MODEL_PATH=/app/models/best.pt
    ports:
      - "8000:8000"

  frontend:
    build:
      context: ./frontend
      args:
        VITE_API_URL: http://54.206.93.52:8000
      target: production
    ports:
      - "3000:80"

volumes:
  yolo_model:
  backend_logs:
  backend_frames:
```

---

## Image Size Comparison

| Component | Before Optimization | After Multi-Stage | Reduction |
|-----------|--------------------:|------------------:|----------:|
| Backend   | 8.1 GB (CUDA)      | 1.5-2 GB          | 75-81%    |
| Frontend  | 1.2 GB (node:18)   | 50-100 MB         | 92-96%    |
| Model     | 30 MB              | 25-30 MB          | 0-17%     |
| **Total** | **9.33 GB**        | **1.6-2.1 GB**    | **77%**   |

---

## Best Practices Applied

### 1. Layer Caching
- Copy `requirements.txt` / `package.json` before source code
- Separate dependency installation from app code
- Minimize layer invalidation on code changes

### 2. Security
- **Non-root users** in all containers
- **Minimal base images** (slim, alpine)
- **No build tools** in production images
- **Read-only volumes** where possible

### 3. Size Optimization
- **CPU-only PyTorch** (saves 1.6GB)
- **Virtual environments** (clean dependency trees)
- **Remove caches** (npm, pip, apt)
- **Delete artifacts** (.pyc, .map, __pycache__)

### 4. Reliability
- **Health checks** on all services
- **Startup probes** for slow-starting services (backend with model loading)
- **Model verification** before deployment
- **Explicit versions** (Python 3.10, Node 18, Alpine 3.19)

### 5. Development vs Production
- **Named stages** allow targeting specific stages
- **Build args** for environment-specific configuration
- **Separate dev/prod dependency stages** (frontend)

---

## Troubleshooting

### Backend Image Too Large
```bash
# Check layer sizes
docker history safety-backend:latest

# Verify CPU-only PyTorch
docker run --rm safety-backend:latest pip show torch | grep Location
```

### Frontend Build Fails
```bash
# Build with verbose output
docker build --progress=plain --no-cache -t safety-frontend:latest ./frontend

# Check if build output exists
docker run --rm safety-frontend:latest ls -la /usr/share/nginx/html
```

### Model Not Copying
```bash
# Check model container logs
docker logs yolov8-model

# Verify volume mount
docker run --rm -v yolo_model:/models alpine ls -la /models
```

### Permission Denied Errors
```bash
# Check user in container
docker run --rm safety-backend:latest whoami
docker run --rm safety-backend:latest id

# Verify file ownership
docker run --rm safety-backend:latest ls -la /app
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Push Docker Images

on:
  push:
    branches: [main, master]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Backend
        run: |
          docker build -t ${{ secrets.REGISTRY }}/backend:${{ github.sha }} ./backend
          docker push ${{ secrets.REGISTRY }}/backend:${{ github.sha }}
      
      - name: Build Frontend
        run: |
          docker build \
            --build-arg VITE_API_URL=${{ secrets.API_URL }} \
            -t ${{ secrets.REGISTRY }}/frontend:${{ github.sha }} \
            ./frontend
          docker push ${{ secrets.REGISTRY }}/frontend:${{ github.sha }}
      
      - name: Build Model
        run: |
          docker build -t ${{ secrets.REGISTRY }}/yolov8-model:${{ github.sha }} ./yolov8_model
          docker push ${{ secrets.REGISTRY }}/yolov8-model:${{ github.sha }}
```

---

## Performance Benchmarks

### Build Times (No Cache)
- Backend: ~8-12 minutes
- Frontend: ~2-4 minutes
- Model: ~10-30 seconds

### Build Times (With Cache)
- Backend: ~30-60 seconds (if only app code changed)
- Frontend: ~20-40 seconds (if only src files changed)
- Model: ~5-10 seconds

### Startup Times
- Backend: 30-40 seconds (model loading)
- Frontend: 1-2 seconds (nginx)
- Model: 5-10 seconds (copy script)

---

## Maintenance

### Updating Dependencies

#### Backend
```bash
# Update requirements.txt
cd backend
docker build --no-cache -t safety-backend:latest .
```

#### Frontend
```bash
# Update package.json
cd frontend
npm update
docker build --no-cache -t safety-frontend:latest .
```

### Security Updates

```bash
# Rebuild all images to get latest security patches
docker-compose build --no-cache --pull
```

### Cleaning Up

```bash
# Remove dangling images
docker image prune -f

# Remove build cache
docker builder prune -f

# Full cleanup (careful!)
docker system prune -a --volumes
```

---

## References

- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [PyTorch CPU Installation](https://pytorch.org/get-started/locally/)
- [Vite Build Options](https://vitejs.dev/guide/build.html)
- [Nginx Docker Image](https://hub.docker.com/_/nginx)
