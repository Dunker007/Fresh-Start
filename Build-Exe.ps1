<#
.SYNOPSIS
    Builds the DLX Studio Desktop Executable.
#>

$RootPath = Resolve-Path .
$DesktopPath = Join-Path $RootPath "desktop-app"
$WebPath = Join-Path $RootPath "website-v2"
$BridgePath = Join-Path $RootPath "luxrig-bridge"

Write-Host "🏗️  Building DLX Studio Executable..." -ForegroundColor Cyan

# 1. Build Website
Write-Host "1. Building Website (Next.js Standalone)..." -ForegroundColor Yellow
Push-Location $WebPath
npm install
npm run build
Pop-Location

# 2. Prepare Desktop App Directory
Write-Host "2. Preparing Build Resources in desktop-app..." -ForegroundColor Yellow

# Clean previous build artifacts
if (Test-Path "$DesktopPath\dist") { Remove-Item "$DesktopPath\dist" -Recurse -Force }
if (Test-Path "$DesktopPath\luxrig-bridge") { Remove-Item "$DesktopPath\luxrig-bridge" -Recurse -Force }
if (Test-Path "$DesktopPath\website-v2") { Remove-Item "$DesktopPath\website-v2" -Recurse -Force }

# Copy LuxRig Bridge
Write-Host "   Copying LuxRig Bridge..." -ForegroundColor Gray
Copy-Item "$BridgePath" "$DesktopPath\luxrig-bridge" -Recurse
# Remove node_modules to keep size down, reinstall in electron? 
# Or copy them if we want to be offline-ready. Copying is safer for distinct versions.
# bridge has its own node_modules.

# Copy Website Standalone
Write-Host "   Copying Website Standalone..." -ForegroundColor Gray
# The standalone folder structure is: .next/standalone/website-v2/...
# We want to copy the contents of standalone/website-v2 to desktop-app/website-v2
# AND copy public + static assets which are NOT in standalone by default correctly.

$StandaloneSource = "$WebPath\.next\standalone\website-v2"
Copy-Item $StandaloneSource "$DesktopPath\website-v2" -Recurse

# Copy Static Assets (Required for Next.js Standalone)
# 1. Public folder
Copy-Item "$WebPath\public" "$DesktopPath\website-v2\public" -Recurse
# 2. .next/static folder
New-Item -ItemType Directory -Force -Path "$DesktopPath\website-v2\.next\static" | Out-Null
Copy-Item "$WebPath\.next\static\*" "$DesktopPath\website-v2\.next\static" -Recurse

# 3. Build Electron App
Write-Host "3. Packaging with Electron Builder..." -ForegroundColor Yellow
Push-Location $DesktopPath
npm install
npm run dist
Pop-Location

Write-Host "✅ Build Complete! Check desktop-app/dist for the .exe" -ForegroundColor Green
