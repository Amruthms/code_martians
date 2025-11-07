#!/bin/bash

# ========================================
# Docker Configuration Verification Script
# Checks if all required files and dependencies are in place
# ========================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "=========================================="
echo "Docker Configuration Verification"
echo "=========================================="
echo ""

ERRORS=0
WARNINGS=0

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} Found: $1"
        return 0
    else
        echo -e "${RED}✗${NC} Missing: $1"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

# Function to check directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} Found: $1/"
        return 0
    else
        echo -e "${YELLOW}⚠${NC} Missing: $1/ (will be created at runtime)"
        WARNINGS=$((WARNINGS + 1))
        return 1
    fi
}

# Function to check content in file
check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $1 contains '$2'"
        return 0
    else
        echo -e "${RED}✗${NC} $1 missing '$2'"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

echo "Checking Docker Files..."
echo "------------------------"
check_file "docker-compose.yml"
check_file "backend/Dockerfile"
check_file "frontend/Dockerfile"
check_file "yolov8_model/Dockerfile"
echo ""

echo "Checking Configuration Files..."
echo "--------------------------------"
check_file "backend/requirements.txt"
check_file "frontend/package.json"
check_file "frontend/nginx.conf"
check_file "yolov8_model/copy_model.sh"
echo ""

echo "Checking Model Files..."
echo "-----------------------"
check_file "yolov8_model/YOLOv8-Helmet-Vest-Detection-main/Testing_yolov8_model/best.pt"
check_file "backend/best.pt"
echo ""

echo "Checking Python Dependencies in requirements.txt..."
echo "----------------------------------------------------"
check_content "backend/requirements.txt" "fastapi"
check_content "backend/requirements.txt" "uvicorn"
check_content "backend/requirements.txt" "opencv-python-headless"
check_content "backend/requirements.txt" "numpy"
check_content "backend/requirements.txt" "ultralytics"
check_content "backend/requirements.txt" "torch"
check_content "backend/requirements.txt" "Pillow"
echo ""

echo "Checking Backend Source Files..."
echo "---------------------------------"
check_file "backend/app.py"
check_file "backend/detector.py"
check_file "backend/ppe.py"
check_file "backend/helmet_infer.py"
check_file "backend/vest_detector.py"
echo ""

echo "Checking Frontend Source Files..."
echo "----------------------------------"
check_file "frontend/src/App.tsx"
check_file "frontend/src/main.tsx"
check_file "frontend/index.html"
check_file "frontend/vite.config.ts"
echo ""

echo "Checking .dockerignore Files..."
echo "--------------------------------"
check_file ".dockerignore"
check_file "backend/.dockerignore"
check_file "frontend/.dockerignore"
echo ""

echo "Checking Runtime Directories..."
echo "--------------------------------"
check_dir "backend/frames"
check_dir "backend/logs"
echo ""

echo "Checking Documentation..."
echo "-------------------------"
check_file "README_MASTER.md"
check_file "EC2_DEPLOYMENT.md"
check_file "DOCKER_REVIEW.md"
check_file "ec2-setup.sh"
echo ""

echo "Verifying Docker Compose Configuration..."
echo "------------------------------------------"
check_content "docker-compose.yml" "yolov8-model"
check_content "docker-compose.yml" "backend"
check_content "docker-compose.yml" "frontend"
check_content "docker-compose.yml" "yolo_model:"
check_content "docker-compose.yml" "safety-network"
echo ""

echo "Checking Executable Permissions..."
echo "-----------------------------------"
if [ -x "ec2-setup.sh" ]; then
    echo -e "${GREEN}✓${NC} ec2-setup.sh is executable"
else
    echo -e "${YELLOW}⚠${NC} ec2-setup.sh is not executable (run: chmod +x ec2-setup.sh)"
    WARNINGS=$((WARNINGS + 1))
fi

if [ -x "yolov8_model/copy_model.sh" ]; then
    echo -e "${GREEN}✓${NC} copy_model.sh is executable"
else
    echo -e "${YELLOW}⚠${NC} copy_model.sh is not executable (run: chmod +x yolov8_model/copy_model.sh)"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

echo "=========================================="
echo "Verification Summary"
echo "=========================================="
echo -e "Errors:   ${RED}$ERRORS${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All critical checks passed!${NC}"
    echo ""
    echo "You can now:"
    echo "  1. Commit changes: git add -A && git commit -m 'Add optimized Docker configuration'"
    echo "  2. Push to master: git push origin master"
    echo "  3. Deploy on EC2: ./ec2-setup.sh"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Please fix the errors above before deploying${NC}"
    echo ""
    exit 1
fi
