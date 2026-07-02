# T-906 — Demo flow stability (KPIs §15, no critical errors in demo path)
param(
    [switch]$Production,
    [switch]$WithE2e,
    [string]$ApiBase,
    [string]$FrontendUrl
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$python = Join-Path $root ".venv\Scripts\python.exe"

if (-not (Test-Path $python)) {
    Write-Error "Missing .venv. Run scripts/setup-dev.ps1 first."
}

$stabilityArgs = @()
if ($Production) {
    $stabilityArgs += "--production"
} elseif ($ApiBase) {
    $stabilityArgs += "--api-base", $ApiBase
}
if ($FrontendUrl) {
    $stabilityArgs += "--frontend-url", $FrontendUrl
} elseif (-not $Production) {
    $stabilityArgs += "--frontend-url", "http://localhost:5173"
}

Write-Host "T-906 - Demo flow stability verification" -ForegroundColor Cyan
Write-Host ""

& $python (Join-Path $root "scripts\verify_demo_stability.py") @stabilityArgs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if ($WithE2e) {
    Write-Host ""
    Write-Host "==> Playwright MT-P10-DEMO-001 (T-903)" -ForegroundColor Yellow
    if ($Production) {
        $env:PLAYWRIGHT_BASE_URL = "https://medscope-ai-delta.vercel.app"
        $env:PLAYWRIGHT_API_BASE = "https://medscope-ai-q8tg.onrender.com"
    } else {
        if (-not $env:PLAYWRIGHT_BASE_URL) { $env:PLAYWRIGHT_BASE_URL = "http://localhost:5173" }
        if (-not $env:PLAYWRIGHT_API_BASE) { $env:PLAYWRIGHT_API_BASE = "http://localhost:8000" }
    }
    & (Join-Path $root "scripts\run-demo-rehearsal.ps1")
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Host ""
Write-Host "Demo stability gate passed (T-906)." -ForegroundColor Green
exit 0
