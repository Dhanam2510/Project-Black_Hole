[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$ProgressPreference = 'SilentlyContinue'
$url = 'https://github.com/godotengine/godot/releases/download/4.3-stable/Godot_v4.3-stable_win64.exe.zip'
$zip = 'godot_engine.zip'

Write-Host "Connecting to GitHub releases and downloading Godot 4.3..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing

Write-Host "Extracting archive..." -ForegroundColor Cyan
Expand-Archive -Path $zip -DestinationPath . -Force
Remove-Item -Path $zip -Force

$found = Get-ChildItem -Filter '*Godot*win64*.exe' | Select-Object -First 1
if ($found) {
    Copy-Item -Path $found.FullName -Destination 'godot.exe' -Force
    Write-Host "SUCCESS: Godot 4.3 portable engine is ready at: $($found.FullName) and godot.exe" -ForegroundColor Green
} else {
    Write-Host "WARNING: Extracted, but executable not found." -ForegroundColor Yellow
}
