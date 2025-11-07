# ========================================
# YOLOv8 Model Container - Lightweight model provider
# ========================================
FROM alpine:latest

WORKDIR /app

# Install bash for script execution
RUN apk add --no-cache bash

# Copy the trained model file
COPY YOLOv8-Helmet-Vest-Detection-main/Testing_yolov8_model/best.pt /app/best.pt

# Copy the model copying script
COPY copy_model.sh /app/copy_model.sh

# Make the script executable
RUN chmod +x /app/copy_model.sh

# Create the models directory
RUN mkdir -p /models

# Volume mount point for sharing models
VOLUME ["/models"]

# This container will copy the model to the shared volume
CMD ["/app/copy_model.sh"]
