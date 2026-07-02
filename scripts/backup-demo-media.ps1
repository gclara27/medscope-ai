# T-905 — Package screenshots, thesis docs, slides, and demo video for external backup
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$python = Join-Path $root ".venv\Scripts\python.exe"

if (-not (Test-Path $python)) {
    Write-Error "Missing .venv. Run scripts/setup-dev.ps1 first."
}

Write-Host "T-905 - Thesis demo media backup (RAC-001)" -ForegroundColor Cyan
& $python (Join-Path $root "scripts\backup_demo_media.py") @args
exit $LASTEXITCODE
