# HtmlPublisher.ps1
# Module for publishing content as HTML

function Publish-ContentAsHtml {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Title,
        
        [Parameter(Mandatory = $true)]
        [string]$Content,
        
        [string]$OutputDir = "..\..\data\published",
        [string[]]$Keywords = @(),
        [string]$TemplateName = "default"
    )

    # Generate filename
    $DateStr = Get-Date -Format "yyyy-MM-dd"
    $SanitizedTitle = $Title -replace "[^a-zA-Z0-9]", "-"
    $HtmlFileName = "$SanitizedTitle.html"
    
    # Ensure output directory exists
    $TargetDir = Join-Path $PSScriptRoot $OutputDir $DateStr
    if (-not (Test-Path $TargetDir)) {
        New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
    }
    
    # Load template
    $TemplatePath = Join-Path $PSScriptRoot "..\..\config\templates\$TemplateName.html"
    if (Test-Path $TemplatePath) {
        $HtmlTemplate = Get-Content $TemplatePath -Raw
    }
    else {
        $HtmlTemplate = Get-DefaultHtmlTemplate
    }
    
    # Generate meta description (first 155 chars of content)
    $MetaDescription = ($Content -replace '<[^>]+>', '' -replace '\s+', ' ').Trim()
    if ($MetaDescription.Length -gt 155) {
        $MetaDescription = $MetaDescription.Substring(0, 155) + "..."
    }
    
    # Build the HTML
    $Html = $HtmlTemplate `
        -replace '{{TITLE}}', $Title `
        -replace '{{CONTENT}}', $Content `
        -replace '{{DATE}}', (Get-Date -Format "MMMM dd, yyyy") `
        -replace '{{YEAR}}', (Get-Date -Format "yyyy") `
        -replace '{{KEYWORDS}}', ($Keywords -join ', ') `
        -replace '{{META_DESCRIPTION}}', $MetaDescription
    
    # Save HTML file
    $HtmlPath = Join-Path $TargetDir $HtmlFileName
    Set-Content -Path $HtmlPath -Value $Html -Encoding UTF8
    
    return @{
        HtmlPath     = $HtmlPath
        MarkdownPath = $null
        Title        = $Title
        PublishedAt  = Get-Date
    }
}

function Get-DefaultHtmlTemplate {
    return @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{{META_DESCRIPTION}}">
    <meta name="keywords" content="{{KEYWORDS}}">
    <meta name="author" content="Fresh-Start AI">
    <title>{{TITLE}} | DLX Studios</title>
    <style>
        :root {
            --primary: #2563eb;
            --text: #1f2937;
            --text-light: #6b7280;
            --bg: #ffffff;
            --border: #e5e7eb;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.7;
            color: var(--text);
            background: var(--bg);
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        header {
            border-bottom: 2px solid var(--primary);
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        h1 {
            font-size: 2.5em;
            color: var(--text);
            margin-bottom: 10px;
            font-weight: 700;
        }
        .meta {
            color: var(--text-light);
            font-size: 0.95em;
        }
        .content {
            font-size: 1.1em;
        }
        .content h2 {
            color: var(--text);
            margin-top: 40px;
            margin-bottom: 15px;
            font-size: 1.8em;
            font-weight: 600;
        }
        .content h3 {
            color: var(--text);
            margin-top: 30px;
            margin-bottom: 12px;
            font-size: 1.4em;
            font-weight: 600;
        }
        .content p {
            margin-bottom: 20px;
        }
        .content ul, .content ol {
            margin-bottom: 20px;
            padding-left: 30px;
        }
        .content li {
            margin-bottom: 10px;
        }
        .content code {
            background: #f3f4f6;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }
        .content pre {
            background: #1f2937;
            color: #f9fafb;
            padding: 20px;
            border-radius: 6px;
            overflow-x: auto;
            margin-bottom: 20px;
        }
        .content pre code {
            background: none;
            padding: 0;
            color: inherit;
        }
        footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 1px solid var(--border);
            text-align: center;
            color: var(--text-light);
            font-size: 0.9em;
        }
        @media (max-width: 768px) {
            .container {
                padding: 20px;
            }
            h1 {
                font-size: 2em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>{{TITLE}}</h1>
            <div class="meta">
                Published on <time datetime="{{DATE}}">{{DATE}}</time>
            </div>
        </header>
        <article class="content">
            {{CONTENT}}
        </article>
        <footer>
            <p>&copy; {{YEAR}} DLX Studios. Generated by Fresh-Start AI.</p>
        </footer>
    </div>
</body>
</html>
"@
}

Export-ModuleMember -Function Publish-ContentAsHtml
