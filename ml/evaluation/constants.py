"""Evaluation targets and output paths (T-207, RIA-012)."""

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
MODELS_DIR = REPO_ROOT / "models"
EVALUATION_REPORT_PATH = MODELS_DIR / "evaluation_report.json"

# Requirements §15 / EP-2.7
TARGET_ACCURACY = 0.75
PRIMARY_METRIC = "recall"
DEFAULT_THRESHOLD = 0.5
