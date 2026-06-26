import type { ShapExplanationItem } from "@/types/prediction";
import type { SimulationChangeItem } from "@/types/simulation";

/** Maps simulation API field names to ML / SHAP feature identifiers. */
const SIMULATION_TO_SHAP_KEYS: Record<string, string[]> = {
  age: ["age_midpoint", "Age"],
  gender: ["gender", "Gender"],
  hospital_stay_days: ["time_in_hospital", "Hospital stay (days)"],
  medications_count: ["num_medications", "Medication count", "meds_per_day", "Medications per day"],
  previous_admissions: ["number_inpatient", "Prior inpatient visits"],
  glucose: ["max_glu_serum", "Glucose level"],
  number_outpatient: ["number_outpatient", "Prior outpatient visits"],
  number_emergency: ["number_emergency", "Prior emergency visits"],
};

export interface SimulationImpactRow {
  fieldKey: string;
  label: string;
  originalValue: string | null;
  simulatedValue: string | null;
  impactPoints: number;
  barHeightPercent: number;
}

export function formatSimulationFieldLabel(fieldKey: string): string {
  const labels: Record<string, string> = {
    age: "Age",
    gender: "Biological sex",
    glucose: "Blood glucose",
    blood_pressure: "Systolic BP",
    hospital_stay_days: "Hospital stay",
    medications_count: "Medications",
    previous_admissions: "Prior admissions",
    number_outpatient: "Outpatient visits",
    number_emergency: "Emergency visits",
    bmi: "BMI",
  };

  return labels[fieldKey] ?? fieldKey.replace(/_/g, " ");
}

export function formatImpactPoints(points: number): string {
  const sign = points > 0 ? "+" : "";
  return `${sign}${points.toFixed(1)}`;
}

function parseNumeric(value: string | null): number | null {
  if (value === null) {
    return null;
  }
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function valueChangeMagnitude(original: string | null, simulated: string | null): number {
  const originalNumber = parseNumeric(original);
  const simulatedNumber = parseNumeric(simulated);

  if (originalNumber !== null && simulatedNumber !== null) {
    return Math.abs(simulatedNumber - originalNumber);
  }

  return original !== simulated ? 1 : 0;
}

function valueChangeSign(original: string | null, simulated: string | null): number {
  const originalNumber = parseNumeric(original);
  const simulatedNumber = parseNumeric(simulated);

  if (originalNumber !== null && simulatedNumber !== null) {
    if (simulatedNumber > originalNumber) {
      return 1;
    }
    if (simulatedNumber < originalNumber) {
      return -1;
    }
    return 0;
  }

  if (original === simulated) {
    return 0;
  }

  return 1;
}

function matchesShapKey(featureName: string, key: string): boolean {
  const normalizedFeature = featureName.toLowerCase().replace(/\s+/g, "_");
  const normalizedKey = key.toLowerCase().replace(/\s+/g, "_");
  return normalizedFeature === normalizedKey;
}

function findShapMatch(
  fieldKey: string,
  shapExplanations: ShapExplanationItem[],
): ShapExplanationItem | undefined {
  const keys = SIMULATION_TO_SHAP_KEYS[fieldKey] ?? [fieldKey];

  return shapExplanations.find((item) =>
    keys.some((key) => matchesShapKey(item.feature_name, key)),
  );
}

/**
 * Estimate per-variable risk impact for the simulation waterfall (RF-043).
 * Weights each changed field by baseline SHAP magnitude and value delta, then
 * scales contributions to match the observed delta_risk_percent.
 */
export function computeSimulationImpactRows(
  changes: SimulationChangeItem[],
  deltaRiskPercent: number,
  shapExplanations: ShapExplanationItem[],
  maxRows = 5,
): SimulationImpactRow[] {
  if (changes.length === 0) {
    return [];
  }

  const weighted = changes.map((change) => {
    const shap = findShapMatch(change.feature_name, shapExplanations);
    const magnitude = valueChangeMagnitude(change.original_value, change.simulated_value);
    const direction = valueChangeSign(change.original_value, change.simulated_value);

    if (shap && magnitude > 0) {
      const shapSign = shap.shap_value >= 0 ? 1 : -1;
      return {
        change,
        signedWeight: direction * shapSign * Math.abs(shap.shap_value) * Math.max(magnitude, 0.1),
      };
    }

    const fallbackSign = deltaRiskPercent >= 0 ? direction : -direction;
    return {
      change,
      signedWeight: fallbackSign * Math.max(magnitude, 1),
    };
  });

  const signedTotal = weighted.reduce((sum, item) => sum + item.signedWeight, 0);
  const scale =
    Math.abs(signedTotal) > 0.000_01
      ? deltaRiskPercent / signedTotal
      : deltaRiskPercent / changes.length;

  const rows: SimulationImpactRow[] = weighted.map(({ change, signedWeight }) => ({
    fieldKey: change.feature_name,
    label: formatSimulationFieldLabel(change.feature_name),
    originalValue: change.original_value,
    simulatedValue: change.simulated_value,
    impactPoints: signedWeight * scale,
    barHeightPercent: 0,
  }));

  const sorted = [...rows].sort(
    (left, right) => Math.abs(right.impactPoints) - Math.abs(left.impactPoints),
  );
  const topRows = sorted.slice(0, maxRows);
  const maxAbsImpact = Math.max(...topRows.map((row) => Math.abs(row.impactPoints)), 0.01);

  return topRows.map((row) => ({
    ...row,
    barHeightPercent: (Math.abs(row.impactPoints) / maxAbsImpact) * 100,
  }));
}

export function topImpactFieldKeys(rows: SimulationImpactRow[], limit = 3): string[] {
  return rows.slice(0, limit).map((row) => row.fieldKey);
}
