"""Repository path helpers for backend ↔ ML integration."""

import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
MODELS_DIR = REPO_ROOT / "models"


def ensure_repo_root_on_path() -> Path:
    """Allow `import ml` when running uvicorn/pytest from backend/."""
    root = str(REPO_ROOT)
    if root not in sys.path:
        sys.path.insert(0, root)
    return REPO_ROOT
