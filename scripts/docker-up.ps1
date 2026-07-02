# Start full Docker stack (postgres + backend + frontend) — T-904, RDO-001
param(
    [switch]$Foreground,
    [switch]$SkipPrepare,
    [switch]$SkipWait
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root ".env"
$envExample = Join-Path $root ".env.example"

function Write-Step([string]$Message) {
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Test-DockerRunning {
    $prev = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    docker info 2>$null | Out-Null
    $ok = $LASTEXITCODE -eq 0
    $ErrorActionPreference = $prev
    return $ok
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
            Write-Host "  Port $Port - kept $($proc.ProcessName) (PID $procId); Docker Compose will recreate containers"
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

function Wait-DockerStack {
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

    throw "Docker stack did not become healthy within ${TimeoutSec}s. Check: docker compose ps && docker compose logs"
}

Write-Host "T-904 - Docker one-command stack (RDO-001)" -ForegroundColor Yellow

if (-not (Test-DockerRunning)) {
    throw @"
Docker Desktop is not running.

1. Open Docker Desktop from the Start menu
2. Wait until the whale icon shows "Docker Desktop is running"
3. Run this script again: .\scripts\docker-up.ps1

If you prefer local dev without full Docker stack, use: .\dev.bat
"@
}

if (-not (Test-Path $envFile)) {
    Copy-Item $envExample $envFile
    Write-Host "Created .env from .env.example"
}

if (-not $SkipPrepare) {
    Write-Step "Preparing ML artifacts for Docker build"
    & (Join-Path $PSScriptRoot "prepare-docker-build.ps1")
    if ($LASTEXITCODE -and $LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Step "Freeing port 8000 from local uvicorn (if running)"
Stop-LocalDevOnPort -Port 8000

Push-Location $root
try {
    $composeArgs = @("compose", "up", "--build")
    if (-not $Foreground) {
        $composeArgs += "-d"
    }

    Write-Step "Starting Docker Compose ($($composeArgs -join ' '))"
    docker @composeArgs
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    if (-not $Foreground -and -not $SkipWait) {
        Write-Step "Waiting for backend and frontend health"
        Wait-DockerStack
    }

    if (-not $Foreground) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  MedScope AI Docker stack is running" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "  Frontend:  http://localhost:3000"
        Write-Host "  Backend:   http://localhost:8000"
        Write-Host "  Health:    http://localhost:8000/health"
        Write-Host "  API docs:  http://localhost:8000/docs"
        Write-Host ""
        Write-Host "  Demo login: clinician@medscope.ai / MedScope123!"
        Write-Host "  Verify:     .\scripts\verify-docker-stack.ps1"
        Write-Host "  Stop:       docker compose down"
        Write-Host ""
    }
} finally {
    Pop-Location
}
