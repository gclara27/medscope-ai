import type { ShapExplanationItem } from "@/types/prediction";

export interface ShapBarRow {
  featureName: string;
  featureValue: string;
  shapValue: number;
  importanceRank: number;
  increasesRisk: boolean;
  barWidthPercent: number;
  impactLabel: string;
}

export function formatShapFeatureValue(value: ShapExplanationItem["feature_value"]): string {
  if (value === null || value === undefined) {
    return "—";
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return String(value);
}

/** Format SHAP contribution as signed percentage points for clinical UI (RFW-023). */
export function formatShapImpactLabel(shapValue: number): string {
  const points = shapValue * 100;
  const sign = points >= 0 ? "+" : "";
  return `${sign}${points.toFixed(1)}%`;
}

export function prepareShapBarRows(explanations: ShapExplanationItem[]): ShapBarRow[] {
  const sorted = [...explanations].sort((a, b) => a.importance_rank - b.importance_rank);
  const maxAbs = Math.max(...sorted.map((item) => Math.abs(item.shap_value)), 0.000_01);

  return sorted.map((item) => ({
    featureName: item.feature_name,
    featureValue: formatShapFeatureValue(item.feature_value),
    shapValue: item.shap_value,
    importanceRank: item.importance_rank,
    increasesRisk: item.impact_direction === "positive",
    barWidthPercent: (Math.abs(item.shap_value) / maxAbs) * 100,
    impactLabel: formatShapImpactLabel(item.shap_value),
  }));
}
