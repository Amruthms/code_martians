#!/bin/bash

# ========================================
# EC2 Connection and Deployment Test Script
# IP: 54.206.93.52
# ========================================

EC2_IP="54.206.93.52"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=========================================="
echo "Testing EC2 Instance: $EC2_IP"
echo "=========================================="
echo ""

# Test if EC2 is reachable
echo -n "Testing EC2 connectivity... "
if ping -c 1 -W 2 $EC2_IP &> /dev/null; then
    echo -e "${GREEN}✓ EC2 is reachable${NC}"
else
    echo -e "${RED}✗ EC2 is not reachable${NC}"
    echo "Check your internet connection or EC2 instance status"
    exit 1
fi

echo ""
echo "Once deployed, your application will be available at:"
echo ""
echo -e "${GREEN}Frontend Dashboard:${NC}  http://$EC2_IP:80"
echo -e "${GREEN}Backend API:${NC}         http://$EC2_IP:8000"
echo -e "${GREEN}API Documentation:${NC}   http://$EC2_IP:8000/docs"
echo ""

echo "To test after deployment, run:"
echo "  curl http://$EC2_IP:8000/stats"
echo "  curl http://$EC2_IP:80"
echo ""

echo "=========================================="
echo "Security Group Configuration Required"
echo "=========================================="
echo ""
echo "Make sure these ports are open:"
echo "  - Port 22  (SSH)"
echo "  - Port 80  (HTTP - Frontend)"
echo "  - Port 8000 (Backend API)"
echo ""

echo "To deploy, SSH to EC2 and run:"
echo "  git clone https://github.com/Amruthms/code_martians.git"
echo "  cd code_martians"
echo "  git checkout master"
echo "  ./ec2-setup.sh"
echo ""
