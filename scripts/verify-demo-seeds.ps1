# Verify demo seed logins (T-901)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
& "$root\.venv\Scripts\python.exe" "$root\scripts\verify_demo_seeds.py" @args
exit $LASTEXITCODE
