"""Production ML model registry — load once at startup (T-301, UC-082)."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

from core.paths import MODELS_DIR, ensure_repo_root_on_path

logger = logging.getLogger(__name__)


@dataclass
class MLRegistry:
    """Holds serialized model artifacts and the SHAP explainer service."""

    is_ready: bool = False
    model: Any | None = None
    preprocessor: Any | None = None
    manifest: dict[str, Any] | None = None
    explainer_service: Any | None = None
    load_error: str | None = None

    def _clear_artifacts(self) -> None:
        self.model = None
        self.preprocessor = None
        self.manifest = None
        self.explainer_service = None

    def _mark_unavailable(self, error: str) -> None:
        """Reset registry after a failed load (is_ready iff artifacts loaded)."""
        self.is_ready = False
        self.load_error = error
        self._clear_artifacts()

    def load(self) -> None:
        """Load production artifacts from models/ (no retraining at runtime)."""
        ensure_repo_root_on_path()

        model_path = MODELS_DIR / "model.pkl"
        preprocessor_path = MODELS_DIR / "preprocessor.pkl"
        manifest_path = MODELS_DIR / "model_manifest.json"

        if not model_path.exists() or not preprocessor_path.exists() or not manifest_path.exists():
            self._mark_unavailable(
                "Production ML artifacts missing. Run: python ml/scripts/serialize_model.py"
            )
            logger.warning(self.load_error)
            return

        try:
            import numpy as np

            from ml.explainability.explainer import ShapExplainerService
            from ml.training.serialize import load_production_manifest, load_production_model

            self.model, self.preprocessor = load_production_model(
                model_path=model_path,
                preprocessor_path=preprocessor_path,
            )
            self.manifest = load_production_manifest(manifest_path)

            background_path = MODELS_DIR / "shap_background.npy"
            if not background_path.exists():
                raise FileNotFoundError(
                    "SHAP background missing at models/shap_background.npy. "
                    "Run: python ml/scripts/serialize_model.py"
                )
            background = np.load(background_path)

            self.explainer_service = ShapExplainerService(
                self.model,
                self.preprocessor,
                self.manifest,
                background=background,
            )
            self.is_ready = True
            self.load_error = None
            logger.info(
                "ML model loaded: %s v%s",
                self.manifest.get("model_id"),
                self.manifest.get("model_version"),
            )
        except Exception as exc:  # noqa: BLE001 — startup must not crash the API
            self._mark_unavailable(str(exc))
            logger.exception("Failed to load ML model at startup")

    def unload(self) -> None:
        self.is_ready = False
        self.load_error = None
        self._clear_artifacts()


ml_registry = MLRegistry()
