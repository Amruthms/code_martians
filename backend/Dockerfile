# ========================================
# Stage 1: Builder - Install dependencies
# ========================================
FROM python:3.10-slim AS builder

WORKDIR /app

# Install build dependencies and system libraries for OpenCV/YOLOv8
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    git \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy and install Python dependencies
# Install CPU-only PyTorch first to avoid CUDA version (saves ~1.5GB)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu torch==2.1.0 torchvision==0.16.0 && \
    pip install --no-cache-dir -r requirements.txt

# ========================================
# Stage 2: Runtime - Minimal production image
# ========================================
FROM python:3.10-slim AS runtime

WORKDIR /app

# Install only runtime dependencies (no build tools)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy application code
COPY . /app

# Create necessary directories
RUN mkdir -p /app/models /app/frames /app/logs

# Environment variables
ENV PYTHONUNBUFFERED=1 \
    MODEL_PATH=/app/models/best.pt \
    PYTHONDONTWRITEBYTECODE=1

EXPOSE 8000

# Healthcheck (using curl with GET request, not HEAD)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/stats || exit 1

# Run with uvicorn (use --reload for development)
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
