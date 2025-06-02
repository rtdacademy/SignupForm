# Kyle's PowerShell Development Server Launcher
# This script handles UNC paths better than batch files

Write-Host "Starting Kyle's Development Server with Functions Emulator..." -ForegroundColor Green
Write-Host "Memory Limit: 16GB" -ForegroundColor Yellow
Write-Host "Fast Refresh: Disabled" -ForegroundColor Yellow
Write-Host "Source Maps: Disabled" -ForegroundColor Yellow
Write-Host "Functions Emulator: Enabled" -ForegroundColor Yellow

# Set environment variables
$env:NODE_OPTIONS = "--max-old-space-size=16384"
$env:FAST_REFRESH = "false"
$env:GENERATE_SOURCEMAP = "false"
$env:REACT_APP_USE_FUNCTIONS_EMULATOR = "true"

# Try to navigate to WSL directory
$wslPath = "\\wsl$\Ubuntu\home\kyle_\projects\SignupForm"
$altPath = "\\wsl.localhost\Ubuntu\home\kyle_\projects\SignupForm"

Write-Host "Attempting to access WSL directory..." -ForegroundColor Cyan

if (Test-Path $wslPath) {
    Write-Host "Using WSL path: $wslPath" -ForegroundColor Green
    Set-Location $wslPath
} elseif (Test-Path $altPath) {
    Write-Host "Using alternative WSL path: $altPath" -ForegroundColor Green
    Set-Location $altPath
} else {
    Write-Host "Error: Cannot access WSL directory" -ForegroundColor Red
    Write-Host "Make sure WSL is running and the path exists" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Verify we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found in current directory" -ForegroundColor Red
    Write-Host "Current location: $(Get-Location)" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Green
Write-Host "Starting React development server..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server when done" -ForegroundColor Yellow
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Error: node_modules directory not found" -ForegroundColor Red
    Write-Host "Please run 'npm install' first" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Start the development server using local react-scripts
Write-Host "Using local react-scripts from node_modules..." -ForegroundColor Cyan

try {
    if (Test-Path "node_modules\.bin\react-scripts.cmd") {
        Write-Host "Found react-scripts.cmd" -ForegroundColor Green
        & "node_modules\.bin\react-scripts.cmd" start
    } elseif (Test-Path "node_modules\.bin\react-scripts") {
        Write-Host "Found react-scripts (no .cmd)" -ForegroundColor Green
        node "node_modules\.bin\react-scripts" start
    } elseif (Test-Path "node_modules\react-scripts\bin\react-scripts.js") {
        Write-Host "Using direct react-scripts.js" -ForegroundColor Green
        node "node_modules\react-scripts\bin\react-scripts.js" start
    } else {
        Write-Host "react-scripts not found in any expected location" -ForegroundColor Red
        Write-Host "Checking node_modules structure..." -ForegroundColor Yellow
        Get-ChildItem "node_modules\.bin" | Where-Object { $_.Name -like "*react*" } | ForEach-Object { Write-Host "Found: $($_.Name)" }
    }
} catch {
    Write-Host "Error starting development server: $_" -ForegroundColor Red
    Write-Host "Exception details: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Development server has stopped." -ForegroundColor Yellow
Read-Host "Press Enter to exit"