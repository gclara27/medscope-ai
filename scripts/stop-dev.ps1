# MedScope AI - stop dev stack
# Usage: .\stop.bat  |  .\stop.ps1  |  .\scripts\stop-dev.ps1
#
# Stops local backend/frontend (ports 8000, 5173) and Docker Compose services.

$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")

function Write-Step([string]$Message) {
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Stop-ProcessOnPort {
    param([int]$Port)

    $connections = @(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
    if ($connections.Count -eq 0) {
        Write-Host "  Port $Port - nothing listening"
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
            Write-Host "  Stopping $($proc.ProcessName) (PID $procId) on port $Port"
            Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            $stopped += $procId
        }
    }
}

function Stop-MedScopeDevWindows {
    Get-Process -Name powershell, pwsh -ErrorAction SilentlyContinue |
        Where-Object { $_.MainWindowTitle -like "MedScope AI -*" } |
        ForEach-Object {
            Write-Host "  Closing window: $($_.MainWindowTitle)"
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        }
}

Set-Location $Root
Write-Host "MedScope AI - stopping dev stack" -ForegroundColor Yellow
Write-Host "Project: $Root"

Write-Step "Stopping backend (8000) and frontend (5173)"
Stop-ProcessOnPort -Port 8000
Stop-ProcessOnPort -Port 5173

Write-Step "Closing MedScope dev terminal windows (if open)"
Stop-MedScopeDevWindows

Write-Step "Stopping Docker Compose services"
$prevErrorAction = $ErrorActionPreference
$ErrorActionPreference = "Continue"
docker compose down 2>&1 | Out-Null
$ErrorActionPreference = $prevErrorAction
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Docker containers stopped (PostgreSQL data kept in volume)."
} else {
    Write-Host "  Docker compose down skipped or failed (Docker may not be running)." -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  MedScope AI dev stack stopped" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Ports 8000 and 5173 should be free."
Write-Host "  To start again: .\dev.bat"
Write-Host ""
