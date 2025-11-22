# Logger.ps1
# Simple logging module for Fresh-Start Orchestrator

param(
    [string]$LogPath = "..\..\data\logs\orchestrator.log"
)

function Write-Log {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Message,
        
        [string]$Level = "INFO",
        
        [string]$LogPath = "..\..\data\logs\orchestrator.log"
    )

    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogEntry = "[$Timestamp] [$Level] $Message"

    # Write to console with color
    switch ($Level) {
        "INFO" { Write-Host $LogEntry -ForegroundColor Cyan }
        "SUCCESS" { Write-Host $LogEntry -ForegroundColor Green }
        "WARNING" { Write-Host $LogEntry -ForegroundColor Yellow }
        "ERROR" { Write-Host $LogEntry -ForegroundColor Red }
        Default { Write-Host $LogEntry }
    }

    # Write to file
    try {
        # Ensure directory exists
        $LogDir = Split-Path -Parent $LogPath
        if (-not (Test-Path $LogDir)) {
            New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
        }

        Add-Content -Path $LogPath -Value $LogEntry
    }
    catch {
        Write-Warning "Failed to write to log file: $_"
    }
}

Export-ModuleMember -Function Write-Log
