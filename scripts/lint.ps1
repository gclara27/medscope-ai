# Run all linters from repo root (Windows PowerShell)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

Write-Host "Ruff (backend + ml)..." -ForegroundColor Cyan
& "$root\.venv\Scripts\ruff.exe" check backend ml
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

& "$root\.venv\Scripts\ruff.exe" format --check backend ml
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "ESLint (frontend)..." -ForegroundColor Cyan
Push-Location "$root\frontend"
npm run lint
$code = $LASTEXITCODE
Pop-Location
exit $code
