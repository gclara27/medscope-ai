import { describe, expect, it } from "vitest";

import {
  getFurthestReachableDemoStep,
  isDemoTourStepReachable,
  parseDemoTourStepId,
  readDemoTourStepFromPath,
} from "@/lib/demoTour";

describe("isDemoTourStepReachable", () => {
  const empty = { caseLoaded: false, predictionReady: false, simulationReady: false };
  const caseReady = { caseLoaded: true, predictionReady: false, simulationReady: false };
  const predicted = { caseLoaded: true, predictionReady: true, simulationReady: false };
  const simulated = { caseLoaded: true, predictionReady: true, simulationReady: true };

  it("allows case and predict after the demo case is loaded", () => {
    expect(isDemoTourStepReachable("case", caseReady)).toBe(true);
    expect(isDemoTourStepReachable("predict", caseReady)).toBe(true);
    expect(isDemoTourStepReachable("explain", caseReady)).toBe(false);
  });

  it("allows explain and simulate after prediction", () => {
    expect(isDemoTourStepReachable("explain", predicted)).toBe(true);
    expect(isDemoTourStepReachable("simulate", predicted)).toBe(true);
    expect(isDemoTourStepReachable("complete", predicted)).toBe(false);
  });

  it("allows complete only after simulation", () => {
    expect(isDemoTourStepReachable("complete", simulated)).toBe(true);
    expect(isDemoTourStepReachable("complete", empty)).toBe(false);
  });
});

describe("demo tour URL helpers", () => {
  it("parses step path segments", () => {
    expect(parseDemoTourStepId("simulate")).toBe("simulate");
    expect(parseDemoTourStepId("invalid")).toBeNull();
    expect(readDemoTourStepFromPath("/demo/explain")).toBe("explain");
    expect(readDemoTourStepFromPath("/demo")).toBe("welcome");
  });

  it("resolves the furthest reachable step from progress flags", () => {
    expect(
      getFurthestReachableDemoStep({
        caseLoaded: true,
        predictionReady: false,
        simulationReady: false,
      }),
    ).toBe("predict");
    expect(
      getFurthestReachableDemoStep({
        caseLoaded: true,
        predictionReady: true,
        simulationReady: true,
      }),
    ).toBe("complete");
  });
});
