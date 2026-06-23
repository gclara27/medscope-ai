"""Reproducible EDA figure generation for thesis defense (T-214)."""

from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import pandas as pd

from ml.eda.constants import (
    COLOR_PRIMARY,
    COLOR_RISK_HIGH,
    COLOR_RISK_LOW,
    COLOR_SECONDARY,
    COLOR_TERTIARY,
    DEFAULT_EXPORT_DIR,
    EXPORT_SPECS,
    MANIFEST_FILENAME,
    MVP_NUMERIC_COLUMNS,
    READMITTED_COLORS,
)
from ml.preprocessing.cleaning import add_binary_target, load_raw_dataset
from ml.preprocessing.constants import PLACEHOLDER_VALUES


def _apply_style() -> None:
    plt.style.use("seaborn-v0_8-whitegrid")


def load_eda_frame(path: Path | None = None) -> pd.DataFrame:
    """Load raw dataset with binary MVP target for EDA exports."""
    return add_binary_target(load_raw_dataset(path))


def compute_missing_summary(frame: pd.DataFrame) -> pd.DataFrame:
    """Summarize NaN and placeholder values per column."""
    rows: list[dict[str, object]] = []
    for column in frame.columns:
        series = frame[column]
        nan_count = int(series.isna().sum())
        placeholder_count = 0
        if series.dtype == object or pd.api.types.is_string_dtype(series):
            placeholder_count = int(series.isin(PLACEHOLDER_VALUES).sum())
        missing_total = nan_count + placeholder_count
        rows.append(
            {
                "column": column,
                "nan": nan_count,
                "placeholder": placeholder_count,
                "missing_total": missing_total,
                "missing_pct": round(100 * missing_total / len(frame), 2),
            }
        )
    return pd.DataFrame(rows).sort_values("missing_pct", ascending=False)


