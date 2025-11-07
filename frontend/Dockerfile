# ========================================
# Stage 1: Base - Setup Node environment
# ========================================
FROM node:18-alpine AS base

# Install required packages for build
RUN apk add --no-cache libc6-compat

WORKDIR /app

# ========================================
# Stage 2: Dependencies - Install production dependencies
# ========================================
FROM base AS deps-prod

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --silent --only=production && \
    npm cache clean --force

# ========================================
# Stage 3: Dependencies - Install all dependencies
# ========================================
FROM base AS deps-dev

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci --silent && \
    npm cache clean --force

# ========================================
# Stage 4: Builder - Build the application
# ========================================
FROM deps-dev AS builder

WORKDIR /app

# Accept build argument for API URL
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=${VITE_API_URL}

# Copy source code and configuration
COPY . .

# Build the application (outputs to /app/build directory)
RUN npm run build

# Verify build output and remove source maps in production
RUN ls -la /app/build && \
    echo "Build directory size:" && \
    du -sh /app/build && \
    find /app/build -name "*.map" -type f -delete

# ========================================
# Stage 5: Nginx Base - Prepare nginx
# ========================================
FROM nginx:alpine AS nginx-base

# Install curl for healthcheck and security updates
RUN apk add --no-cache curl && \
    apk upgrade --no-cache

# Remove default nginx static assets and configs
RUN rm -rf /usr/share/nginx/html/* && \
    rm -f /etc/nginx/conf.d/default.conf

# ========================================
# Stage 6: Production - Final minimal image
# ========================================
FROM nginx-base AS production

# Copy built assets from builder stage (using 'build' dir, not 'dist')
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create nginx cache directories with proper permissions
RUN mkdir -p /var/cache/nginx/client_temp \
    /var/cache/nginx/proxy_temp \
    /var/cache/nginx/fastcgi_temp \
    /var/cache/nginx/uwsgi_temp \
    /var/cache/nginx/scgi_temp && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Create PID directory for nginx
RUN mkdir -p /var/run/nginx && \
    chown -R nginx:nginx /var/run/nginx

# Labels for metadata
LABEL maintainer="code_martians" \
      description="Safety Monitoring Frontend - Production Build" \
      version="1.0"

EXPOSE 80

# Healthcheck (using curl with GET, not HEAD)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Run nginx in foreground
# Note: nginx master runs as root, workers run as nginx user (defined in nginx.conf)
CMD ["nginx", "-g", "daemon off;"]
