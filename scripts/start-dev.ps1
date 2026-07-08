# MedScope AI - start full dev stack (PostgreSQL + backend + frontend)
# Usage: .\dev.bat | .\dev-podman.bat | .\scripts\start-dev.ps1 [-Runtime docker|podman]
#
# Opens 2 new terminal windows (backend + frontend).
# PostgreSQL runs detached in a container in this terminal.

param(
    [ValidateSet("docker", "podman")]
    [string]$Runtime = "docker"
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "lib\container-runtime.ps1")

$Runtime = Resolve-ContainerRuntime -Runtime $Runtime
$RuntimeLabel = Get-ContainerRuntimeLabel -Runtime $Runtime

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$BackendDir = Join-Path $Root "backend"
$FrontendDir = Join-Path $Root "frontend"
$VenvDir = Join-Path $Root ".venv"
$EnvFile = Join-Path $Root ".env"
$EnvExample = Join-Path $Root ".env.example"
$PythonExe = Join-Path $VenvDir "Scripts\python.exe"
$AlembicExe = Join-Path $VenvDir "Scripts\alembic.exe"
$UvicornExe = Join-Path $VenvDir "Scripts\uvicorn.exe"

function Write-Step([string]$Message) {
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Wait-PostgresReady {
    param([int]$TimeoutSeconds = 90)

    $elapsed = 0
    while ($elapsed -lt $TimeoutSeconds) {
        Invoke-ContainerCompose -Runtime $Runtime -Root $Root -ComposeArgs @("exec", "-T", "postgres", "pg_isready", "-U", "medscope", "-d", "medscope_ai") 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            return $true
        }
        Start-Sleep -Seconds 2
        $elapsed += 2
        Write-Host "  Waiting for PostgreSQL... (${elapsed}s)"
    }
    return $false
}

function Start-DevWindow {
    param(
        [string]$Title,
        [string]$WorkingDirectory,
        [string]$Command
    )

    $launch = @"
`$Host.UI.RawUI.WindowTitle = '$Title'
Set-Location '$WorkingDirectory'
$Command
"@

    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-ExecutionPolicy", "Bypass",
        "-Command", $launch
    ) | Out-Null
}

Set-Location $Root
Write-Host "MedScope AI - starting dev stack ($RuntimeLabel)" -ForegroundColor Green
Write-Host "Project: $Root"

# --- Prerequisites ---
Write-Step "Checking prerequisites"

if (-not (Test-Path $EnvFile)) {
    Copy-Item $EnvExample $EnvFile
    Write-Host "  Created .env from .env.example"
}

if (-not (Test-Path $PythonExe)) {
    throw "Virtual environment not found. Run: .\scripts\setup-dev.ps1"
}

$FrontendModules = Join-Path $FrontendDir "node_modules"
if (-not (Test-Path $FrontendModules)) {
    Write-Host "  Frontend node_modules missing - running npm install..."
    Push-Location $FrontendDir
    npm install
    Pop-Location
}

if (-not (Test-ContainerEngineRunning -Runtime $Runtime)) {
    throw (Get-ContainerEngineStartHelp -Runtime $Runtime)
}

# --- PostgreSQL ---
Write-Step "Starting PostgreSQL ($RuntimeLabel)"
Invoke-ContainerCompose -Runtime $Runtime -Root $Root -ComposeArgs @("up", "postgres", "-d")
if ($LASTEXITCODE -ne 0) {
    throw "Failed to start PostgreSQL container."
}

if (-not (Wait-PostgresReady)) {
    $logsHint = Get-ComposeLogsHint -Runtime $Runtime -Service postgres
    throw "PostgreSQL did not become ready in time. Check: $logsHint"
}
Write-Host "  PostgreSQL is ready."

# --- Free port 8000 for local uvicorn (avoid stale container backend) ---
Write-Step "Stopping container backend if running (local uvicorn uses port 8000)"
$prevErrorAction = $ErrorActionPreference
$ErrorActionPreference = "Continue"
Invoke-ContainerCompose -Runtime $Runtime -Root $Root -ComposeArgs @("stop", "backend") *>$null
$ErrorActionPreference = $prevErrorAction
Write-Host "  Container backend stopped if it was running (PostgreSQL stays up)."

function Stop-ProcessOnPort {
    param([int]$Port)

    $connections = @(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
    if ($connections.Count -eq 0) {
        return
    }

    $stopped = @()
    foreach ($conn in $connections) {
        $procId = $conn.OwningProcess
        if (-not $procId -or $procId -eq 0 -or $stopped -contains $procId) {
            continue
        }
        $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
        if ($proc) {
            Write-Host "  Stopping stale $($proc.ProcessName) (PID $procId) on port $Port"
            Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            $stopped += $procId
        }
    }
}

Write-Step "Freeing port 8000 (stale local uvicorn instances)"
Stop-ProcessOnPort -Port 8000

# --- Migrations ---
Write-Step "Applying database migrations"
Push-Location $BackendDir
& $AlembicExe upgrade head
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    throw "Alembic migration failed."
}
Pop-Location
Write-Host "  Migrations applied."

# --- Backend & Frontend windows ---
Write-Step "Launching backend and frontend in new terminals"

$backendLaunch = "& '$UvicornExe' main:app --reload --port 8000"
$frontendLaunch = "npm run dev"

Start-DevWindow -Title "MedScope AI - Backend" -WorkingDirectory $BackendDir -Command $backendLaunch
Start-Sleep -Milliseconds 500
Start-DevWindow -Title "MedScope AI - Frontend" -WorkingDirectory $FrontendDir -Command $frontendLaunch

# --- Summary ---
$stopHint = Get-DevStopScriptHint -Runtime $Runtime
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  MedScope AI dev stack is starting" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Runtime:   $RuntimeLabel"
Write-Host "  Frontend:  http://localhost:5173/login"
Write-Host "  Backend:   http://localhost:8000"
Write-Host "  Health:    http://localhost:8000/health"
Write-Host "  API docs:  http://localhost:8000/docs"
Write-Host ""
Write-Host "  Demo login:"
Write-Host "    Email:    clinician@medscope.ai"
Write-Host "    Password: MedScope123!"
Write-Host ""
Write-Host "  Two new PowerShell windows were opened (backend + frontend)."
Write-Host "  PostgreSQL runs in $RuntimeLabel (detached)."
Write-Host ""
Write-Host "  Stop everything: $stopHint"
Write-Host ""
