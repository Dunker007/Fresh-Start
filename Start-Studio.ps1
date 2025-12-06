<#
.SYNOPSIS
    Starts the full DLX Studio stack (LuxRig Bridge + Website).
.DESCRIPTION
    1. Checks for node_modules.
    2. Starts LuxRig Bridge (API) in a separate window.
    3. Starts Next.js Website (UI) in a separate window.
    4. Launches the default browser.
.EXAMPLE
    .\Start-Studio.ps1
#>

$RootPath = Resolve-Path .
$BridgePath = Join-Path $RootPath "luxrig-bridge"
$WebPath = Join-Path $RootPath "website-v2"

Write-Host "🚀 Launching DLX Studio..." -ForegroundColor Cyan

# 1. Start LuxRig Bridge
Write-Host "   Starting LuxRig Bridge..." -ForegroundColor Yellow
if (!(Test-Path "$BridgePath\node_modules")) {
    Write-Host "   Installing Bridge dependencies..." -ForegroundColor DarkGray
    Start-Process powershell -ArgumentList "-NoExit","-Command & {cd '$BridgePath'; npm install}" -Wait
}
Start-Process powershell -ArgumentList "-NoExit","-Command & {cd '$BridgePath'; $host.ui.RawUI.WindowTitle = 'LuxRig Bridge'; npm start}"

# 2. Start Website
Write-Host "   Starting Website..." -ForegroundColor Yellow
if (!(Test-Path "$WebPath\node_modules")) {
    Write-Host "   Installing Website dependencies..." -ForegroundColor DarkGray
    Start-Process powershell -ArgumentList "-NoExit","-Command & {cd '$WebPath'; npm install}" -Wait
}
# Assuming 'npm run build' has been run. If not, maybe run dev? 
# Using 'npm start' implies production build exists.
Start-Process powershell -ArgumentList "-NoExit","-Command & {cd '$WebPath'; $host.ui.RawUI.WindowTitle = 'DLX Studio UI'; npm start}"

# 3. Open Browser
Write-Host "   Waiting for services to spin up..." -ForegroundColor Gray
Start-Sleep -Seconds 5
Write-Host "   Opening Dashboard..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host "✅ Done! Services are running in background windows." -ForegroundColor Cyan
