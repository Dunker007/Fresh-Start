# LMStudio-Client.ps1
# Module for interacting with LM Studio API

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
        [double]$Temperature = 0.7
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

    try {
        $Response = Invoke-RestMethod -Uri $ApiUrl -Method Post -Body $Body -ContentType "application/json" -ErrorAction Stop
        
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
        return @{
            Success = $false
            Error   = $_.Exception.Message
        }
    }
}

Export-ModuleMember -Function Invoke-LMStudioGeneration
