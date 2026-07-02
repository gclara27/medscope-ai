# MT-P10-DEMO-001 defense rehearsal (T-903)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

function Test-HttpOk([string]$Url) {
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 8
        return $response.StatusCode -ge 200 -and $response.StatusCode -lt 400
    } catch {
        return $false
    }
}

Write-Host "T-903 - Demo defense rehearsal (MT-P10-DEMO-001)" -ForegroundColor Cyan

Write-Host ""
Write-Host "==> Verifying pinned model artifacts (T-902)" -ForegroundColor Yellow
& "$root\.venv\Scripts\python.exe" "$root\scripts\verify_demo_model.py" --local-only
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$baseUrl = if ($env:PLAYWRIGHT_BASE_URL) { $env:PLAYWRIGHT_BASE_URL } else { "http://localhost:5173" }
$apiBase = if ($env:PLAYWRIGHT_API_BASE) { $env:PLAYWRIGHT_API_BASE } else { "http://localhost:8000" }

if ($baseUrl -like "*vercel.app*") {
    Write-Host ""
    Write-Host "==> Production rehearsal - warming Render API" -ForegroundColor Yellow
    & "$root\.venv\Scripts\python.exe" "$root\scripts\verify_demo_seeds.py" --api-base $apiBase
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    & "$root\.venv\Scripts\python.exe" "$root\scripts\verify_demo_model.py" --api-base $apiBase
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} else {
    if (-not (Test-HttpOk "$apiBase/health")) {
        throw "Backend not reachable at $apiBase/health. Run: .\dev.bat"
    }
    if (-not (Test-HttpOk "$baseUrl/login")) {
        throw "Frontend not reachable at $baseUrl/login. Run: .\dev.bat"
    }
}

$playwrightCli = Join-Path $root "node_modules\.bin\playwright.cmd"
if (-not (Test-Path $playwrightCli)) {
    Write-Host "Installing Playwright..." -ForegroundColor Yellow
    Push-Location $root
    npm install
    Pop-Location
}

Write-Host ""
Write-Host "==> Playwright MT-P10-DEMO-001 against $baseUrl" -ForegroundColor Yellow
Push-Location $root
$env:PLAYWRIGHT_BASE_URL = $baseUrl
& $playwrightCli test tests/e2e/demo-rehearsal.spec.ts @args
$code = $LASTEXITCODE
Pop-Location
exit $code
