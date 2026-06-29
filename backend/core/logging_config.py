"""Backend logging bootstrap (RNF-050, T-711)."""

from core.paths import ensure_repo_root_on_path

ensure_repo_root_on_path()

from ml.logging_config import configure_logging as _configure_structured_logging


def configure_logging() -> None:
    """Apply structured logging for the FastAPI API process."""
    _configure_structured_logging(service="medscope-api")
