@echo off
echo 🚀 Starting DIU BUY & SELL Development Server...
echo.

REM Check if PowerShell is available
powershell -Command "Write-Host 'PowerShell is available'" >nul 2>&1
if errorlevel 1 (
    echo ❌ PowerShell is not available or not working properly
    pause
    exit /b 1
)

REM Run the PowerShell script
powershell -ExecutionPolicy Bypass -File "%~dp0start-dev.ps1"

REM Keep the window open if there was an error
if errorlevel 1 (
    echo.
    echo ❌ An error occurred. Check the output above.
    pause
) 