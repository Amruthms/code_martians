#!/bin/bash

# ========================================
# EC2 Quick Setup Script
# For AI-Powered Safety Monitoring System
# ========================================

set -e

echo "=========================================="
echo "EC2 Deployment Setup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}Please do not run as root${NC}"
    exit 1
fi

# Function to print success message
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print warning message
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Function to print error message
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if Docker is installed
echo "Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    print_warning "Docker not found. Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    print_success "Docker installed successfully"
else
    print_success "Docker is already installed"
fi

# Check if Docker Compose is installed
echo "Checking Docker Compose installation..."
if ! command -v docker-compose &> /dev/null; then
    print_warning "Docker Compose not found. Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installed successfully"
else
    print_success "Docker Compose is already installed"
fi

# Display versions
echo ""
echo "=========================================="
echo "Installation Summary"
echo "=========================================="
docker --version
docker-compose --version
echo ""

# Check if we need to activate docker group
if ! groups | grep -q docker; then
    print_warning "You need to log out and log back in for docker group changes to take effect"
    print_warning "Or run: newgrp docker"
    echo ""
fi

# Build Docker images
echo "=========================================="
echo "Building Docker Images"
echo "=========================================="
echo "This will take 10-15 minutes..."
echo ""

docker-compose build --no-cache

print_success "Docker images built successfully"
echo ""

# Display image sizes
echo "=========================================="
echo "Docker Image Sizes"
echo "=========================================="
docker images | grep -E "safety|yolov8"
echo ""

# Start services
echo "=========================================="
echo "Starting Services"
echo "=========================================="
docker-compose up -d

print_success "Services started successfully"
echo ""

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 10

# Check service health
echo ""
echo "=========================================="
echo "Service Status"
echo "=========================================="
docker-compose ps
echo ""

# Display access information
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Access your application:"
echo "  Frontend: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo 'localhost'):80"
echo "  Backend:  http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo 'localhost'):8000"
echo "  API Docs: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo 'localhost'):8000/docs"
echo ""
echo "Useful commands:"
echo "  View logs:        docker-compose logs -f"
echo "  Stop services:    docker-compose down"
echo "  Restart services: docker-compose restart"
echo "  View stats:       docker stats"
echo ""
print_success "Setup complete!"
