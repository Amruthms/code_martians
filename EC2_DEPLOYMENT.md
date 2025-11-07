# EC2 Deployment Guide

## Prerequisites on EC2 Instance

### System Requirements
- **Instance Type**: t3.medium or higher (2 vCPU, 4GB RAM minimum)
- **Storage**: 35 GB (our optimized Docker setup)
- **OS**: Ubuntu 22.04 LTS or Amazon Linux 2023
- **Ports**: 80, 443, 8000 (configure Security Group)

### Install Docker and Docker Compose

```bash
# Update system packages
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group (no sudo needed)
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

## Deployment Steps

### 1. Clone Repository and Checkout Master Branch

```bash
# Clone the repository
git clone https://github.com/Amruthms/code_martians.git
cd code_martians

# Checkout to master branch (optimized for EC2)
git checkout master

# Verify you're on master branch
git branch
```

### 2. Configure Environment Variables (Optional)

```bash
# Create .env file if you need custom configurations
cat > .env << EOF
CORS_ORIGINS=http://your-ec2-ip:80,http://your-ec2-ip:8000
VITE_API_URL=http://your-ec2-ip:8000
EOF
```

### 3. Build Docker Images

```bash
# Build all images (this will take 10-15 minutes)
docker-compose build --no-cache

# View built images and their sizes
docker images
```

### 4. Start the Application

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 5. Verify Deployment

```bash
# Check backend health
curl http://localhost:8000/stats

# Check frontend
curl http://localhost:80

# View resource usage
docker stats
```

### 6. Access the Application

- **Frontend Dashboard**: `http://<EC2-Public-IP>:80`
- **Backend API**: `http://<EC2-Public-IP>:8000`
- **API Docs**: `http://<EC2-Public-IP>:8000/docs`

## Storage Optimization

Our multistage Docker builds are optimized for minimal storage:

- **Backend Image**: ~1.5 GB (includes Python + dependencies)
- **Frontend Image**: ~50 MB (nginx + static files)
- **YOLOv8 Model**: ~25 MB (Alpine + model file)
- **Total**: ~2 GB (well within 35 GB limit)

## Monitoring and Maintenance

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v
```

### Clean Up Docker Resources
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused containers
docker container prune

# Complete cleanup (use carefully!)
docker system prune -a --volumes
```

## Updating the Application

```bash
# Pull latest changes
git pull origin master

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Troubleshooting

### Out of Memory Issues
```bash
# Check memory usage
free -h
docker stats

# Increase swap if needed
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Port Already in Use
```bash
# Check what's using port 80 or 8000
sudo lsof -i :80
sudo lsof -i :8000

# Kill the process if needed
sudo kill -9 <PID>
```

### Container Won't Start
```bash
# Check logs for specific container
docker logs safety-backend
docker logs safety-frontend

# Inspect container
docker inspect safety-backend
```

## Performance Optimization

### Enable Docker BuildKit
```bash
# Add to ~/.bashrc or ~/.profile
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
```

### Configure Docker Daemon
```bash
# Edit /etc/docker/daemon.json
sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}
EOF

sudo systemctl restart docker
```

## Security Considerations

### Firewall Configuration
```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8000/tcp
sudo ufw enable
```

### SSL/TLS Setup (Recommended for Production)
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com
```

## Backup and Recovery

### Backup Volumes
```bash
# Backup model volume
docker run --rm -v yolo_model_data:/data -v $(pwd):/backup alpine tar czf /backup/yolo_model_backup.tar.gz -C /data .

# Backup frames
tar czf frames_backup.tar.gz backend/frames/
```

### Restore Volumes
```bash
# Restore model volume
docker run --rm -v yolo_model_data:/data -v $(pwd):/backup alpine tar xzf /backup/yolo_model_backup.tar.gz -C /data

# Restore frames
tar xzf frames_backup.tar.gz
```

## Support

For issues or questions:
- GitHub Issues: https://github.com/Amruthms/code_martians/issues
- Documentation: Check README.md files in each directory
