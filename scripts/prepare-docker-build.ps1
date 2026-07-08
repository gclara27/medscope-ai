# Ensure production ML artifacts exist before docker build (Deployment.md §3.1)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$python = Join-Path $root ".venv\Scripts\python.exe"

if (-not (Test-Path $python)) {
    Write-Error "Missing .venv. Run scripts/setup-dev.ps1 first."
}

$required = @(
    "models\model.pkl",
    "models\preprocessor.pkl",
    "models\model_manifest.json",
    "models\shap_background.npy",
    "models\demo_golden_predictions.json",
    "models\baseline_comparison.json"
)

$missing = $required | Where-Object { -not (Test-Path (Join-Path $root $_)) }
if ($missing) {
    Write-Host "Generating production ML artifacts..." -ForegroundColor Cyan
    & $python (Join-Path $root "ml\scripts\serialize_model.py")
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

foreach ($rel in $required) {
    $path = Join-Path $root $rel
    if (-not (Test-Path $path)) {
        Write-Error "Still missing: $rel"
    }
}

Write-Host "Docker build context ready (models/ present)." -ForegroundColor Green
