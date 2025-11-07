# ========================================
# Stage 1: Base - Prepare Alpine base
# ========================================
FROM alpine:3.19 AS base

# Install required packages and security updates
RUN apk add --no-cache bash coreutils && \
    apk upgrade --no-cache

# ========================================
# Stage 2: Model Preparation - Copy and verify model
# ========================================
FROM base AS model-prep

WORKDIR /build

# Copy the trained model file from the parent directory structure
COPY YOLOv8-Helmet-Vest-Detection-main/Testing_yolov8_model/best.pt /build/best.pt

# Verify model exists and show details
RUN ls -lh /build/best.pt && \
    echo "Model file size: $(du -h /build/best.pt | cut -f1)" && \
    echo "Model SHA256: $(sha256sum /build/best.pt | cut -d' ' -f1)" && \
    echo "Model verification complete"

# ========================================
# Stage 3: Runtime - Minimal production image
# ========================================
FROM base AS runtime

WORKDIR /app

# Copy verified model from prep stage
COPY --from=model-prep /build/best.pt /app/best.pt

# Copy the model copying script (from yolov8_model directory since context is root)
COPY yolov8_model/copy_model.sh /app/copy_model.sh

# Make the script executable and verify
RUN chmod +x /app/copy_model.sh && \
    ls -lh /app/

# Create the models directory
RUN mkdir -p /models

# Volume mount point for sharing models
VOLUME ["/models"]

# Labels for metadata
LABEL maintainer="code_martians" \
      description="YOLOv8 Model Provider - Helmet and Vest Detection" \
      version="1.0" \
      model.type="YOLOv8" \
      model.task="object-detection"

# This container will copy the model to the shared volume and keep running
# Running as root to avoid permission issues with Docker volumes
CMD ["/app/copy_model.sh"]
