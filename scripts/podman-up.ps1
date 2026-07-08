# Start full Podman stack (postgres + backend + frontend)
param(
    [switch]$Foreground,
    [switch]$SkipPrepare,
    [switch]$SkipWait
)

& (Join-Path $PSScriptRoot "stack-up.ps1") -Runtime podman @PSBoundParameters
