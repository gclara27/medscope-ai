import { afterEach, describe, expect, it } from "vitest";

import { demoBaselineRequest } from "@/test/fixtures/prediction";
import type { PredictResponse } from "@/types/prediction";
import type { SimulateResponse, SimulationFormValues } from "@/types/simulation";
import {
  SIMULATION_SESSION_KEY,
  buildSimulationLocationState,
  clearSimulationSession,
  consumeSimulationForceReset,
  loadSimulationSession,
  markSimulationForceReset,
  saveSimulationContext,
  saveSimulationSession,
  shouldRestoreSimulationDraft,
} from "@/utils/simulationSession";
import { predictRequestToSimulationValues } from "@/lib/simulationForm";

const demoResult: PredictResponse = {
  id: "11111111-1111-1111-1111-111111111111",
  risk_score: 0.42,
  risk_percent: 42,
  risk_level: "medium",
  confidence_score: 0.58,
  summary: "Moderate readmission risk.",
  model_version: "lr-v1",
  prediction_time_ms: 85,
  shap_explanations: [],
  created_at: "2026-06-11T10:00:00Z",
};

afterEach(() => {
  clearSimulationSession();
});

describe("simulationSession", () => {
  it("builds location state from prediction result and baseline", () => {
    const state = buildSimulationLocationState(demoResult, demoBaselineRequest);

    expect(state.predictionId).toBe(demoResult.id);
    expect(state.baseline).toEqual(demoBaselineRequest);
    expect(state.result).toEqual(demoResult);
    expect(state.originalRisk.risk_percent).toBe(42);
  });

  it("persists and restores simulation context in sessionStorage", () => {
    const state = buildSimulationLocationState(demoResult, demoBaselineRequest);
    saveSimulationSession(state);

    expect(sessionStorage.getItem(SIMULATION_SESSION_KEY)).not.toBeNull();
    expect(loadSimulationSession()).toEqual(state);
  });

  it("persists and restores draft values with simulation result", () => {
    const state = buildSimulationLocationState(demoResult, demoBaselineRequest);
    const draftValues: SimulationFormValues = {
      ...predictRequestToSimulationValues(demoBaselineRequest),
      age: 34,
      medications_count: 29,
      blood_pressure: 182,
    };
    const lastSimResult: SimulateResponse = {
      id: "22222222-2222-2222-2222-222222222222",
      prediction_id: demoResult.id,
      original_risk_score: 0.49,
      original_risk_percent: 49,
      original_risk_level: "medium",
      simulated_risk_score: 0.432,
      simulated_risk_percent: 43.2,
      simulated_risk_level: "medium",
      delta_risk_percent: -5.9,
      simulation_summary: "Risk decreased.",
      changes: [],
      simulation_time_ms: 60,
      model_version: "lr-v1",
      created_at: "2026-06-11T11:00:00Z",
    };

    saveSimulationSession({ ...state, draftValues, lastSimResult });

    const restored = loadSimulationSession();
    expect(restored?.draftValues).toEqual(draftValues);
    expect(restored?.lastSimResult).toEqual(lastSimResult);
  });

  it("preserves draft when saving context for the same prediction", () => {
    const state = buildSimulationLocationState(demoResult, demoBaselineRequest);
    const draftValues: SimulationFormValues = {
      ...predictRequestToSimulationValues(demoBaselineRequest),
      age: 34,
    };

    saveSimulationSession({ ...state, draftValues, lastSimResult: null });
    saveSimulationContext(state);

    const restored = loadSimulationSession();
    expect(restored?.draftValues?.age).toBe(34);
  });

  it("shouldRestoreSimulationDraft ignores resetDraft flag", () => {
    const state = buildSimulationLocationState(demoResult, demoBaselineRequest);
    const session = {
      ...state,
      draftValues: predictRequestToSimulationValues(demoBaselineRequest),
    };

    expect(shouldRestoreSimulationDraft(session, state.predictionId, false)).toBe(true);
    expect(shouldRestoreSimulationDraft(session, state.predictionId, true)).toBe(false);
  });

  it("force reset flag is consumed once per explicit Run simulation navigation", () => {
    markSimulationForceReset();
    expect(consumeSimulationForceReset()).toBe(true);
    expect(consumeSimulationForceReset()).toBe(false);
  });

  it("returns null for invalid stored payload", () => {
    sessionStorage.setItem(SIMULATION_SESSION_KEY, '{"predictionId":"x"}');
    expect(loadSimulationSession()).toBeNull();
  });
});
