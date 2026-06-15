# MedScope AI — stop dev stack
# Usage: .\scripts\stop-dev.ps1

$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")

function Stop-ProcessOnPort {
    param([int]$Port)

    $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    foreach ($conn in $connections) {
        $procId = $conn.OwningProcess
        if ($procId -and $procId -ne 0) {
            $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
            if ($proc) {
                Write-Host "  Stopping $($proc.ProcessName) (PID $procId) on port $Port"
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

Set-Location $Root
Write-Host "MedScope AI — stopping dev stack" -ForegroundColor Yellow

Write-Host "`nStopping processes on ports 8000 (backend) and 5173 (frontend)..."
Stop-ProcessOnPort -Port 8000
Stop-ProcessOnPort -Port 5173

Write-Host "`nStopping Docker containers..."
docker compose down 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Docker containers stopped."
} else {
    Write-Host "  Docker compose down failed or Docker is not running." -ForegroundColor DarkYellow
}

Write-Host "`nDone. Close any remaining MedScope terminal windows manually." -ForegroundColor Green
