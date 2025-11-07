# Quick Deployment Guide for EC2 Instance
# IP: 54.206.93.52

## Step 1: Connect to EC2
```bash
# Replace with your key file path
ssh -i "your-key.pem" ubuntu@54.206.93.52
# or
ssh -i "your-key.pem" ec2-user@54.206.93.52
```

## Step 2: Clone and Checkout Master Branch
```bash
# Clone repository
git clone https://github.com/Amruthms/code_martians.git
cd code_martians

# Checkout master branch
git checkout master

# Verify you're on master
git branch
```

## Step 3: Run Automated Setup
```bash
# Make script executable
chmod +x ec2-setup.sh

# Run setup (installs Docker, builds images, starts services)
./ec2-setup.sh
```

## Step 4: Verify Deployment
```bash
# Check if all services are running
docker-compose ps

# Check logs
docker-compose logs -f

# Test backend
curl http://localhost:8000/stats

# Test frontend
curl http://localhost:80
```

## Step 5: Configure Security Group

**Ensure these ports are open in your EC2 Security Group:**

| Port | Protocol | Source | Purpose |
|------|----------|--------|---------|
| 22 | TCP | Your IP | SSH |
| 80 | TCP | 0.0.0.0/0 | Frontend (HTTP) |
| 443 | TCP | 0.0.0.0/0 | Frontend (HTTPS) - Optional |
| 8000 | TCP | 0.0.0.0/0 | Backend API |

**To configure in AWS Console:**
1. Go to EC2 Dashboard
2. Select your instance
3. Click "Security" tab
4. Click the security group link
5. Click "Edit inbound rules"
6. Add the rules above
7. Save rules

## Step 6: Access Your Application

Once deployed, access your application at:

- **Frontend Dashboard**: http://54.206.93.52:80
- **Backend API**: http://54.206.93.52:8000
- **API Documentation**: http://54.206.93.52:8000/docs
- **API Alternative Docs**: http://54.206.93.52:8000/redoc

## Useful Commands

### View Service Status
```bash
docker-compose ps
```

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
docker-compose down
```

### Update Application
```bash
# Pull latest changes
git pull origin master

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Monitor Resources
```bash
# Docker stats
docker stats

# System resources
htop  # install with: sudo apt-get install htop -y

# Disk usage
df -h
docker system df
```

### Clean Up
```bash
# Remove unused Docker resources
docker system prune -a

# Remove specific images
docker rmi <image-id>

# Remove volumes (careful!)
docker volume prune
```

## Troubleshooting

### Services won't start
```bash
# Check logs
docker-compose logs

# Check Docker status
sudo systemctl status docker

# Restart Docker
sudo systemctl restart docker
```

### Port already in use
```bash
# Check what's using port 80 or 8000
sudo lsof -i :80
sudo lsof -i :8000

# Kill process if needed
sudo kill -9 <PID>
```

### Out of memory
```bash
# Check memory
free -h

# Add swap space
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Model not loading
```bash
# Check if model volume is populated
docker volume inspect yolo_model_data
docker run --rm -v yolo_model_data:/data alpine ls -lh /data

# If empty, restart yolov8-model service
docker-compose restart yolov8-model
```

## Setup SSL/HTTPS (Optional but Recommended)

### Install Certbot
```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx -y
```

### Get SSL Certificate
```bash
# You need a domain name pointing to 54.206.93.52
sudo certbot --nginx -d yourdomain.com
```

### Auto-renew
```bash
# Test renewal
sudo certbot renew --dry-run

# Add to crontab for auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

## Backup

### Backup Important Data
```bash
# Create backup directory
mkdir -p ~/backups

# Backup model volume
docker run --rm -v yolo_model_data:/data -v ~/backups:/backup alpine tar czf /backup/yolo_model_backup.tar.gz -C /data .

# Backup frames and logs
tar czf ~/backups/frames_backup.tar.gz backend/frames/
tar czf ~/backups/logs_backup.tar.gz backend/logs/

# Backup configuration
tar czf ~/backups/config_backup.tar.gz docker-compose.yml .env.production backend/requirements.txt
```

### Restore from Backup
```bash
# Restore model volume
docker run --rm -v yolo_model_data:/data -v ~/backups:/backup alpine tar xzf /backup/yolo_model_backup.tar.gz -C /data

# Restore frames
tar xzf ~/backups/frames_backup.tar.gz

# Restore logs
tar xzf ~/backups/logs_backup.tar.gz
```

## Performance Monitoring

### Install Monitoring Tools
```bash
sudo apt-get update
sudo apt-get install htop iotop nethogs -y
```

### Check Performance
```bash
# CPU and Memory
htop

# Disk I/O
sudo iotop

# Network
sudo nethogs

# Docker stats
docker stats --no-stream
```

## Quick Reference Card

```
┌─────────────────────────────────────────────┐
│         EC2 Instance Details                │
├─────────────────────────────────────────────┤
│ Public IP:    54.206.93.52                  │
│ Frontend:     http://54.206.93.52:80        │
│ Backend:      http://54.206.93.52:8000      │
│ API Docs:     http://54.206.93.52:8000/docs │
├─────────────────────────────────────────────┤
│ SSH:          ssh -i key.pem user@54.206... │
│ Start:        docker-compose up -d          │
│ Stop:         docker-compose down           │
│ Logs:         docker-compose logs -f        │
│ Status:       docker-compose ps             │
└─────────────────────────────────────────────┘
```

## Need Help?

1. Check logs: `docker-compose logs -f`
2. Check status: `docker-compose ps`
3. Check resources: `docker stats`
4. Review documentation: `cat DOCKER_REVIEW.md`
5. Re-run setup: `./ec2-setup.sh`

---

**Last Updated:** November 7, 2025
**EC2 IP:** 54.206.93.52
**Branch:** master
