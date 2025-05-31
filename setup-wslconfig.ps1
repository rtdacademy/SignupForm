# PowerShell script to configure WSL memory settings
# Run this in PowerShell as Administrator on Windows

$wslConfigPath = "$env:USERPROFILE\.wslconfig"

$configContent = @"
[wsl2]
memory=8GB
swap=2GB
processors=4
"@

Write-Host "Creating .wslconfig file at: $wslConfigPath"
Set-Content -Path $wslConfigPath -Value $configContent

Write-Host "WSL configuration updated:"
Write-Host "- Memory: 8GB (increased from default)"
Write-Host "- Swap: 2GB (increased from 1GB)"
Write-Host "- Processors: 4"
Write-Host ""
Write-Host "To apply changes:"
Write-Host "1. Run: wsl --shutdown"
Write-Host "2. Wait 10 seconds"
Write-Host "3. Restart WSL/Ubuntu"
Write-Host ""
Write-Host "Current .wslconfig contents:"
Get-Content $wslConfigPath