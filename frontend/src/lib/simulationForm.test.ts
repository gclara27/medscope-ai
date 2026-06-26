import { describe, expect, it } from "vitest";

import { buildPredictRequest, DEFAULT_CLINICAL_FORM_VALUES } from "@/lib/clinicalFormDefaults";
import {
  buildSimulationModifications,
  hasSimulationModifications,
  predictRequestToSimulationValues,
} from "@/lib/simulationForm";

describe("simulationForm", () => {
  const baseline = buildPredictRequest(DEFAULT_CLINICAL_FORM_VALUES);

  it("maps predict request to simulation form values", () => {
    expect(predictRequestToSimulationValues(baseline)).toMatchObject({
      age: 65,
      glucose: 140,
      hospital_stay_days: 3,
    });
  });

  it("builds modifications only for changed fields", () => {
    const current = {
      ...predictRequestToSimulationValues(baseline),
      glucose: 180,
      previous_admissions: 0,
    };

    const modifications = buildSimulationModifications(baseline, current);

    expect(modifications).toEqual({
      glucose: 180,
      previous_admissions: 0,
    });
    expect(hasSimulationModifications(modifications)).toBe(true);
  });

  it("returns empty modifications when values match baseline", () => {
    const current = predictRequestToSimulationValues(baseline);
    const modifications = buildSimulationModifications(baseline, current);
    expect(hasSimulationModifications(modifications)).toBe(false);
  });
});
