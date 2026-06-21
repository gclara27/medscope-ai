"""ML registry load state tests (T-301, UC-082)."""

from __future__ import annotations

from core.ml_registry import MLRegistry


def test_load_marks_unavailable_when_artifacts_missing(tmp_path, monkeypatch) -> None:
    registry = MLRegistry()
    registry.is_ready = True
    registry.explainer_service = object()
    registry.load_error = None

    monkeypatch.setattr("core.ml_registry.MODELS_DIR", tmp_path)

    registry.load()

    assert registry.is_ready is False
    assert registry.explainer_service is None
    assert registry.model is None
    assert "missing" in (registry.load_error or "").lower()


def test_load_clears_ready_state_after_exception(tmp_path, monkeypatch) -> None:
    registry = MLRegistry()
    registry.is_ready = True
    registry.explainer_service = object()

    models_dir = tmp_path / "models"
    models_dir.mkdir()
    (models_dir / "model.pkl").write_bytes(b"stub")
    (models_dir / "preprocessor.pkl").write_bytes(b"stub")
    (models_dir / "model_manifest.json").write_text("{}", encoding="utf-8")
    monkeypatch.setattr("core.ml_registry.MODELS_DIR", models_dir)

    def _raise(**_kwargs):  # noqa: ANN003
        raise RuntimeError("corrupt artifact")

    monkeypatch.setattr(
        "ml.training.serialize.load_production_model",
        _raise,
    )

    registry.load()

    assert registry.is_ready is False
    assert registry.explainer_service is None
    assert registry.load_error == "corrupt artifact"
