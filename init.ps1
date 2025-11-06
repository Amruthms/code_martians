# First-Time Project Initialization Script
# Run this script once after cloning the repository

Write-Host "🏗️  AI-Powered Construction Safety System - First-Time Setup" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Create .env file
if (-not (Test-Path .env)) {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ .env file created" -ForegroundColor Green
    Write-Host "⚠️  Please edit .env file with your configuration" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}
Write-Host ""

# Create frontend .env
Write-Host "📝 Setting up frontend environment..." -ForegroundColor Yellow
if (-not (Test-Path frontend\.env)) {
    Copy-Item frontend\.env.example frontend\.env
    Write-Host "✅ Frontend .env created" -ForegroundColor Green
} else {
    Write-Host "✅ Frontend .env already exists" -ForegroundColor Green
}
Write-Host ""

# Create frames directory for vision
Write-Host "📁 Creating vision frames directory..." -ForegroundColor Yellow
if (-not (Test-Path vision\frames)) {
    New-Item -ItemType Directory -Path vision\frames | Out-Null
    Write-Host "✅ Frames directory created" -ForegroundColor Green
} else {
    Write-Host "✅ Frames directory already exists" -ForegroundColor Green
}
Write-Host ""

# Check Python installation
Write-Host "🐍 Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found! Please install Python 3.8 or higher" -ForegroundColor Red
    Write-Host "   Download from: https://www.python.org/downloads/" -ForegroundColor Yellow
}
Write-Host ""

# Check Node.js installation
Write-Host "📦 Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install Node.js 18 or higher" -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow
}
Write-Host ""

# Check npm installation
Write-Host "📦 Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>&1
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found! It should come with Node.js" -ForegroundColor Red
}
Write-Host ""

# Ask about automatic dependency installation
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Would you like to install dependencies now?" -ForegroundColor Yellow
Write-Host "This will:" -ForegroundColor White
Write-Host "  1. Create Python virtual environments" -ForegroundColor White
Write-Host "  2. Install backend dependencies" -ForegroundColor White
Write-Host "  3. Install vision processing dependencies" -ForegroundColor White
Write-Host "  4. Install frontend npm packages" -ForegroundColor White
Write-Host ""
$install = Read-Host "Install dependencies? (y/n)"

if ($install -eq 'y' -or $install -eq 'Y') {
    Write-Host ""
    Write-Host "🔧 Installing dependencies... This may take a few minutes" -ForegroundColor Cyan
    Write-Host ""
    
    # Backend setup
    Write-Host "📦 Setting up backend..." -ForegroundColor Yellow
    Set-Location backend
    if (-not (Test-Path venv)) {
        python -m venv venv
    }
    .\venv\Scripts\Activate.ps1
    pip install --upgrade pip | Out-Null
    pip install -r requirements.txt
    deactivate
    Set-Location ..
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
    Write-Host ""
    
    # Vision setup
    Write-Host "📦 Setting up vision processing..." -ForegroundColor Yellow
    Set-Location vision
    if (-not (Test-Path myvenv)) {
        python -m venv myvenv
    }
    .\myvenv\Scripts\Activate.ps1
    pip install --upgrade pip | Out-Null
    pip install -r requirements.txt
    deactivate
    Set-Location ..
    Write-Host "✅ Vision dependencies installed" -ForegroundColor Green
    Write-Host ""
    
    # Frontend setup
    Write-Host "📦 Installing frontend packages..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
    Write-Host ""
}

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🎉 Initialization Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Edit .env file with your configuration" -ForegroundColor White
Write-Host "   - Set VITE_API_URL if backend is not on localhost:8000" -ForegroundColor Gray
Write-Host "   - Configure VIDEO_SOURCE in vision/config.yaml" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Configure safety zones in vision/config.yaml" -ForegroundColor White
Write-Host "   - Define polygon coordinates for restricted areas" -ForegroundColor Gray
Write-Host "   - Adjust HSV color ranges for PPE detection" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Start the system:" -ForegroundColor White
Write-Host "   .\start.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Access the dashboard:" -ForegroundColor White
Write-Host "   http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "📖 For more information:" -ForegroundColor Cyan
Write-Host "   - Read README.md for project overview" -ForegroundColor White
Write-Host "   - Read SETUP.md for detailed setup instructions" -ForegroundColor White
Write-Host "   - Check vision/README.md for camera troubleshooting" -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to exit..."
