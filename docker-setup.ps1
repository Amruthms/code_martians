# AI-Powered Construction Safety System - Docker Setup Script (PowerShell)
# This script helps you quickly set up and deploy the system using Docker on Windows

$ErrorActionPreference = "Stop"

# Colors
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Print-Header($message) {
    Write-ColorOutput Cyan "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-ColorOutput Cyan "  $message"
    Write-ColorOutput Cyan "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

function Print-Success($message) {
    Write-ColorOutput Green "✓ $message"
}

function Print-Error($message) {
    Write-ColorOutput Red "✗ $message"
}

function Print-Warning($message) {
    Write-ColorOutput Yellow "⚠ $message"
}

function Print-Info($message) {
    Write-ColorOutput Cyan "ℹ $message"
}

# Check prerequisites
function Check-Prerequisites {
    Print-Header "Checking Prerequisites"
    
    # Check Docker
    try {
        $dockerVersion = docker --version
        Print-Success "Docker installed: $dockerVersion"
    }
    catch {
        Print-Error "Docker is not installed"
        Print-Info "Please install Docker Desktop from: https://docs.docker.com/desktop/install/windows-install/"
        exit 1
    }
    
    # Check Docker Compose
    try {
        $composeVersion = docker-compose --version
        Print-Success "Docker Compose installed: $composeVersion"
    }
    catch {
        Print-Error "Docker Compose is not installed"
        Print-Info "Please install Docker Desktop which includes Docker Compose"
        exit 1
    }
    
    # Check if Docker daemon is running
    try {
        docker info | Out-Null
        Print-Success "Docker daemon is running"
    }
    catch {
        Print-Error "Docker daemon is not running"
        Print-Info "Please start Docker Desktop"
        exit 1
    }
    
    Write-Host ""
}

# Check model file
function Check-Model {
    Print-Header "Checking YOLOv8 Model"
    
    if (Test-Path "backend\best.pt") {
        $modelSize = (Get-Item "backend\best.pt").Length / 1MB
        Print-Success "YOLOv8 model found: backend\best.pt ($([math]::Round($modelSize, 2)) MB)"
    }
    else {
        Print-Warning "YOLOv8 model not found in backend\"
        
        $sourcePath = "yolov8_model\YOLOv8-Helmet-Vest-Detection-main\Testing_yolov8_model\best.pt"
        if (Test-Path $sourcePath) {
            Print-Info "Found model in yolov8_model folder, copying..."
            Copy-Item $sourcePath "backend\best.pt"
            Print-Success "Model copied to backend\best.pt"
        }
        else {
            Print-Error "YOLOv8 model not found"
            Print-Info "Please ensure best.pt is in the backend\ directory"
            exit 1
        }
    }
    
    Write-Host ""
}

# Create .env if not exists
function Setup-Env {
    Print-Header "Setting Up Environment"
    
    if (-not (Test-Path ".env")) {
        if (Test-Path ".env.example") {
            Print-Info "Creating .env from .env.example"
            Copy-Item ".env.example" ".env"
            Print-Success ".env file created"
        }
        else {
            Print-Warning ".env.example not found, skipping"
        }
    }
    else {
        Print-Success ".env file already exists"
    }
    
    Write-Host ""
}

# Build and start services
function Deploy-Services {
    Print-Header "Building and Starting Services"
    
    Print-Info "Building Docker images (this may take a few minutes)..."
    docker-compose build
    
    Print-Success "Images built successfully"
    
    Print-Info "Starting services..."
    docker-compose up -d
    
    Print-Success "Services started"
    
    Write-Host ""
}

# Wait for services
function Wait-ForServices {
    Print-Header "Waiting for Services to be Ready"
    
    Print-Info "Waiting for backend to be healthy..."
    
    $maxWait = 60
    $waited = 0
    
    while ($waited -lt $maxWait) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8000/stats" -UseBasicParsing -TimeoutSec 1
            Print-Success "Backend is ready"
            break
        }
        catch {
            Write-Host -NoNewline "."
            Start-Sleep -Seconds 2
            $waited += 2
        }
    }
    
    if ($waited -ge $maxWait) {
        Print-Warning "Backend health check timeout (still might be starting)"
    }
    
    Write-Host ""
    
    Print-Info "Waiting for frontend to be ready..."
    
    $waited = 0
    while ($waited -lt $maxWait) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:80" -UseBasicParsing -TimeoutSec 1
            Print-Success "Frontend is ready"
            break
        }
        catch {
            Write-Host -NoNewline "."
            Start-Sleep -Seconds 2
            $waited += 2
        }
    }
    
    if ($waited -ge $maxWait) {
        Print-Warning "Frontend health check timeout (still might be starting)"
    }
    
    Write-Host ""
}

# Show status
function Show-Status {
    Print-Header "Service Status"
    
    docker-compose ps
    
    Write-Host ""
}

# Show access info
function Show-AccessInfo {
    Print-Header "Access Information"
    
    Write-ColorOutput Green "🌐 Frontend Dashboard:"
    Write-Host "   • http://localhost:80"
    Write-Host "   • http://localhost:3001"
    Write-Host ""
    
    Write-ColorOutput Green "🔧 Backend API:"
    Write-Host "   • http://localhost:8000"
    Write-Host "   • API Docs: http://localhost:8000/docs"
    Write-Host "   • Health: http://localhost:8000/stats"
    Write-Host ""
    
    Write-ColorOutput Green "📱 To Add Phone Camera:"
    Write-Host "   1. Install 'IP Webcam' app on Android"
    Write-Host "   2. Start server in app (note the IP)"
    Write-Host "   3. Go to Settings → Cameras in dashboard"
    Write-Host "   4. Add camera: http://YOUR_PHONE_IP:8080/video"
    Write-Host ""
    
    Write-ColorOutput Green "📊 View Logs:"
    Write-Host "   • docker-compose logs -f"
    Write-Host "   • docker-compose logs -f backend"
    Write-Host "   • docker-compose logs -f frontend"
    Write-Host ""
    
    Write-ColorOutput Green "🛑 Stop Services:"
    Write-Host "   • docker-compose down"
    Write-Host ""
}

# Main execution
function Main {
    Clear-Host
    
    Print-Header "AI-Powered Construction Safety System"
    Print-Header "Docker Deployment Setup"
    
    Write-Host ""
    
    Check-Prerequisites
    Check-Model
    Setup-Env
    Deploy-Services
    Wait-ForServices
    Show-Status
    Show-AccessInfo
    
    Print-Header "🚀 Deployment Complete!"
    
    Write-ColorOutput Green "Your Construction Safety System is now running!"
    Write-Host ""
}

# Run main function
Main
