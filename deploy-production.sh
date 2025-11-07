#!/bin/bash

# ========================================
# Production Deployment Script for EC2
# IP: 54.206.93.52
# Frontend: Port 3000
# Backend: Port 8000
# ========================================

set -e  # Exit on error

echo "========================================="
echo "Code Martians - Production Deployment"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running on EC2
if [ ! -f /sys/hypervisor/uuid ] || ! grep -q "ec2" /sys/hypervisor/uuid 2>/dev/null; then
    echo -e "${YELLOW}Warning: This doesn't appear to be an EC2 instance${NC}"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check available disk space
AVAILABLE_SPACE=$(df -BG . | tail -1 | awk '{print $4}' | sed 's/G//')
echo -e "Available disk space: ${AVAILABLE_SPACE}GB"

if [ "$AVAILABLE_SPACE" -lt 5 ]; then
    echo -e "${RED}Error: Less than 5GB available. Deployment may fail!${NC}"
    echo "Run: docker system prune -af --volumes"
    exit 1
fi

# Pull latest code
echo -e "${GREEN}[1/6] Pulling latest code from GitHub...${NC}"
git pull origin main

# Stop existing containers
echo -e "${GREEN}[2/6] Stopping existing containers...${NC}"
docker-compose down || true

# Remove old images to free space (optional)
echo -e "${YELLOW}[3/6] Cleaning up old Docker images...${NC}"
docker image prune -f

# Build images with proper build args
echo -e "${GREEN}[4/6] Building Docker images...${NC}"
echo "This may take 8-15 minutes on first build..."

# Build model container (fast)
docker-compose build yolov8-model

# Build backend (slow - installs PyTorch)
docker-compose build backend

# Build frontend (medium - npm build)
docker-compose build frontend

# Start services
echo -e "${GREEN}[5/6] Starting services...${NC}"
docker-compose up -d

# Wait for services to be healthy
echo -e "${GREEN}[6/6] Waiting for services to be healthy...${NC}"
echo "This may take 30-60 seconds for backend to load model..."

# Wait for backend health
RETRIES=0
MAX_RETRIES=30
until docker-compose exec -T backend curl -f http://localhost:8000/stats > /dev/null 2>&1 || [ $RETRIES -eq $MAX_RETRIES ]; do
    RETRIES=$((RETRIES+1))
    echo -n "."
    sleep 2
done
echo ""

if [ $RETRIES -eq $MAX_RETRIES ]; then
    echo -e "${RED}Backend health check failed!${NC}"
    echo "Check logs: docker-compose logs backend"
    exit 1
fi

echo -e "${GREEN}✓ Backend is healthy!${NC}"

# Check frontend
if docker-compose exec -T frontend curl -f http://localhost/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is healthy!${NC}"
else
    echo -e "${YELLOW}Warning: Frontend health check failed${NC}"
fi

# Display status
echo ""
echo "========================================="
echo -e "${GREEN}Deployment Complete!${NC}"
echo "========================================="
echo ""
docker-compose ps
echo ""
echo "Access your application:"
echo "  Frontend: http://54.206.93.52:3000"
echo "  Backend:  http://54.206.93.52:8000"
echo "  API Docs: http://54.206.93.52:8000/docs"
echo ""
echo "View logs:"
echo "  docker-compose logs -f backend"
echo "  docker-compose logs -f frontend"
echo ""
echo "Test camera streaming:"
echo "  ffmpeg -f v4l2 -i /dev/video0 -f mpjpeg http://54.206.93.52:8000/upload_stream"
echo ""
