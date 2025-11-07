#!/bin/bash

# AI-Powered Construction Safety System - Docker Setup Script
# This script helps you quickly set up and deploy the system using Docker

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check Docker
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        print_success "Docker installed: $DOCKER_VERSION"
    else
        print_error "Docker is not installed"
        print_info "Please install Docker from: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    # Check Docker Compose
    if command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version)
        print_success "Docker Compose installed: $COMPOSE_VERSION"
    else
        print_error "Docker Compose is not installed"
        print_info "Please install Docker Compose from: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    # Check if Docker daemon is running
    if docker info &> /dev/null; then
        print_success "Docker daemon is running"
    else
        print_error "Docker daemon is not running"
        print_info "Please start Docker Desktop or Docker service"
        exit 1
    fi
    
    echo ""
}

# Check model file
check_model() {
    print_header "Checking YOLOv8 Model"
    
    if [ -f "backend/best.pt" ]; then
        MODEL_SIZE=$(du -h backend/best.pt | cut -f1)
        print_success "YOLOv8 model found: backend/best.pt ($MODEL_SIZE)"
    else
        print_warning "YOLOv8 model not found in backend/"
        
        if [ -f "yolov8_model/YOLOv8-Helmet-Vest-Detection-main/Testing_yolov8_model/best.pt" ]; then
            print_info "Found model in yolov8_model folder, copying..."
            cp yolov8_model/YOLOv8-Helmet-Vest-Detection-main/Testing_yolov8_model/best.pt backend/
            print_success "Model copied to backend/best.pt"
        else
            print_error "YOLOv8 model not found"
            print_info "Please ensure best.pt is in the backend/ directory"
            exit 1
        fi
    fi
    
    echo ""
}

# Create .env if not exists
setup_env() {
    print_header "Setting Up Environment"
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            print_info "Creating .env from .env.example"
            cp .env.example .env
            print_success ".env file created"
        else
            print_warning ".env.example not found, skipping"
        fi
    else
        print_success ".env file already exists"
    fi
    
    echo ""
}

# Build and start services
deploy() {
    print_header "Building and Starting Services"
    
    print_info "Building Docker images (this may take a few minutes)..."
    docker-compose build
    
    print_success "Images built successfully"
    
    print_info "Starting services..."
    docker-compose up -d
    
    print_success "Services started"
    
    echo ""
}

# Wait for services
wait_for_services() {
    print_header "Waiting for Services to be Ready"
    
    print_info "Waiting for backend to be healthy..."
    
    MAX_WAIT=60
    WAITED=0
    
    while [ $WAITED -lt $MAX_WAIT ]; do
        if curl -s http://localhost:8000/stats > /dev/null 2>&1; then
            print_success "Backend is ready"
            break
        fi
        
        echo -n "."
        sleep 2
        WAITED=$((WAITED + 2))
    done
    
    if [ $WAITED -ge $MAX_WAIT ]; then
        print_warning "Backend health check timeout (still might be starting)"
    fi
    
    echo ""
    
    print_info "Waiting for frontend to be ready..."
    
    WAITED=0
    while [ $WAITED -lt $MAX_WAIT ]; do
        if curl -s http://localhost:80 > /dev/null 2>&1; then
            print_success "Frontend is ready"
            break
        fi
        
        echo -n "."
        sleep 2
        WAITED=$((WAITED + 2))
    done
    
    if [ $WAITED -ge $MAX_WAIT ]; then
        print_warning "Frontend health check timeout (still might be starting)"
    fi
    
    echo ""
}

# Show status
show_status() {
    print_header "Service Status"
    
    docker-compose ps
    
    echo ""
}

# Show access info
show_access_info() {
    print_header "Access Information"
    
    echo -e "${GREEN}🌐 Frontend Dashboard:${NC}"
    echo -e "   • http://localhost:80"
    echo -e "   • http://localhost:3001"
    echo ""
    
    echo -e "${GREEN}🔧 Backend API:${NC}"
    echo -e "   • http://localhost:8000"
    echo -e "   • API Docs: http://localhost:8000/docs"
    echo -e "   • Health: http://localhost:8000/stats"
    echo ""
    
    echo -e "${GREEN}📱 To Add Phone Camera:${NC}"
    echo -e "   1. Install 'IP Webcam' app on Android"
    echo -e "   2. Start server in app (note the IP)"
    echo -e "   3. Go to Settings → Cameras in dashboard"
    echo -e "   4. Add camera: http://YOUR_PHONE_IP:8080/video"
    echo ""
    
    echo -e "${GREEN}📊 View Logs:${NC}"
    echo -e "   • docker-compose logs -f"
    echo -e "   • docker-compose logs -f backend"
    echo -e "   • docker-compose logs -f frontend"
    echo ""
    
    echo -e "${GREEN}🛑 Stop Services:${NC}"
    echo -e "   • docker-compose down"
    echo ""
}

# Main execution
main() {
    clear
    
    print_header "AI-Powered Construction Safety System"
    print_header "Docker Deployment Setup"
    
    echo ""
    
    check_prerequisites
    check_model
    setup_env
    deploy
    wait_for_services
    show_status
    show_access_info
    
    print_header "🚀 Deployment Complete!"
    
    echo -e "${GREEN}Your Construction Safety System is now running!${NC}"
    echo ""
}

# Run main function
main
