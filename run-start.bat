@echo off
echo Starting DIU BUY & SELL Production Server...
echo.

REM Check if build exists
if not exist ".next" (
    echo Build not found! Run 'run-build.bat' first.
    pause
    exit /b 1
)

REM Start the production server
echo Starting production server...
npx next start --port 3000

pause 