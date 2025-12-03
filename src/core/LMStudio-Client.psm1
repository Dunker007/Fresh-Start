# LMStudio-Client.psm1
# Module for interacting with LM Studio API

function Test-LMStudioConnection {
    param(
        [string]$ApiUrl = "http://localhost:1234",
        [int]$TimeoutSec = 10
    )

    try {
        $null = Invoke-WebRequest -Uri "$ApiUrl/v1/models" -Method Get -TimeoutSec $TimeoutSec -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

function Get-LMStudioModels {
    param(
        [string]$ApiUrl = "http://localhost:1234",
        [int]$TimeoutSec = 10
    )

    try {
        $response = Invoke-RestMethod -Uri "$ApiUrl/v1/models" -Method Get -TimeoutSec $TimeoutSec -ErrorAction Stop
        return $response.data
    }
    catch {
        return $null
    }
}

function Invoke-LMStudioGeneration {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ApiUrl,

        [Parameter(Mandatory = $true)]
        [string]$SystemPrompt,

        [Parameter(Mandatory = $true)]
        [string]$UserPrompt,

        [string]$Model = "local-model",
        [int]$MaxTokens = 2000,
        [double]$Temperature = 0.7,
        [int]$TimeoutSec = 30,
        [int]$MaxRetries = 3
    )

    $Body = @{
        model       = $Model
        messages    = @(
            @{ role = "system"; content = $SystemPrompt },
            @{ role = "user"; content = $UserPrompt }
        )
        temperature = $Temperature
        max_tokens  = $MaxTokens
        stream      = $false
    } | ConvertTo-Json -Depth 5

    for ($attempt = 1; $attempt -le $MaxRetries; $attempt++) {
        try {
            $Response = Invoke-RestMethod -Uri $ApiUrl -Method Post -Body $Body -ContentType "application/json" -TimeoutSec $TimeoutSec -ErrorAction Stop

            if ($Response.choices -and $Response.choices.Count -gt 0) {
                return @{
                    Success = $true
                    Content = $Response.choices[0].message.content
                    Usage   = $Response.usage
                }
            }
            else {
                return @{
                    Success = $false
                    Error   = "No choices returned from API"
                }
            }
        }
        catch {
            if ($attempt -eq $MaxRetries) {
                return @{
                    Success = $false
                    Error   = $_.Exception.Message
                }
            }
            Start-Sleep -Seconds (2 * $attempt)  # Exponential backoff
        }
    }
}

function Get-PromptTemplate {
    param(
        [Parameter(Mandatory = $true)]
        [string]$TemplateName
    )

    $templatePath = "config/templates/$TemplateName.json"
    if (Test-Path $templatePath) {
        return Get-Content $templatePath | ConvertFrom-Json
    }
    else {
        throw "Template $TemplateName not found"
    }
}

function Use-PromptTemplate {
    param(
        [Parameter(Mandatory = $true)]
        [string]$TemplateName,
        [hashtable]$Variables = @{}
    )

    $template = Get-PromptTemplate -TemplateName $TemplateName
    $userPrompt = $template.userTemplate
    foreach ($key in $Variables.Keys) {
        $userPrompt = $userPrompt -replace "{{$key}}", $Variables[$key]
    }
    return @{
        SystemPrompt = $template.systemPrompt
        UserPrompt   = $userPrompt
    }
}

function New-BlogPost {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Topic,
        [string[]]$Keywords = @(),
        [int]$WordCount = 500,
        [string]$ApiUrl = "http://localhost:1234/v1/chat/completions",
        [string]$Model = "local-model"
    )

    # Use prompt template
    $prompts = Use-PromptTemplate -TemplateName "seo-blog-post" -Variables @{
        topic     = $Topic
        keywords  = ($Keywords -join ", ")
        wordCount = $WordCount
    }

    $result = Invoke-LMStudioGeneration -ApiUrl $ApiUrl -SystemPrompt $prompts.SystemPrompt -UserPrompt $prompts.UserPrompt -Model $Model
    if ($result.Success) {
        $content = $result.Content
        if ([string]::IsNullOrWhiteSpace($content)) {
            return @{ Success = $false; Error = "Generated content is empty" }
        }
        # Basic validation
        if (-not ($content -match '# ')) {
            Write-Warning "Generated content may not have proper headings"
        }
        return $result
    }
    else {
        return $result
    }
}

Export-ModuleMember -Function Test-LMStudioConnection, Get-LMStudioModels, Invoke-LMStudioGeneration, Get-PromptTemplate, Use-PromptTemplate, New-BlogPost
