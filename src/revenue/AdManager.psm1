# AdManager.psm1
# Module for managing AdSense and Affiliate integrations

function Get-AdCode {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Position, # Header, Sidebar, Content, Footer
        
        [hashtable]$Config
    )

    if (-not $Config.Revenue.AdSense.Enabled) {
        return ""
    }

    $client = $Config.Revenue.AdSense.ClientId
    if ([string]::IsNullOrEmpty($client)) {
        return "<!-- AdSense Client ID missing -->"
    }

    switch ($Position) {
        "Header" {
            # Auto-ads script usually goes in head
            return @"
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=$client"
     crossorigin="anonymous"></script>
"@
        }
        "Sidebar" {
            $slot = $Config.Revenue.AdSense.Slots.Sidebar
            if ($slot) {
                return @"
<!-- Sidebar Ad -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="$client"
     data-ad-slot="$slot"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
"@
            }
        }
        "Content" {
            $slot = $Config.Revenue.AdSense.Slots.InContent
            if ($slot) {
                return @"
<!-- In-Content Ad -->
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="$client"
     data-ad-slot="$slot"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
"@
            }
        }
    }

    return ""
}

function Add-AffiliateLinks {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Content,
        
        [hashtable]$Config
    )

    if (-not $Config.Revenue.Affiliates.Enabled) {
        return $Content
    }

    $processedContent = $Content
    $programs = $Config.Revenue.Affiliates.Programs

    foreach ($program in $programs) {
        $url = $program.Url
        foreach ($keyword in $program.Keywords) {
            # Simple replacement - replace first occurrence only to avoid spamminess
            # This regex looks for the keyword not inside an existing tag
            # Note: This is a basic implementation. Robust HTML parsing is harder in regex.
            $pattern = "(?i)\b$([regex]::Escape($keyword))\b(?![^<]*>)"
            $replacement = "<a href=`"$url`" target=`"_blank`" rel=`"nofollow sponsored`">$keyword</a>"
            
            # Use [regex] class to replace only the first occurrence
            $regex = [regex]$pattern
            $processedContent = $regex.Replace($processedContent, $replacement, 1)
        }
    }

    return $processedContent
}

Export-ModuleMember -Function Get-AdCode, Add-AffiliateLinks
