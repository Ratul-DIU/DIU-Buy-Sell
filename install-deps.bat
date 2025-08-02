@echo off
echo Installing DIU BUY & SELL Dependencies...
echo.

REM Clean install
echo Cleaning previous installation...
if exist "node_modules" rmdir /s /q node_modules
if exist "package-lock.json" del package-lock.json

echo Installing dependencies...
npm install

echo.
echo Dependencies installed successfully!
echo You can now run 'run-dev.bat' to start the development server.
pause 