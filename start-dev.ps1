# DIU BUY & SELL - Development Server Starter
# PowerShell script to handle paths with spaces

Write-Host "🚀 DIU BUY & SELL - Starting Development Server" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""

# Get the current directory
$currentDir = Get-Location
Write-Host "📍 Working Directory: $currentDir" -ForegroundColor Cyan

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    
    # Install dependencies
    try {
        npm install --no-optional --no-audit --no-fund
        Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
        Write-Host ""
    }
    catch {
        Write-Host "❌ Failed to install dependencies: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Start the development server
Write-Host "🌐 Starting development server..." -ForegroundColor Yellow
Write-Host "📍 Server will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

try {
    # Use npx to run next dev
    $env:NODE_OPTIONS = "--max-old-space-size=4096"
    npx next dev --port 3000
}
catch {
    Write-Host "❌ Failed to start development server: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Make sure you have Node.js 18+ installed" -ForegroundColor White
    Write-Host "2. Try running: npm cache clean --force" -ForegroundColor White
    Write-Host "3. Delete node_modules and package-lock.json, then run this script again" -ForegroundColor White
    exit 1
} 