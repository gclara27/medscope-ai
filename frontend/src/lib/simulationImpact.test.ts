import { describe, expect, it } from "vitest";

import {
  computeSimulationImpactRows,
  formatSimulationFieldLabel,
  topImpactFieldKeys,
} from "@/lib/simulationImpact";
import type { ShapExplanationItem } from "@/types/prediction";
import type { SimulationChangeItem } from "@/types/simulation";

const shapExplanations: ShapExplanationItem[] = [
  {
    feature_name: "Prior inpatient visits",
    feature_value: 3,
    shap_value: 0.12,
    importance_rank: 1,
    direction: "positive",
    impact_direction: "positive",
  },
  {
    feature_name: "Glucose level",
    feature_value: ">200",
    shap_value: 0.08,
    importance_rank: 2,
    direction: "positive",
    impact_direction: "positive",
  },
];

describe("simulationImpact", () => {
  it("formats human-readable field labels", () => {
    expect(formatSimulationFieldLabel("previous_admissions")).toBe("Prior admissions");
    expect(formatSimulationFieldLabel("blood_pressure")).toBe("Systolic BP");
  });

  it("computes signed impact rows scaled to total delta", () => {
    const changes: SimulationChangeItem[] = [
      {
        feature_name: "previous_admissions",
        original_value: "3",
        simulated_value: "0",
      },
      {
        feature_name: "glucose",
        original_value: "180",
        simulated_value: "120",
      },
    ];

    const rows = computeSimulationImpactRows(changes, -7, shapExplanations);

    expect(rows).toHaveLength(2);
    expect(rows.every((row) => row.impactPoints <= 0)).toBe(true);

    const totalImpact = rows.reduce((sum, row) => sum + row.impactPoints, 0);
    expect(totalImpact).toBeCloseTo(-7, 1);
    expect(rows[0].barHeightPercent).toBeGreaterThanOrEqual(rows[1].barHeightPercent);
  });

  it("returns top impact field keys for highlighting", () => {
    const changes: SimulationChangeItem[] = [
      {
        feature_name: "previous_admissions",
        original_value: "3",
        simulated_value: "0",
      },
      {
        feature_name: "glucose",
        original_value: "180",
        simulated_value: "120",
      },
    ];

    const rows = computeSimulationImpactRows(changes, -7, shapExplanations);

    expect(topImpactFieldKeys(rows, 1)).toEqual([rows[0].fieldKey]);
  });
});
