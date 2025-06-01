@echo off
echo ========================================
echo Kyle's Simple React Development Server
echo ========================================
echo Memory: 16GB ^| Fast Refresh: OFF ^| Source Maps: OFF
echo Functions Emulator: ON
echo ========================================

REM Set all environment variables
set NODE_OPTIONS=--max-old-space-size=16384
set FAST_REFRESH=false
set GENERATE_SOURCEMAP=false
set REACT_APP_USE_FUNCTIONS_EMULATOR=true

REM Clear any existing drive mapping
net use W: /delete 2>nul

REM Map WSL directory to W: drive
echo Mapping WSL directory to W: drive...
net use W: "\\wsl$\Ubuntu\home\kyle_\projects\SignupForm"
if %errorlevel% neq 0 (
    echo ERROR: Failed to map WSL directory
    echo Make sure WSL is running and the path exists
    pause
    exit /b 1
)

REM Change to mapped drive
W:

REM Verify we're in the right place
if not exist "package.json" (
    echo ERROR: package.json not found on W: drive
    echo Current directory: %CD%
    net use W: /delete
    pause
    exit /b 1
)

echo SUCCESS: Mapped to W: drive
echo Current directory: %CD%
echo.
echo Starting React development server...
echo Press Ctrl+C when you want to stop
echo.

REM Use Windows Node.js to run the WSL react-scripts directly
node "W:\node_modules\react-scripts\bin\react-scripts.js" start

echo.
echo Development server stopped.

REM Clean up
net use W: /delete 2>nul
pause