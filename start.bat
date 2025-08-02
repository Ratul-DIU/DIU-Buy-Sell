@echo off
echo 🚀 DIU BUY & SELL - Starting Development Server
echo ===============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

REM Run the Node.js script
echo Starting the application...
node start.js

pause 