import { describe, expect, it } from "vitest";

import {
  CLINICAL_DEMO_SCENARIOS,
  CLINICAL_DEMO_SCENARIO_IDS,
  HIGH_READMISSION_DEMO_FORM,
  buildScenarioPredictRequest,
  getClinicalDemoScenario,
} from "@/lib/clinicalDemoScenarios";
import { buildPredictRequest } from "@/lib/clinicalFormDefaults";

describe("clinicalDemoScenarios", () => {
  it("defines four unique demo scenarios", () => {
    expect(CLINICAL_DEMO_SCENARIOS).toHaveLength(4);
    expect(new Set(CLINICAL_DEMO_SCENARIO_IDS).size).toBe(4);
    expect(CLINICAL_DEMO_SCENARIO_IDS).toEqual([
      "high-readmission",
      "moderate-risk",
      "low-risk-stable",
      "simulation-showcase",
    ]);
  });

  it("exposes English titles and vignettes for each scenario", () => {
    for (const scenario of CLINICAL_DEMO_SCENARIOS) {
      expect(scenario.title.trim().length).toBeGreaterThan(0);
      expect(scenario.vignette.trim().length).toBeGreaterThan(0);
      expect(["low", "medium", "high"]).toContain(scenario.expectedRisk);
    }
  });

  it("getClinicalDemoScenario resolves by id", () => {
    expect(getClinicalDemoScenario("moderate-risk")?.title).toBe("Moderate risk profile");
    expect(getClinicalDemoScenario("high-readmission")).toBeDefined();
    expect(getClinicalDemoScenario("unknown" as "high-readmission")).toBeUndefined();
  });

  it("simulation-showcase reuses high-readmission values and includes a hint", () => {
    const showcase = getClinicalDemoScenario("simulation-showcase");
    expect(showcase?.formValues).toEqual(HIGH_READMISSION_DEMO_FORM);
    expect(showcase?.simulationHint).toMatch(/simulation/i);
    expect(showcase?.simulationHint).toMatch(/previous admissions/i);
  });

  it("buildScenarioPredictRequest maps each scenario to a valid PredictRequest", () => {
    for (const scenario of CLINICAL_DEMO_SCENARIOS) {
      const payload = buildScenarioPredictRequest(scenario);
      expect(payload).toEqual(buildPredictRequest(scenario.formValues));
      expect(payload.age).toBe(scenario.formValues.age);
      expect(payload.gender).toBe(scenario.formValues.gender);
      expect(payload.previous_admissions).toBe(scenario.formValues.previous_admissions);
      expect(payload.glucose).toBe(scenario.formValues.glucose);
      expect(payload.diabetes_medication).toBe("Yes");
      expect(payload.race).toBe("Caucasian");
    }
  });

  it("encodes clinically distinct risk profiles in key drivers", () => {
    const high = buildScenarioPredictRequest(getClinicalDemoScenario("high-readmission")!);
    const low = buildScenarioPredictRequest(getClinicalDemoScenario("low-risk-stable")!);

    expect(high.previous_admissions).toBeGreaterThan(low.previous_admissions);
    expect(high.glucose).toBeGreaterThan(low.glucose!);
    expect(high.medications_count).toBeGreaterThan(low.medications_count);
  });

  it("documents expected risk bands aligned with production model validation", () => {
    expect(getClinicalDemoScenario("high-readmission")?.expectedRisk).toBe("high");
    expect(getClinicalDemoScenario("moderate-risk")?.expectedRisk).toBe("medium");
    expect(getClinicalDemoScenario("low-risk-stable")?.expectedRisk).toBe("low");
    expect(getClinicalDemoScenario("simulation-showcase")?.expectedRisk).toBe("high");
  });
});
