"""Re-run script with repo .venv Python when invoked via system python."""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

_REEXEC_FLAG = "MEDSCOPE_VENV_REEXEC"


def reexec_in_project_venv(repo_root: Path | None = None) -> None:
    if os.environ.get(_REEXEC_FLAG) == "1":
        return

    root = repo_root or Path(__file__).resolve().parents[1]
    candidates = (
        root / ".venv" / "Scripts" / "python.exe",
        root / ".venv" / "bin" / "python",
    )
    venv_python = next((path for path in candidates if path.is_file()), None)
    if venv_python is None:
        return

    if Path(sys.executable).resolve() == venv_python.resolve():
        return

    env = os.environ.copy()
    env[_REEXEC_FLAG] = "1"
    completed = subprocess.run([str(venv_python), *sys.argv], env=env, check=False)
    raise SystemExit(completed.returncode)
