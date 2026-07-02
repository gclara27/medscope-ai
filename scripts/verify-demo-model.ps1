# Verify pinned demo model scores (T-902)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
& "$root\.venv\Scripts\python.exe" "$root\scripts\verify_demo_model.py" @args
exit $LASTEXITCODE
