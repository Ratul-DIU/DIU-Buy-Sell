@echo off
echo 🚀 Starting DIU BUY & SELL Project...
echo.

REM Check if yarn is available
yarn --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Yarn is not installed. Installing yarn...
    npm install -g yarn
)

REM Start the development server
echo 🌐 Starting development server...
echo 📍 Server will be available at: http://localhost:3000
echo.

yarn dev

REM Keep the window open if there was an error
if errorlevel 1 (
    echo.
    echo ❌ An error occurred. Check the output above.
    pause
) 