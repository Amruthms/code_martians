FROM node:18-alpine AS builder
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci --silent

# Copy source and build
COPY . .
RUN npm run build

FROM nginx:alpine AS production

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Use bundled nginx.conf if provided in the repo, otherwise keep default
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
