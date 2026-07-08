# MedScope AI - one-time local development setup (Windows)
# Usage: .\scripts\setup-dev.ps1 [-Runtime docker|podman]

param(
    [ValidateSet("docker", "podman")]
    [string]$Runtime = "docker"
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "lib\container-runtime.ps1")

$Runtime = Resolve-ContainerRuntime -Runtime $Runtime
$RuntimeLabel = Get-ContainerRuntimeLabel -Runtime $Runtime

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$BackendDir = Join-Path $Root "backend"
$FrontendDir = Join-Path $Root "frontend"
$VenvDir = Join-Path $Root ".venv"
$EnvFile = Join-Path $Root ".env"
$EnvExample = Join-Path $Root ".env.example"
$PythonExe = Join-Path $VenvDir "Scripts\python.exe"
$PipExe = Join-Path $VenvDir "Scripts\pip.exe"
$BackendRequirements = Join-Path $BackendDir "requirements.txt"

Set-Location $Root
Write-Host "MedScope AI - setup dev environment ($RuntimeLabel)" -ForegroundColor Cyan
Write-Host "Root: $Root`n"

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    throw "Python not found. Install Python 3.12+ and add it to PATH."
}
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Node.js not found. Install Node.js 20 LTS+."
}

if (-not (Test-Path $EnvFile)) {
    Copy-Item $EnvExample $EnvFile
    Write-Host "[ok] Created .env from .env.example"
} else {
    Write-Host "[skip] .env already exists"
}

if (-not (Test-Path $PythonExe)) {
    Write-Host "[..] Creating Python virtual environment..."
    python -m venv $VenvDir
    Write-Host "[ok] Virtual environment created"
} else {
    Write-Host "[skip] .venv already exists"
}

Write-Host "[..] Installing backend dependencies..."
& $PythonExe -m pip install --upgrade pip | Out-Null
& $PipExe install -r $BackendRequirements
Write-Host "[ok] Backend dependencies installed"

if ($Runtime -eq "podman") {
    Write-Host "[..] Checking podman-compose..."
    if (-not (Test-PodmanComposeCommand -Root $Root)) {
        Write-Host "[..] Installing podman-compose..."
        & $PipExe install podman-compose
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to install podman-compose. Run manually: pip install podman-compose"
        }
    }
    Write-Host "[ok] podman-compose available"
}

Write-Host "[..] Installing frontend dependencies..."
Set-Location $FrontendDir
npm install
Write-Host "[ok] Frontend dependencies installed"

$startHint = Get-DevStartScriptHint -Runtime $Runtime
Set-Location $Root
Write-Host "`nSetup complete. Run: $startHint" -ForegroundColor Green
