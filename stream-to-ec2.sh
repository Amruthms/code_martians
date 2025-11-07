#!/bin/bash

# ========================================
# Stream Local Webcam to EC2 Backend
# ========================================

set -e

echo "========================================="
echo "Streaming Logitech Webcam to EC2"
echo "========================================="
echo ""

# Configuration
EC2_IP="54.206.93.52"
EC2_PORT="8000"
VIDEO_DEVICE="/dev/video0"
UPLOAD_URL="http://${EC2_IP}:${EC2_PORT}/upload_stream"
REMOTE_STREAM_URL="http://${EC2_IP}:${EC2_PORT}/remote_stream"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${RED}Error: ffmpeg is not installed${NC}"
    echo "Install with: sudo pacman -S ffmpeg"
    exit 1
fi

# Check if video device exists
if [ ! -e "$VIDEO_DEVICE" ]; then
    echo -e "${RED}Error: Video device $VIDEO_DEVICE not found${NC}"
    echo "Available video devices:"
    ls -l /dev/video* 2>/dev/null || echo "No video devices found"
    exit 1
fi

# Check if EC2 backend is reachable
echo -e "${YELLOW}Checking EC2 backend...${NC}"
if ! curl -s -f http://${EC2_IP}:${EC2_PORT}/stats > /dev/null; then
    echo -e "${RED}Error: Cannot reach EC2 backend at ${EC2_IP}:${EC2_PORT}${NC}"
    exit 1
fi
echo -e "${GREEN}✓ EC2 backend is reachable${NC}"

# Check if upload_stream endpoint exists
echo -e "${YELLOW}Checking upload_stream endpoint...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST ${UPLOAD_URL})
if [ "$HTTP_CODE" != "200" ] && [ "$HTTP_CODE" != "405" ]; then
    echo -e "${RED}Error: upload_stream endpoint not available (HTTP ${HTTP_CODE})${NC}"
    exit 1
fi
echo -e "${GREEN}✓ upload_stream endpoint is ready${NC}"

echo ""
echo "========================================="
echo "Starting video stream..."
echo "========================================="
echo ""
echo "Camera: ${VIDEO_DEVICE}"
echo "Uploading to: ${UPLOAD_URL}"
echo "View processed stream at: ${REMOTE_STREAM_URL}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop streaming${NC}"
echo ""

# Start streaming
ffmpeg -f v4l2 \
    -input_format mjpeg \
    -video_size 640x480 \
    -framerate 30 \
    -i ${VIDEO_DEVICE} \
    -f mpjpeg \
    -q:v 5 \
    -content_type "multipart/x-mixed-replace;boundary=frame" \
    ${UPLOAD_URL}
