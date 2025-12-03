# ContentTracker.psm1
# Module for tracking published content using JSON database

$ContentDbPath = "$PSScriptRoot\..\..\data\content-tracker.json"

function Initialize-ContentTracker {
    if (-not (Test-Path $ContentDbPath)) {
        @() | ConvertTo-Json | Set-Content -Path $ContentDbPath
    }
}

function Get-ContentHash {
    param([string]$Content)
    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    $hash = $sha256.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($Content))
    return [BitConverter]::ToString($hash) -replace '-', ''
}

function Add-ContentEntry {
    param(
        [Parameter(Mandatory = $true)][string]$Title,
        [Parameter(Mandatory = $true)][string]$Slug,
        [Parameter(Mandatory = $true)][string]$Content,
        [Parameter(Mandatory = $true)][string]$Platform,
        [Parameter(Mandatory = $true)][string]$Url,
        [hashtable]$Metadata = @{}
    )

    Initialize-ContentTracker
    $db = Get-Content -Raw $ContentDbPath | ConvertFrom-Json

    $entry = @{
        Title       = $Title
        Slug        = $Slug
        ContentHash = Get-ContentHash -Content $Content
        Platform    = $Platform
        Url         = $Url
        Metadata    = $Metadata
        CreatedAt   = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
    }

    $db += $entry

    $db | ConvertTo-Json -Depth 5 | Set-Content -Path $ContentDbPath
}

function Get-ContentEntries {
    param(
        [string]$Platform,
        [string]$Slug
    )

    Initialize-ContentTracker
    $db = Get-Content -Raw $ContentDbPath | ConvertFrom-Json

    if ($Platform) {
        $db = $db | Where-Object { $_.Platform -eq $Platform }
    }
    if ($Slug) {
        $db = $db | Where-Object { $_.Slug -eq $Slug }
    }

    return $db
}

function Get-ContentEntryByHash {
    param([string]$Hash)
    Initialize-ContentTracker
    $db = Get-Content -Raw $ContentDbPath | ConvertFrom-Json
    return $db | Where-Object { $_.ContentHash -eq $Hash }
}

Export-ModuleMember -Function Add-ContentEntry, Get-ContentEntries, Get-ContentEntryByHash