def _save_figure(fig: plt.Figure, output_dir: Path, stem: str, *, dpi: int) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    path = output_dir / f"{stem}.png"
    fig.savefig(path, dpi=dpi, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    return path


def plot_missing_values(frame: pd.DataFrame, output_dir: Path, *, dpi: int = 150) -> Path:
    missing = compute_missing_summary(frame)
    top_missing = missing[missing["missing_pct"] > 0].head(12)

    fig, ax = plt.subplots(figsize=(10, 5))
    ax.barh(top_missing["column"], top_missing["missing_pct"], color=COLOR_PRIMARY)
    ax.set_xlabel("Missing / placeholder (%)")
    ax.set_title("Top columns with missing or placeholder values")
    ax.invert_yaxis()
    fig.tight_layout()
    return _save_figure(fig, output_dir, "01_missing_values", dpi=dpi)


def plot_target_distribution(frame: pd.DataFrame, output_dir: Path, *, dpi: int = 150) -> Path:
    counts = frame["readmitted"].value_counts()
    pct = frame["readmitted"].value_counts(normalize=True).mul(100).round(2)
    summary = pd.DataFrame({"count": counts, "pct": pct})

    fig, axes = plt.subplots(1, 2, figsize=(11, 4))
    summary["count"].plot(
        kind="bar",
        ax=axes[0],
        color=[READMITTED_COLORS.get(label, COLOR_PRIMARY) for label in summary.index],
    )
    axes[0].set_title("Readmission counts")
    axes[0].set_xlabel("readmitted")
    axes[0].set_ylabel("Encounters")

    summary["pct"].plot(
        kind="bar",
        ax=axes[1],
        color=[READMITTED_COLORS.get(label, COLOR_PRIMARY) for label in summary.index],
    )
    axes[1].set_title("Readmission share (%)")
    axes[1].set_ylabel("%")
    fig.tight_layout()
    return _save_figure(fig, output_dir, "02_target_distribution", dpi=dpi)


def plot_binary_target(frame: pd.DataFrame, output_dir: Path, *, dpi: int = 150) -> Path:
    counts = frame["readmit_30d"].value_counts().sort_index()
    labels = ["No readmit <30d", "Readmit <30d"]

    fig, ax = plt.subplots(figsize=(6, 4))
    ax.bar(labels, counts.values, color=[COLOR_RISK_LOW, COLOR_RISK_HIGH])
    ax.set_title("Binary MVP target: readmit_30d")
    ax.set_ylabel("Encounters")
    for index, value in enumerate(counts.values):
        ax.text(index, value, f"{value:,}", ha="center", va="bottom", fontsize=9)
    fig.tight_layout()
    return _save_figure(fig, output_dir, "03_binary_target", dpi=dpi)


def plot_numeric_distributions(frame: pd.DataFrame, output_dir: Path, *, dpi: int = 150) -> Path:
    fig, axes = plt.subplots(2, 4, figsize=(14, 7))
    for ax, column in zip(axes.ravel(), MVP_NUMERIC_COLUMNS):
        ax.hist(frame[column].dropna(), bins=30, color=COLOR_PRIMARY, alpha=0.85, edgecolor="white")
        ax.set_title(column)
        ax.set_ylabel("Count")
    fig.suptitle("Numeric feature distributions", y=1.02, fontsize=13)
    fig.tight_layout()
    return _save_figure(fig, output_dir, "04_numeric_distributions", dpi=dpi)


def plot_categorical_distributions(frame: pd.DataFrame, output_dir: Path, *, dpi: int = 150) -> Path:
    fig, axes = plt.subplots(1, 3, figsize=(14, 4))
    colors = (COLOR_PRIMARY, COLOR_TERTIARY, COLOR_SECONDARY)

    frame["age"].value_counts().sort_index().plot(kind="bar", ax=axes[0], color=colors[0])
    axes[0].set_title("Age bins")
    axes[0].tick_params(axis="x", rotation=45)

    frame["gender"].value_counts().plot(kind="bar", ax=axes[1], color=colors[1])
    axes[1].set_title("Gender")

    frame["max_glu_serum"].value_counts().plot(kind="bar", ax=axes[2], color=colors[2])
    axes[2].set_title("max_glu_serum")
    axes[2].tick_params(axis="x", rotation=45)

    fig.tight_layout()
    return _save_figure(fig, output_dir, "05_categorical_distributions", dpi=dpi)


def plot_correlation_heatmap(frame: pd.DataFrame, output_dir: Path, *, dpi: int = 150) -> Path:
    corr = frame[list(MVP_NUMERIC_COLUMNS) + ["readmit_30d"]].corr()

    fig, ax = plt.subplots(figsize=(8, 6))
    image = ax.imshow(corr, cmap="RdBu_r", vmin=-1, vmax=1)
    ax.set_xticks(range(len(corr.columns)))
    ax.set_yticks(range(len(corr.columns)))
    ax.set_xticklabels(corr.columns, rotation=45, ha="right")
    ax.set_yticklabels(corr.columns)
    ax.set_title("Pearson correlation — numeric MVP features")
    fig.colorbar(image, ax=ax, fraction=0.046, pad=0.04)
    fig.tight_layout()
    return _save_figure(fig, output_dir, "06_correlation_heatmap", dpi=dpi)


def plot_readmission_rate_by_age(frame: pd.DataFrame, output_dir: Path, *, dpi: int = 150) -> Path:
    grouped = (
        frame.groupby("age")["readmit_30d"]
        .agg(["mean", "count"])
        .assign(readmit_rate_pct=lambda df: (df["mean"] * 100).round(2))
        .sort_index()
    )

    fig, ax = plt.subplots(figsize=(10, 4))
    ax.bar(grouped.index.astype(str), grouped["readmit_rate_pct"], color=COLOR_PRIMARY)
    ax.set_title("30-day readmission rate by age bin")
    ax.set_xlabel("age")
    ax.set_ylabel("Readmission rate (%)")
    ax.tick_params(axis="x", rotation=45)
    fig.tight_layout()
    return _save_figure(fig, output_dir, "07_readmission_rate_by_age", dpi=dpi)


def plot_encounters_per_patient(frame: pd.DataFrame, output_dir: Path, *, dpi: int = 150) -> Path:
    encounters_per_patient = frame.groupby("patient_nbr")["encounter_id"].count()

    fig, ax = plt.subplots(figsize=(8, 4))
    encounters_per_patient.clip(upper=10).value_counts().sort_index().plot(
        kind="bar",
        ax=ax,
        color=COLOR_PRIMARY,
    )
    ax.set_xlabel("Encounters per patient (capped display at 10)")
    ax.set_ylabel("Patients")
    ax.set_title("Duplicate encounter distribution")
    fig.tight_layout()
    return _save_figure(fig, output_dir, "08_encounters_per_patient", dpi=dpi)


def export_all_eda_figures(
    output_dir: Path = DEFAULT_EXPORT_DIR,
    *,
    data_path: Path | None = None,
    dpi: int = 150,
) -> dict[str, object]:
    """Generate all thesis EDA figures and write a manifest."""
    _apply_style()
    frame = load_eda_frame(data_path)

    exporters = (
        plot_missing_values,
        plot_target_distribution,
        plot_binary_target,
        plot_numeric_distributions,
        plot_categorical_distributions,
        plot_correlation_heatmap,
        plot_readmission_rate_by_age,
        plot_encounters_per_patient,
    )

    files = [exporter(frame, output_dir, dpi=dpi) for exporter in exporters]
    manifest = {
        "task": "T-214",
        "dataset": "diabetes130-us-hospitals",
        "source_notebook": "notebooks/diabetes130_eda.ipynb",
        "exported_at": datetime.now(UTC).isoformat(),
        "rows": len(frame),
        "figures": [
            {
                "file": path.name,
                "stem": stem,
                "caption": caption,
            }
            for path, (stem, caption) in zip(files, EXPORT_SPECS)
        ],
    }
    manifest_path = output_dir / MANIFEST_FILENAME
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return manifest
