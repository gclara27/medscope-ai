# Start full Docker stack (postgres + backend + frontend) — T-709, RDO-001
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root ".env"
$envExample = Join-Path $root ".env.example"

if (-not (Test-Path $envFile)) {
    Copy-Item $envExample $envFile
    Write-Host "Created .env from .env.example"
}

Push-Location $root
docker compose up --build @args
$code = $LASTEXITCODE
Pop-Location
exit $code
