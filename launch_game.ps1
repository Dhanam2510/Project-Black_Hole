# Cosmic Horizons - 3D Space Exploration Game Launcher
[CmdletBinding()]
param()

$ProjectDir = $PSScriptRoot
Set-Location -Path $ProjectDir

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "      COSMIC HORIZONS: 3D SPACE EXPLORATION & SCIENCE SIMULATION      " -ForegroundColor Yellow
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

# Check for local Godot executable
$GodotBin = $null
if (Test-Path "godot.exe") {
    $GodotBin = Join-Path $ProjectDir "godot.exe"
} elseif (Test-Path "Godot_v4.3-stable_win64.exe") {
    $GodotBin = Join-Path $ProjectDir "Godot_v4.3-stable_win64.exe"
} else {
    $systemGodot = Get-Command "godot" -ErrorAction SilentlyContinue
    if ($systemGodot) {
        $GodotBin = $systemGodot.Source
    }
}

if (-not $GodotBin) {
    Write-Host "[!] Godot 4.3 executable not found locally." -ForegroundColor Yellow
    Write-Host "[*] Downloading official Godot 4.3 LTS portable engine (~110 MB)..." -ForegroundColor Cyan
    $Url = "https://github.com/godotengine/godot/releases/download/4.3-stable/Godot_v4.3-stable_win64.exe.zip"
    $ZipPath = Join-Path $ProjectDir "godot_engine.zip"

    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        $ProgressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri $Url -OutFile $ZipPath -UseBasicParsing
        Write-Host "[*] Extracting Godot Engine..." -ForegroundColor Cyan
        Expand-Archive -Path $ZipPath -DestinationPath $ProjectDir -Force
        Remove-Item -Path $ZipPath -Force

        $extractedExe = Get-ChildItem -Path $ProjectDir -Filter "*Godot*win64*.exe" | Select-Object -First 1
        if ($extractedExe) {
            Copy-Item -Path $extractedExe.FullName -Destination (Join-Path $ProjectDir "godot.exe") -Force
            $GodotBin = Join-Path $ProjectDir "godot.exe"
            Write-Host "[OK] Engine setup successful!" -ForegroundColor Green
        }
    } catch {
        Write-Host "[ERROR] Failed to download automatically: $_" -ForegroundColor Red
        Write-Host "Please download Godot 4.3 manually from https://godotengine.org/download/windows" -ForegroundColor Yellow
        Write-Host "Place 'godot.exe' in this directory: $ProjectDir" -ForegroundColor Yellow
        pause
        exit 1
    }
}

if ($GodotBin) {
    Write-Host "[OK] Found Godot Engine: $GodotBin" -ForegroundColor Green
    Write-Host "[*] Launching Cosmic Horizons 3D Game..." -ForegroundColor Cyan
    Start-Process -FilePath $GodotBin -ArgumentList "--path `"$ProjectDir`""
}
