# Backend Dockerfile with YOLOv8 and OpenCV support
FROM python:3.11-slim

# Install system dependencies for OpenCV and video processing
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir ultralytics opencv-python-headless

# Copy application code
COPY . .

# Copy YOLOv8 model (best.pt should be in backend directory)
# Model is already copied with COPY . .

# Create necessary directories
RUN mkdir -p frames logs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8000/stats || exit 1

# Run the application (without --reload for production)
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
