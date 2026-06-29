# Playwright E2E (T-708, RTS-030) - requires dev stack: .\scripts\start-dev.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$nodeModules = Join-Path $root "node_modules"

function Test-HttpOk([string]$Url) {
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
        return $response.StatusCode -ge 200 -and $response.StatusCode -lt 400
    } catch {
        return $false
    }
}

Write-Host "MedScope AI - Playwright E2E (RTS-030)" -ForegroundColor Cyan

if (-not (Test-Path $nodeModules)) {
    Write-Host "Installing root npm dependencies (Playwright)..." -ForegroundColor Yellow
    Push-Location $root
    npm install
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Pop-Location
}

$playwrightCli = Join-Path $root "node_modules\.bin\playwright.cmd"
if (-not (Test-Path $playwrightCli)) {
    throw "Playwright not installed. Run: npm install (from repo root)"
}

if (-not (Test-HttpOk "http://localhost:8000/health")) {
    throw @"
Backend is not reachable at http://localhost:8000/health
Start the dev stack first: .\scripts\start-dev.ps1
"@
}

if (-not (Test-HttpOk "http://localhost:5173/login")) {
    throw @"
Frontend is not reachable at http://localhost:5173/login
Start the dev stack first: .\scripts\start-dev.ps1
"@
}

Write-Host "  Backend and frontend are up. Running Playwright..." -ForegroundColor Green
Push-Location $root
& $playwrightCli test @args
$code = $LASTEXITCODE
Pop-Location
exit $code
