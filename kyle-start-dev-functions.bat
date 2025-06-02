@echo off
REM Kyle's Windows Development Server Launcher with Functions Emulator
REM This script runs the React dev server with maximum memory and Functions emulator

echo Starting Kyle's Development Server with Functions Emulator...
echo Memory Limit: 16GB
echo Fast Refresh: Disabled
echo Source Maps: Disabled  
echo Functions Emulator: Enabled

REM Set environment variables
set NODE_OPTIONS=--max-old-space-size=16384
set FAST_REFRESH=false
set GENERATE_SOURCEMAP=false
set REACT_APP_USE_FUNCTIONS_EMULATOR=true

REM Try multiple approaches to access the WSL directory

echo Attempting drive mapping...
net use K: /delete 2>nul
net use K: "\\wsl$\Ubuntu\home\kyle_\projects\SignupForm" 2>nul
if %errorlevel% equ 0 (
    echo Drive mapping successful to K:
    cd /d K:\
    if exist "package.json" (
        goto :start_server
    ) else (
        echo Error: package.json not found on mapped drive
        net use K: /delete 2>nul
    )
)

echo Drive mapping failed, trying alternative path...
if exist "\\wsl.localhost\Ubuntu\home\kyle_\projects\SignupForm" (
    pushd "\\wsl.localhost\Ubuntu\home\kyle_\projects\SignupForm"
    goto :start_server
)

echo All methods failed. Please run this from within the WSL directory.
pause
exit /b 1

:start_server
echo.
echo Current directory: %CD%
if not exist "package.json" (
    echo Error: package.json not found in current directory
    pause
    exit /b 1
)

echo Starting React development server directly...
echo Press Ctrl+C to stop the server when you're done developing
echo.
REM Check if node_modules exists
if not exist "node_modules" (
    echo Error: node_modules directory not found
    echo Please run 'npm install' first
    pause
    exit /b 1
)

REM Use local node_modules react-scripts directly
echo Using local react-scripts from node_modules...
if exist "node_modules\.bin\react-scripts.cmd" (
    echo Found react-scripts.cmd
    call "node_modules\.bin\react-scripts.cmd" start
) else if exist "node_modules\.bin\react-scripts" (
    echo Found react-scripts (no .cmd)
    call node "node_modules\.bin\react-scripts" start
) else (
    echo react-scripts not found in node_modules\.bin
    echo Trying direct node execution...
    call node "node_modules\react-scripts\bin\react-scripts.js" start
)

echo.
echo Development server has stopped.
pause

REM Clean up
if defined K: net use K: /delete 2>nul
popd 2>nul