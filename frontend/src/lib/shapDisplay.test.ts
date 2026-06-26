import { describe, expect, it } from "vitest";

import {
  formatShapFeatureValue,
  formatShapImpactLabel,
  prepareShapBarRows,
} from "@/lib/shapDisplay";
import type { ShapExplanationItem } from "@/types/prediction";

const sampleExplanations: ShapExplanationItem[] = [
  {
    feature_name: "Prior inpatient visits",
    feature_value: 3,
    shap_value: 0.15,
    importance_rank: 1,
    direction: "increases_risk",
    impact_direction: "positive",
  },
  {
    feature_name: "Age",
    feature_value: 65,
    shap_value: -0.08,
    importance_rank: 2,
    direction: "decreases_risk",
    impact_direction: "negative",
  },
];

describe("shapDisplay", () => {
  it("formats feature values for display", () => {
    expect(formatShapFeatureValue(true)).toBe("Yes");
    expect(formatShapFeatureValue(null)).toBe("—");
  });

  it("formats signed SHAP impact labels", () => {
    expect(formatShapImpactLabel(0.15)).toBe("+15.0%");
    expect(formatShapImpactLabel(-0.08)).toBe("-8.0%");
  });

  it("prepares bar rows sorted by importance rank", () => {
    const rows = prepareShapBarRows(sampleExplanations);

    expect(rows).toHaveLength(2);
    expect(rows[0].featureName).toBe("Prior inpatient visits");
    expect(rows[0].increasesRisk).toBe(true);
    expect(rows[0].barWidthPercent).toBe(100);
    expect(rows[1].increasesRisk).toBe(false);
    expect(rows[1].barWidthPercent).toBeCloseTo(53.33, 1);
  });
});
