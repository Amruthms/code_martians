# ========================================
# Stage 1: Dependencies - Install node modules
# ========================================
FROM node:18-alpine AS deps

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with clean install
RUN npm ci --silent --only=production && \
    npm cache clean --force

# ========================================
# Stage 2: Builder - Build the application
# ========================================
FROM node:18-alpine AS builder

WORKDIR /app

# Accept build argument for API URL
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=${VITE_API_URL}

# Copy package files and install ALL dependencies (including devDependencies)
COPY package*.json ./
RUN npm ci --silent

# Copy source code and configuration
COPY . .

# Build the application (outputs to /app/build directory)
RUN npm run build

# ========================================
# Stage 3: Production - Serve with nginx
# ========================================
FROM nginx:alpine AS production

# Install curl for healthcheck
RUN apk add --no-cache curl

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage (using 'build' dir, not 'dist')
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create nginx cache directories
RUN mkdir -p /var/cache/nginx/client_temp \
    /var/cache/nginx/proxy_temp \
    /var/cache/nginx/fastcgi_temp \
    /var/cache/nginx/uwsgi_temp \
    /var/cache/nginx/scgi_temp

# Set proper permissions
RUN chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

# Healthcheck (using curl with GET, not HEAD)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Run nginx
CMD ["nginx", "-g", "daemon off;"]
