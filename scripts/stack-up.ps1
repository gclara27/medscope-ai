# Start full container stack (postgres + backend + frontend) — T-904, RDO-001
param(
    [ValidateSet("docker", "podman")]
    [string]$Runtime = "docker",
    [switch]$Foreground,
    [switch]$SkipPrepare,
    [switch]$SkipWait
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "lib\container-runtime.ps1")

$Runtime = Resolve-ContainerRuntime -Runtime $Runtime
$RuntimeLabel = Get-ContainerRuntimeLabel -Runtime $Runtime

$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root ".env"
$envExample = Join-Path $root ".env.example"

function Write-Step([string]$Message) {
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Stop-LocalDevOnPort {
    param(
        [int]$Port,
        [string[]]$AllowedProcessNames = @("python", "node")
    )

    $connections = @(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
    if ($connections.Count -eq 0) {
        Write-Host "  Port $Port - free"
        return
    }

    $stopped = @()
    foreach ($conn in $connections) {
        $procId = $conn.OwningProcess
        if (-not $procId -or $procId -eq 0 -or $stopped -contains $procId) {
            continue
        }
        $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
        if (-not $proc) { continue }
        if ($AllowedProcessNames -notcontains $proc.ProcessName) {
            Write-Host "  Port $Port - kept $($proc.ProcessName) (PID $procId); Compose will recreate containers"
            continue
        }
        Write-Host "  Stopping local $($proc.ProcessName) (PID $procId) on port $Port"
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
        $stopped += $procId
    }
}

function Test-HttpOk([string]$Url) {
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 8
        return $response.StatusCode -ge 200 -and $response.StatusCode -lt 400
    } catch {
        return $false
    }
}

function Wait-ContainerStack {
    param(
        [string]$BackendUrl = "http://localhost:8000/health",
        [string]$FrontendUrl = "http://localhost:3000/login",
        [int]$TimeoutSec = 180
    )

    $elapsed = 0
    $interval = 3
    while ($elapsed -lt $TimeoutSec) {
        $backendOk = Test-HttpOk $BackendUrl
        $frontendOk = Test-HttpOk $FrontendUrl
        if ($backendOk -and $frontendOk) {
            return
        }
        Write-Host "  Waiting for stack... backend=$backendOk frontend=$frontendOk (${elapsed}s)"
        Start-Sleep -Seconds $interval
        $elapsed += $interval
    }

    $psHint = Get-ComposePsCommand -Runtime $Runtime
    throw "$RuntimeLabel stack did not become healthy within ${TimeoutSec}s. Check: $psHint"
}

$devHint = Get-DevStartScriptHint -Runtime $Runtime
$verifyHint = Get-StackVerifyScriptHint -Runtime $Runtime
$downHint = Get-ComposeDownHint -Runtime $Runtime

Write-Host "T-904 - $RuntimeLabel one-command stack (RDO-001)" -ForegroundColor Yellow

if (-not (Test-ContainerEngineRunning -Runtime $Runtime)) {
    $engineHelp = Get-ContainerEngineStartHelp -Runtime $Runtime
    throw @"
$engineHelp

If you prefer local dev without full container stack, use: $devHint
"@
}

if (-not (Test-Path $envFile)) {
    Copy-Item $envExample $envFile
    Write-Host "Created .env from .env.example"
}

if (-not $SkipPrepare) {
    Write-Step "Preparing ML artifacts for container build"
    & (Join-Path $PSScriptRoot "prepare-docker-build.ps1")
    if ($LASTEXITCODE -and $LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Step "Freeing port 8000 from local uvicorn (if running)"
Stop-LocalDevOnPort -Port 8000

$composeArgs = @("up", "--build")
if (-not $Foreground) {
    $composeArgs += "-d"
}

Write-Step "Starting $RuntimeLabel Compose ($($composeArgs -join ' '))"
Invoke-ContainerCompose -Runtime $Runtime -Root $root -ComposeArgs $composeArgs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if (-not $Foreground -and -not $SkipWait) {
    Write-Step "Waiting for backend and frontend health"
    Wait-ContainerStack
}

if (-not $Foreground) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  MedScope AI $RuntimeLabel stack is running" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Frontend:  http://localhost:3000"
    Write-Host "  Backend:   http://localhost:8000"
    Write-Host "  Health:    http://localhost:8000/health"
    Write-Host "  API docs:  http://localhost:8000/docs"
    Write-Host ""
    Write-Host "  Demo login: clinician@medscope.ai / MedScope123!"
    Write-Host "  Verify:     $verifyHint"
    Write-Host "  Stop:       $downHint"
    Write-Host ""
}
