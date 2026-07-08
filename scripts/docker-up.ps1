# Start full Docker stack (postgres + backend + frontend) — T-904, RDO-001
param(
    [switch]$Foreground,
    [switch]$SkipPrepare,
    [switch]$SkipWait
)

& (Join-Path $PSScriptRoot "stack-up.ps1") -Runtime docker @PSBoundParameters
