@echo off
echo Starting DIU BUY & SELL Development Server...
echo.

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Start the development server
echo Starting development server...
npx next dev --port 3000

pause 