import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SimulateResponse } from "@/types/simulation";
import { api } from "./api";
import { createSimulation } from "./simulations";

vi.mock("./api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./api")>();
  return {
    ...actual,
    api: {
      post: vi.fn(),
    },
  };
});

const demoResponse: SimulateResponse = {
  id: "22222222-2222-2222-2222-222222222222",
  prediction_id: "11111111-1111-1111-1111-111111111111",
  original_risk_score: 0.42,
  original_risk_percent: 42,
  original_risk_level: "medium",
  simulated_risk_score: 0.35,
  simulated_risk_percent: 35,
  simulated_risk_level: "medium",
  delta_risk_percent: -7,
  simulation_summary: "Lowering prior admissions reduced simulated readmission risk.",
  changes: [
    {
      feature_name: "Prior inpatient visits",
      original_value: "1",
      simulated_value: "0",
    },
  ],
  simulation_time_ms: 72,
  model_version: "lr-v1",
  created_at: "2026-06-11T11:00:00Z",
};

describe("createSimulation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("posts simulation payload to /simulate", async () => {
    vi.mocked(api.post).mockResolvedValue({ data: demoResponse });

    const payload = {
      prediction_id: "11111111-1111-1111-1111-111111111111",
      modifications: { previous_admissions: 0 },
    };

    const result = await createSimulation(payload);

    expect(api.post).toHaveBeenCalledWith("/simulate", payload);
    expect(result).toEqual(demoResponse);
  });
});
