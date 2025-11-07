#!/bin/bash

# ========================================
# EC2 Deployment Script - Fix Twilio Configuration
# ========================================

set -e

echo "🚀 Deploying Twilio configuration fixes to EC2..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# EC2 Configuration
EC2_IP="54.206.93.52"
EC2_USER="ubuntu"
PROJECT_DIR="code_martians"

echo -e "${YELLOW}📋 Step 1: Pull latest code on EC2${NC}"
ssh ${EC2_USER}@${EC2_IP} << 'EOF'
cd code_martians
git pull origin main
echo "✅ Code updated"
EOF

echo ""
echo -e "${YELLOW}📋 Step 2: Create/Update .env file on EC2${NC}"
echo "Creating .env file with correct variable names..."

ssh ${EC2_USER}@${EC2_IP} << 'EOF'
cd code_martians

# ⚠️ IMPORTANT: Replace these with your actual Twilio credentials before running!
# Create .env file with correct variable names
cat > .env << 'ENVFILE'
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_CALLER_NUMBER=+1234567890

# Application Base URL
BASE_URL=http://54.206.93.52:8000

# Emergency Contact Numbers (match app.py variable names - NO _NUMBER suffix!)
EMERGENCY_FIRE=+1234567890
EMERGENCY_AMBULANCE=+1234567890
EMERGENCY_POLICE=+1234567890
EMERGENCY_MANAGER=+1234567890
ENVFILE

echo "✅ .env file created with correct variable names"
cat .env
EOF

echo ""
echo -e "${YELLOW}📋 Step 3: Restart backend container${NC}"
ssh ${EC2_USER}@${EC2_IP} << 'EOF'
cd code_martians
docker-compose restart backend
echo "✅ Backend container restarted"
EOF

echo ""
echo -e "${YELLOW}📋 Step 4: Verify Twilio configuration${NC}"
sleep 3
ssh ${EC2_USER}@${EC2_IP} << 'EOF'
cd code_martians
echo "Checking backend logs for Twilio initialization..."
docker-compose logs backend | grep -i twilio | tail -5
EOF

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "🔍 Testing emergency calling:"
echo "   curl -X POST http://54.206.93.52:8000/voice/call/ \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"emergency_type\": \"Manager\", \"location\": \"Test Zone\", \"description\": \"Test call\"}'"
echo ""
echo "📊 View backend logs:"
echo "   ssh ubuntu@54.206.93.52 'cd code_martians && docker-compose logs -f backend'"
