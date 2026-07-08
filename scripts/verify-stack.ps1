# Smoke test for container Compose stack (T-904, RDO-001)
param(
    [ValidateSet("docker", "podman")]
    [string]$Runtime = "docker"
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "lib\container-runtime.ps1")

$Runtime = Resolve-ContainerRuntime -Runtime $Runtime
$RuntimeLabel = Get-ContainerRuntimeLabel -Runtime $Runtime
$root = Split-Path -Parent $PSScriptRoot

$backendBase = if ($env:DOCKER_BACKEND_URL) { $env:DOCKER_BACKEND_URL } else { "http://localhost:8000" }
$frontendBase = if ($env:DOCKER_FRONTEND_URL) { $env:DOCKER_FRONTEND_URL } else { "http://localhost:3000" }

function Test-HttpOk([string]$Url) {
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10
        return $response.StatusCode -ge 200 -and $response.StatusCode -lt 400
    } catch {
        return $false
    }
}

function Test-JsonHealth([string]$Url) {
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -ne 200) { return $false }
        $body = $response.Content | ConvertFrom-Json
        return $body.status -eq "ok" -and $body.ml_ready -eq $true
    } catch {
        return $false
    }
}

$stackUpHint = Get-StackUpScriptHint -Runtime $Runtime
$psHint = Get-ComposePsCommand -Runtime $Runtime

Write-Host "T-904 - Verify $RuntimeLabel stack" -ForegroundColor Cyan

if (-not (Test-ContainerEngineRunning -Runtime $Runtime)) {
    $engineHelp = Get-ContainerEngineStartHelp -Runtime $Runtime
    throw @"
$engineHelp

Run: $stackUpHint
Then: $(Get-StackVerifyScriptHint -Runtime $Runtime)
"@
}

Write-Host ""
Write-Host "==> $psHint" -ForegroundColor Yellow
Invoke-ContainerCompose -Runtime $Runtime -Root $root -ComposeArgs @("ps")
if ($LASTEXITCODE -ne 0) {
    throw "Compose ps failed. Run $stackUpHint first."
}

$checks = @(
    @{ Name = "Backend /health (ml_ready)"; Ok = (Test-JsonHealth "$backendBase/health") },
    @{ Name = "Frontend /login"; Ok = (Test-HttpOk "$frontendBase/login") },
    @{ Name = "Frontend proxies /health"; Ok = (Test-JsonHealth "$frontendBase/health") }
)

Write-Host ""
Write-Host "==> HTTP smoke checks" -ForegroundColor Yellow
$failed = 0
foreach ($check in $checks) {
    $status = if ($check.Ok) { "OK" } else { "FAIL" }
    $color = if ($check.Ok) { "Green" } else { "Red" }
    Write-Host "  [$status] $($check.Name)" -ForegroundColor $color
    if (-not $check.Ok) { $failed++ }
}

Write-Host ""
Write-Host "==> Demo login via proxied /auth/login" -ForegroundColor Yellow
$loginBody = @{
    email    = "clinician@medscope.ai"
    password = "MedScope123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest `
        -Uri "$frontendBase/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -UseBasicParsing `
        -TimeoutSec 15
    $tokenOk = $loginResponse.StatusCode -eq 200
    Write-Host "  [OK] POST /auth/login via nginx proxy" -ForegroundColor Green
} catch {
    $tokenOk = $false
    Write-Host "  [FAIL] POST /auth/login via nginx proxy" -ForegroundColor Red
    Write-Host "         $($_.Exception.Message)" -ForegroundColor DarkRed
    $failed++
}

if ($failed -gt 0 -or -not $tokenOk) {
    Write-Host ""
    Write-Host "$RuntimeLabel stack verification failed ($failed check(s))." -ForegroundColor Red
    Write-Host "Try: $stackUpHint" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "$RuntimeLabel stack verification passed (T-904)." -ForegroundColor Green
exit 0
