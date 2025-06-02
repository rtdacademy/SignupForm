@echo off
REM Kyle's Windows Development Server Launcher
REM This script runs the React dev server with maximum memory

echo Starting Kyle's Development Server...
echo Memory Limit: 16GB
echo Fast Refresh: Disabled
echo Source Maps: Disabled  
echo Functions Emulator: Enabled

REM Set environment variables
set NODE_OPTIONS=--max-old-space-size=16384
set FAST_REFRESH=false
set GENERATE_SOURCEMAP=false
set REACT_APP_USE_FUNCTIONS_EMULATOR=true

REM Navigate to project directory using mapped drive
net use K: "\\wsl$\Ubuntu\home\kyle_\projects\SignupForm" 2>nul
cd /d K:\

REM Start the development server
echo.
echo Starting React development server...
npm run start:main

REM Clean up
net use K: /delete 2>nul