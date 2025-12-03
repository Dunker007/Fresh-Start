param(
    [switch]$DryRun,
    [int]$MaxCycles = [int]::MaxValue
)

# Minimal Working Orchestrator for Fresh-Start
# Runs continuously, generates content, publishes locally and to WordPress if enabled

# Import modules
Import-Module ".\src\core\Logger.psm1" -Force
Import-Module ".\src\core\LMStudio-Client.psm1" -Force
Import-Module ".\src\core\ContentQualityTester.psm1" -Force
Import-Module ".\src\core\ContentTracker.psm1" -Force
Import-Module ".\src\revenue\AdManager.psm1" -Force
Import-Module ".\src\publishers\HtmlPublisher.psm1" -Force
Import-Module ".\src\publishers\WordPressPublisher.psm1" -Force

# Load Config
$ConfigPath = ".\src\core\Config.json"
if (-not (Test-Path $ConfigPath)) {
    Write-Error "Config file not found at $ConfigPath"
    exit 1
}
$Config = Get-Content -Raw $ConfigPath | ConvertFrom-Json

# Setup logging
$LogPath = Join-Path ".\data\logs" "master-orchestrator.log"
if (-not (Test-Path (Split-Path $LogPath))) {
    New-Item -ItemType Directory -Path (Split-Path $LogPath) -Force | Out-Null
}

function Log {
    param([string]$Message, [string]$Level = "INFO")
    Write-Log -Message $Message -Level $Level -LogPath $LogPath
}

Log "Master Orchestrator started. DryRun: $($DryRun.IsPresent), MaxCycles: $MaxCycles"

$cycle = 0
while ($cycle -lt $MaxCycles) {
    $cycle++
    Log "Starting cycle $cycle"

    try {
        # Generate content
        $Topic = $Config.Defaults.Topic
        Log "Generating content for topic: $Topic"

        $Result = Invoke-LMStudioGeneration `
            -ApiUrl $Config.LMStudio.ApiUrl `
            -SystemPrompt $Config.Defaults.SystemPrompt `
            -UserPrompt "Write a blog post about: $Topic" `
            -Model $Config.LMStudio.Model `
            -MaxTokens $Config.LMStudio.MaxTokens `
            -Temperature $Config.LMStudio.Temperature

        if ($Result.Success) {
            Log "Content generated successfully"

            # Quality Check
            Log "Running quality check..."
            $Keywords = if ($Config.Defaults.Keywords) { $Config.Defaults.Keywords } else { $Config.WordPress.Tags }
            $QualityResult = Test-ContentQuality -Content $Result.Content -Keywords $Keywords
            Log "Quality Score: $($QualityResult.TotalScore)/100 (Grade: $($QualityResult.Grade))"

            if ($QualityResult.Passed) {
                # Publish locally
                if (-not $DryRun) {
                    $PublishResult = Publish-LocalBlog `
                        -Title $Topic `
                        -Content $Result.Content `
                        -OutputDir ".\data\published" `
                        -Keywords $Keywords `
                        -Config $Config

                    Log "Published locally to: $($PublishResult.HtmlPath)"

                    # Track Local Content
                    Add-ContentEntry `
                        -Title $Topic `
                        -Slug ($Topic -replace "[^a-zA-Z0-9]", "-") `
                        -Content $Result.Content `
                        -Platform "LocalHTML" `
                        -Url $PublishResult.HtmlPath `
                        -Metadata @{ QualityScore = $QualityResult.TotalScore; Grade = $QualityResult.Grade }
                }
                else {
                    Log "DryRun: Skipping local publish"
                }

                # Publish to WordPress if enabled
                if ($Config.WordPress.Enabled -and -not $DryRun) {
                    try {
                        Initialize-WordPressPublisher `
                            -SiteUrl $Config.WordPress.SiteUrl `
                            -Username $Config.WordPress.Username `
                            -AppPassword $Config.WordPress.AppPassword `
                            -DefaultStatus $Config.WordPress.DefaultStatus

                        $wpResult = Publish-WordPressPost `
                            -Title $Topic `
                            -Content $Result.Content `
                            -Categories $Config.WordPress.Categories `
                            -Tags $Config.WordPress.Tags

                        if ($wpResult.Success) {
                            Log "Published to WordPress! Post ID: $($wpResult.PostId), URL: $($wpResult.Url)"

                            # Track WordPress Content
                            Add-ContentEntry `
                                -Title $Topic `
                                -Slug ($Topic -replace "[^a-zA-Z0-9]", "-") `
                                -Content $Result.Content `
                                -Platform "WordPress" `
                                -Url $wpResult.Url `
                                -Metadata @{ QualityScore = $QualityResult.TotalScore; Grade = $QualityResult.Grade; PostId = $wpResult.PostId }
                        }
                        else {
                            Log "WordPress publish failed: $($wpResult.Error)" "ERROR"
                        }
                    }
                    catch {
                        Log "WordPress error: $_" "ERROR"
                    }
                }
                elseif ($DryRun) {
                    Log "DryRun: Skipping WordPress publish"
                }
                else {
                    Log "WordPress publishing disabled"
                }
            }
            else {
                Log "Content failed quality check. Skipping publication." "WARNING"
            }
        }
        else {
            Log "Generation failed: $($Result.Error)" "ERROR"
        }
    }
    catch {
        Log "Error in cycle $cycle`: $_" "ERROR"
    }

    # Wait before next cycle (optional, e.g., 60 seconds)
    Start-Sleep -Seconds 60
}

Log "Master Orchestrator finished after $cycle cycles"