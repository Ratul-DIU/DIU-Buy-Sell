Write-Host "Starting DIU BUY & SELL Development Server..." -ForegroundColor Green
Write-Host ""

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the development server
Write-Host "Starting development server..." -ForegroundColor Yellow
npx next dev --port 3000

Read-Host "Press Enter to exit" 