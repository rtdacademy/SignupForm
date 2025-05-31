# PowerShell script to create .wslconfig
# Run this from Windows PowerShell (not WSL)

$configContent = @"
[wsl2]
memory=6GB
processors=4
swap=1GB
localhostForwarding=true
"@

$configPath = "$env:USERPROFILE\.wslconfig"
Write-Host "Creating .wslconfig at: $configPath"
$configContent | Out-File -FilePath $configPath -Encoding UTF8

Write-Host "✅ .wslconfig created successfully!"
Write-Host "⚠️  Please restart WSL with: wsl --shutdown"
Write-Host "Then restart your terminal and try again."