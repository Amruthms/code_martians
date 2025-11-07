#!/bin/bash

# ========================================
# Quick Build Script for Local Development
# ========================================

set -e

echo "Building Docker images for local development..."
echo ""

# Build with local API URL
docker-compose -f docker-compose.yml build \
    --build-arg VITE_API_URL=http://localhost:8000

echo ""
echo "✓ Build complete!"
echo ""
echo "Start services with: docker-compose up -d"
