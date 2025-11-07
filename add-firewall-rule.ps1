# PowerShell script to add firewall rule for port 8000
# This script automatically requests administrator privileges

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host " Requesting Administrator Privileges..." -ForegroundColor Yellow
    Write-Host "════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host ""
    
    # Re-launch as administrator
    Start-Process powershell.exe -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

# Now running as administrator
Write-Host "════════════════════════════════════════" -ForegroundColor Green
Write-Host " Adding Firewall Rule for Port 8000" -ForegroundColor Green
Write-Host "════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

Write-Host "✓ Running with administrator privileges" -ForegroundColor Green
Write-Host ""

# Add the firewall rule
Write-Host "Adding inbound rule for TCP port 8000..." -ForegroundColor Cyan

try {
    New-NetFirewallRule -DisplayName "FastAPI Sensor Backend" `
                        -Direction Inbound `
                        -Action Allow `
                        -Protocol TCP `
                        -LocalPort 8000 `
                        -ErrorAction Stop
    
    Write-Host ""
    Write-Host "✅ SUCCESS: Firewall rule added!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Port 8000 is now allowed through Windows Firewall" -ForegroundColor White
    Write-Host "Your phone should now be able to connect to:" -ForegroundColor White
    Write-Host "   http://10.130.181.39:8000/api/sensor-data" -ForegroundColor Yellow
    
} catch {
    # Try using netsh as fallback
    Write-Host "Trying alternative method..." -ForegroundColor Yellow
    
    $result = netsh advfirewall firewall add rule name="FastAPI Sensor Backend" dir=in action=allow protocol=TCP localport=8000
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ SUCCESS: Firewall rule added!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Port 8000 is now allowed through Windows Firewall" -ForegroundColor White
        Write-Host "Your phone should now be able to connect to:" -ForegroundColor White
        Write-Host "   http://10.130.181.39:8000/api/sensor-data" -ForegroundColor Yellow
    } else {
        Write-Host ""
        Write-Host "❌ ERROR: Failed to add firewall rule" -ForegroundColor Red
        Write-Host "Error message: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please add it manually in Windows Firewall settings" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Green

# Test the connection
Write-Host ""
Write-Host "Testing connection..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/stats" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Backend is accessible!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not test connection (backend might not be running)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
