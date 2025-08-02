@echo off
echo Building DIU BUY & SELL for Production...
echo.

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Build the project
echo Building project...
npx next build

echo.
echo Build completed! Run 'run-start.bat' to start the production server.
pause 