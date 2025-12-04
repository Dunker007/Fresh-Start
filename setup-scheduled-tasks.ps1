# Setup Scheduled Tasks for Fresh-Start Content Generation
# This script creates 4 scheduled tasks to run master-orchestrator-minimal.ps1 at varying times

$ScriptPath = "C:\Repos GIT\Fresh-Start\Fresh-Start\master-orchestrator-minimal.ps1"
$TaskNamePrefix = "FreshStart-ContentGen-"

# Define 4 varying times (HH:MM format)
$Times = @("08:15", "12:22", "16:37", "20:45")

for ($i = 1; $i -le 4; $i++) {
    $TaskName = "$TaskNamePrefix$i"
    $Time = $Times[$i - 1]

    # Delete existing task if it exists
    schtasks /delete /tn $TaskName /f 2>$null

    # Create new task
    $Command = "schtasks /create /tn `"$TaskName`" /tr `"powershell.exe -ExecutionPolicy Bypass -File \`"$ScriptPath\`"`" /sc daily /st $Time /ru SYSTEM"

    Write-Host "Creating task: $TaskName at $Time"
    Invoke-Expression $Command

    if ($LASTEXITCODE -eq 0) {
        Write-Host "Task $TaskName created successfully"
    }
    else {
        Write-Error "Failed to create task $TaskName"
    }
}

Write-Host "Scheduled tasks setup complete. Check Task Scheduler for verification."