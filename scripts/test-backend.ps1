# Backend pytest with coverage gate (T-706, Testing.md §11)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

Write-Host "Backend tests + coverage (target 60-75%)..." -ForegroundColor Cyan
Push-Location "$root\backend"
& "$root\.venv\Scripts\python.exe" -m pytest `
    --cov=core `
    --cov=models `
    --cov=repositories `
    --cov=routers `
    --cov=schemas `
    --cov=services `
    --cov=seeds `
    --cov=main `
    --cov-report=term-missing `
    --cov-fail-under=60 `
    @args
$code = $LASTEXITCODE
Pop-Location
exit $code
