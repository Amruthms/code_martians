#!/bin/bash

# Script to copy YOLOv8 model to shared volume for other containers

set -e

echo "[INFO] Starting model copy script..."

# Check if model file exists
if [ ! -f "/app/best.pt" ]; then
    echo "[ERROR] Model file /app/best.pt not found!"
    exit 1
fi

# Get model file size
MODEL_SIZE=$(du -h /app/best.pt | cut -f1)
echo "[INFO] Model file size: ${MODEL_SIZE}"

# Create target directory if it doesn't exist
mkdir -p /models

# Copy model to shared volume
echo "[INFO] Copying model to /models/best.pt..."
cp -v /app/best.pt /models/best.pt

# Verify copy was successful
if [ -f "/models/best.pt" ]; then
    echo "[SUCCESS] Model copied successfully!"
    ls -lh /models/best.pt
else
    echo "[ERROR] Model copy failed!"
    exit 1
fi

# Keep container running so the volume remains accessible
echo "[INFO] Model container ready. Keeping container alive..."
while true; do
    sleep 3600
done
