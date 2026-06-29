# Frontend vitest suite (T-707, RTS-020)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

Write-Host "Frontend tests (RTS-020)..." -ForegroundColor Cyan
Push-Location "$root\frontend"
npm run test
$code = $LASTEXITCODE
Pop-Location
exit $code
