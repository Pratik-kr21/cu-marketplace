$svgPath = "g:\project\college marketplae\public\Logo.svg"
$svgContent = Get-Content -Path $svgPath -Raw

if ($svgContent -match 'data:image/png;base64,([^"]+)') {
    $base64String = $matches[1]
    $bytes = [Convert]::FromBase64String($base64String)
    
    $resDir = "g:\project\college marketplae\CU_MARKET_APP\app\src\main\res"
    $mipmaps = @("mipmap-mdpi", "mipmap-hdpi", "mipmap-xhdpi", "mipmap-xxhdpi", "mipmap-xxxhdpi")
    
    foreach ($mipmap in $mipmaps) {
        $targetDir = Join-Path $resDir $mipmap
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
        }
        
        $launcherPath = Join-Path $targetDir "ic_launcher.png"
        $launcherRoundPath = Join-Path $targetDir "ic_launcher_round.png"
        
        [IO.File]::WriteAllBytes($launcherPath, $bytes)
        [IO.File]::WriteAllBytes($launcherRoundPath, $bytes)
    }
    
    Write-Host "Successfully extracted and copied logo to all mipmap directories."
} else {
    Write-Host "Failed to find base64 PNG in SVG."
}
