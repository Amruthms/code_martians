# AI-Powered Safety Monitoring System - EC2 Production Branch

## Overview

This is the **master** branch optimized for EC2 deployment with limited storage (35 GB). All Dockerfiles use multistage builds to minimize image sizes and resource usage.

## Key Features

✅ **Multistage Docker Builds** - Minimal final image sizes  
✅ **Storage Optimized** - Total Docker images ~2 GB  
✅ **Production Ready** - Health checks, resource limits, and logging  
✅ **Easy Deployment** - Single script setup on EC2  
✅ **Auto-restart** - Services restart automatically on failure  

## Architecture

```
┌─────────────────┐
│   Frontend      │  Nginx + React (50 MB)
│   Port: 80      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Backend       │  FastAPI + YOLOv8 (1.5 GB)
│   Port: 8000    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  YOLOv8 Model   │  Alpine + Model (25 MB)
│   (Init Only)   │
└─────────────────┘
```

## Quick Start on EC2

### 1. Clone and Checkout

```bash
git clone https://github.com/Amruthms/code_martians.git
cd code_martians
git checkout master
```

### 2. Run Setup Script

```bash
chmod +x ec2-setup.sh
./ec2-setup.sh
```

That's it! The script will:
- Install Docker and Docker Compose
- Build all images with multistage optimization
- Start all services
- Display access URLs

### 3. Access Your Application

- **Frontend**: `http://<EC2-IP>:80`
- **Backend API**: `http://<EC2-IP>:8000`
- **API Documentation**: `http://<EC2-IP>:8000/docs`

## Manual Setup

If you prefer manual control:

```bash
# 1. Install Docker (if not already installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# 2. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 3. Build and start
docker-compose build --no-cache
docker-compose up -d

# 4. Check status
docker-compose ps
docker-compose logs -f
```

## Docker Image Optimization

### Backend Image (Python + YOLOv8)
**Stage 1 (Builder)**: 2.5 GB
- Includes build tools, compilers
- Installs all Python packages
- Creates virtual environment

**Stage 2 (Runtime)**: ~1.5 GB ✅
- Only runtime dependencies
- No build tools
- Copies pre-built packages

### Frontend Image (React + Nginx)
**Stage 1 (Dependencies)**: 500 MB
- Production dependencies only
- Clean npm cache

**Stage 2 (Builder)**: 800 MB
- All dependencies for build
- Compiles React app

**Stage 3 (Production)**: ~50 MB ✅
- Only built static files
- Nginx Alpine base
- No node_modules

### YOLOv8 Model Image
**Single Stage**: ~25 MB ✅
- Alpine Linux base (5 MB)
- Model file (~20 MB)
- Bash for scripts

## Resource Limits

Configured for t3.medium (2 vCPU, 4GB RAM):

```yaml
Backend:
  - CPU Limit: 2.0 cores
  - Memory Limit: 4 GB
  - CPU Reserve: 1.0 core
  - Memory Reserve: 2 GB

Frontend:
  - CPU Limit: 0.5 cores
  - Memory Limit: 512 MB
  - CPU Reserve: 0.25 cores
  - Memory Reserve: 256 MB
```

## Monitoring

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Resource Usage
```bash
docker stats
```

### Service Health
```bash
docker-compose ps

# Check backend health endpoint
curl http://localhost:8000/stats
```

## Maintenance

### Update Application
```bash
git pull origin master
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Restart Services
```bash
# All services
docker-compose restart

# Specific service
docker-compose restart backend
```

### Clean Up
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Complete cleanup (careful!)
docker system prune -a --volumes
```

## Troubleshooting

### Services Won't Start
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Restart with fresh build
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Out of Memory
```bash
# Check memory usage
free -h
docker stats

# Add swap space
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Port Already in Use
```bash
# Check what's using the port
sudo lsof -i :80
sudo lsof -i :8000

# Stop the conflicting service or change ports in docker-compose.yml
```

## Storage Management

### Current Usage
```bash
# Docker disk usage
docker system df

# Detailed view
docker system df -v
```

### Free Up Space
```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune
```

## Security

### Firewall Setup
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8000/tcp
sudo ufw enable
```

### SSL Certificate (Recommended)
```bash
sudo apt-get install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

## Performance Tips

1. **Enable Docker BuildKit**
   ```bash
   export DOCKER_BUILDKIT=1
   export COMPOSE_DOCKER_CLI_BUILD=1
   ```

2. **Configure Docker Daemon**
   ```bash
   # Edit /etc/docker/daemon.json
   {
     "log-driver": "json-file",
     "log-opts": {
       "max-size": "10m",
       "max-file": "3"
     }
   }
   ```

3. **Monitor Resources**
   ```bash
   # Install htop
   sudo apt-get install htop -y
   htop
   ```

## Documentation

- **[EC2_DEPLOYMENT.md](./EC2_DEPLOYMENT.md)** - Detailed deployment guide
- **[DOCKER_GUIDE.md](./DOCKER_GUIDE.md)** - Docker architecture details
- **[SETUP.md](./SETUP.md)** - General setup instructions

## Support

- **GitHub Issues**: [Report bugs](https://github.com/Amruthms/code_martians/issues)
- **Documentation**: Check individual service README files

## License

[Your License Here]

---

**Note**: This master branch is specifically optimized for EC2 deployment. For local development, check out the `main` branch.
