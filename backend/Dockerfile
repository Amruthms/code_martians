# ========================================
# Stage 1: Base - Common dependencies
# ========================================
FROM python:3.10-slim AS base

# Install system dependencies required for both build and runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# ========================================
# Stage 2: Builder - Install dependencies
# ========================================
FROM base AS builder

WORKDIR /build

# Install build-only dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    git \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy only requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
# Install CPU-only PyTorch first to avoid CUDA version (saves ~1.5GB)
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu \
    torch==2.1.0 torchvision==0.16.0 && \
    pip install --no-cache-dir -r requirements.txt && \
    # Remove pip cache and unnecessary files to reduce size
    find /opt/venv -type d -name '__pycache__' -exec rm -rf {} + 2>/dev/null || true && \
    find /opt/venv -type f -name '*.pyc' -delete 2>/dev/null || true && \
    find /opt/venv -type f -name '*.pyo' -delete 2>/dev/null || true

# ========================================
# Stage 3: Runtime - Minimal production image
# ========================================
FROM base AS runtime

WORKDIR /app

# Copy virtual environment from builder stage
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy application code
COPY app.py detector.py helmet_infer.py vest_detector.py ppe.py ./
COPY best.pt ./best.pt

# Create intel directory and copy models if they exist
RUN mkdir -p ./intel
COPY intel ./intel/

# Create necessary directories for model, frames, and logs
RUN mkdir -p /app/models /app/frames /app/logs && \
    # Create non-root user for security
    useradd -m -u 1000 -s /bin/bash appuser && \
    chown -R appuser:appuser /app

# Environment variables
ENV PYTHONUNBUFFERED=1 \
    MODEL_PATH=/app/models/best.pt \
    PYTHONDONTWRITEBYTECODE=1 \
    PROCESS_EVERY_N_FRAMES=5 \
    INFERENCE_SIZE=480 \
    JPEG_QUALITY=70

# Switch to non-root user
USER appuser

EXPOSE 8000

# Healthcheck (using curl with GET request, not HEAD)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/stats || exit 1

# Run with uvicorn
# Workers=2 for parallel request handling
# --log-level info for production logging
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2", "--log-level", "info"]
