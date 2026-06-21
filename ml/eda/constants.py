"""EDA figure export paths and design tokens (T-214, RAC-001)."""

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_EXPORT_DIR = REPO_ROOT / "docs" / "figures" / "eda"
MANIFEST_FILENAME = "manifest.json"

# docs/Design/design-system.light.md
COLOR_PRIMARY = "#0058bc"
COLOR_TERTIARY = "#005da7"
COLOR_SECONDARY = "#4f6073"
COLOR_RISK_LOW = "#16a34a"
COLOR_RISK_MEDIUM = "#f59e0b"
COLOR_RISK_HIGH = "#dc2626"

READMITTED_COLORS = {
    "NO": COLOR_RISK_LOW,
    ">30": COLOR_RISK_MEDIUM,
    "<30": COLOR_RISK_HIGH,
}

MVP_NUMERIC_COLUMNS = (
    "time_in_hospital",
    "num_medications",
    "number_inpatient",
    "number_outpatient",
    "number_emergency",
    "num_lab_procedures",
    "num_procedures",
    "number_diagnoses",
)

MVP_CATEGORICAL_COLUMNS = ("age", "gender", "max_glu_serum")

EXPORT_SPECS: tuple[tuple[str, str], ...] = (
    ("01_missing_values", "Top columns with missing or placeholder values"),
    ("02_target_distribution", "Hospital readmission target distribution"),
    ("03_binary_target", "Binary MVP target readmit_30d"),
    ("04_numeric_distributions", "Key numeric feature distributions"),
    ("05_categorical_distributions", "Key categorical feature distributions"),
    ("06_correlation_heatmap", "Pearson correlation on numeric MVP features"),
    ("07_readmission_rate_by_age", "30-day readmission rate by age bin"),
    ("08_encounters_per_patient", "Duplicate encounters per patient"),
)
