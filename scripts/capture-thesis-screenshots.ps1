# T-808 — Capture thesis screenshots via Playwright (docs/figures/screenshots/)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$nodeModules = Join-Path $root "node_modules"

function Test-HttpOk([string]$Url) {
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10
        return $response.StatusCode -ge 200 -and $response.StatusCode -lt 400
    } catch {
        return $false
    }
}

Write-Host "MedScope AI - Thesis screenshots (T-808)" -ForegroundColor Cyan

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

$baseUrl = if ($env:PLAYWRIGHT_BASE_URL) { $env:PLAYWRIGHT_BASE_URL } else { "http://localhost:5173" }
Write-Host "  Target frontend: $baseUrl" -ForegroundColor Gray

if ($baseUrl -like "http://localhost*") {
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
}

$outputDir = Join-Path $root "docs\figures\screenshots"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

Push-Location $root
& $playwrightCli test thesis-screenshots --reporter=list
$code = $LASTEXITCODE
Pop-Location

if ($code -eq 0) {
    Write-Host "Screenshots saved to docs/figures/screenshots/" -ForegroundColor Green
}

exit $code
