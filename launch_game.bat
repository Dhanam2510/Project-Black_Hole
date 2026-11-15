@echo off
setlocal enabledelayedexpansion
title Cosmic Horizons - 3D Space Exploration Game Launcher

echo =====================================================================
echo       COSMIC HORIZONS: 3D SPACE EXPLORATION & SCIENCE SIMULATION
echo =====================================================================
echo.

cd /d "%~dp0"

:: Check for local Godot executable
set "GODOT_BIN="
if exist "godot.exe" set "GODOT_BIN=godot.exe"
if exist "Godot_v4.3-stable_win64.exe" set "GODOT_BIN=Godot_v4.3-stable_win64.exe"

if defined GODOT_BIN (
    echo [OK] Found Godot Engine: !GODOT_BIN!
    echo [INFO] Launching Cosmic Horizons 3D Game...
    start "" "!GODOT_BIN!" --path "%~dp0"
    goto :end
)

:: Check if godot is in system PATH
where godot >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Found Godot in System PATH.
    echo [INFO] Launching Cosmic Horizons 3D Game...
    start "" godot --path "%~dp0"
    goto :end
)

:: If not found, download portable Godot 4.3 LTS automatically
echo [!] Godot Engine 4.3 executable not detected in game folder.
echo [*] Downloading official Godot 4.3 LTS portable engine (~110 MB)...
echo [*] Source: https://github.com/godotengine/godot/releases/download/4.3-stable/Godot_v4.3-stable_win64.exe.zip
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$ProgressPreference = 'SilentlyContinue';" ^
    "$url = 'https://github.com/godotengine/godot/releases/download/4.3-stable/Godot_v4.3-stable_win64.exe.zip';" ^
    "$zip = Join-Path $PWD 'godot_engine.zip';" ^
    "Write-Host 'Downloading Godot 4.3...' -ForegroundColor Cyan;" ^
    "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;" ^
    "(New-Object System.Net.WebClient).DownloadFile($url, $zip);" ^
    "Write-Host 'Extracting Godot engine...' -ForegroundColor Cyan;" ^
    "Expand-Archive -Path $zip -DestinationPath $PWD -Force;" ^
    "Remove-Item $zip -Force;" ^
    "$exe = Get-ChildItem -Filter '*Godot*win64*.exe' | Select-Object -First 1;" ^
    "if ($exe) { Copy-Item $exe.FullName (Join-Path $PWD 'godot.exe') -Force; Write-Host 'Setup Complete!' -ForegroundColor Green; }"

if exist "godot.exe" (
    echo.
    echo [OK] Godot Engine ready!
    echo [INFO] Launching Cosmic Horizons 3D Game...
    start "" "godot.exe" --path "%~dp0"
) else (
    echo.
    echo [ERROR] Automatic download could not be completed.
    echo Please manually download Godot 4.3 from:
    echo https://godotengine.org/download/windows/
    echo Place the godot executable in this folder and run launch_game.bat again.
    pause
)

:end
