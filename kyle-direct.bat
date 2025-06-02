@echo off
echo ========================================
echo Kyle's Direct React Development Server
echo ========================================
echo Memory: 16GB ^| Fast Refresh: OFF ^| Source Maps: OFF
echo Functions Emulator: ON
echo ========================================

REM Set all environment variables
set NODE_OPTIONS=--max-old-space-size=16384
set FAST_REFRESH=false
set GENERATE_SOURCEMAP=false
set REACT_APP_USE_FUNCTIONS_EMULATOR=true
set CHOKIDAR_USEPOLLING=true
set WATCHPACK_POLLING=true

echo Environment variables set:
echo NODE_OPTIONS=%NODE_OPTIONS%
echo FAST_REFRESH=%FAST_REFRESH%
echo GENERATE_SOURCEMAP=%GENERATE_SOURCEMAP%
echo REACT_APP_USE_FUNCTIONS_EMULATOR=%REACT_APP_USE_FUNCTIONS_EMULATOR%
echo CHOKIDAR_USEPOLLING=%CHOKIDAR_USEPOLLING%
echo WATCHPACK_POLLING=%WATCHPACK_POLLING%
echo.

echo Starting React development server...
echo Using Windows Node.js with WSL files directly
echo Press Ctrl+C when you want to stop
echo.

REM Change working directory using pushd (which works with UNC paths)
echo Changing to WSL directory...
pushd "\\wsl$\Ubuntu\home\kyle_\projects\SignupForm"
if %errorlevel% neq 0 (
    echo ERROR: Could not access WSL directory
    pause
    exit /b 1
)

echo Current directory: %CD%
echo Verifying package.json exists...
if not exist "package.json" (
    echo ERROR: package.json not found
    popd
    pause
    exit /b 1
)

echo SUCCESS: Found package.json
echo.

REM Use Windows Node.js to run react-scripts from the correct directory
node "node_modules\react-scripts\bin\react-scripts.js" start

REM Return to original directory
popd

echo.
echo Development server stopped.
pause