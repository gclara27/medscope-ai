import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PredictResponse } from "@/types/prediction";
import { api } from "./api";
import { createPrediction } from "./predictions";

vi.mock("./api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./api")>();
  return {
    ...actual,
    api: {
      post: vi.fn(),
    },
  };
});

const demoResponse: PredictResponse = {
  id: "11111111-1111-1111-1111-111111111111",
  risk_score: 0.42,
  risk_percent: 42,
  risk_level: "medium",
  confidence_score: 0.58,
  summary: "Moderate readmission risk based on clinical profile.",
  model_version: "lr-v1",
  prediction_time_ms: 85,
  shap_explanations: [],
  created_at: "2026-06-11T10:00:00Z",
};

describe("createPrediction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("posts clinical payload to /predict", async () => {
    vi.mocked(api.post).mockResolvedValue({ data: demoResponse });

    const payload = {
      age: 65,
      gender: "Female" as const,
      hospital_stay_days: 3,
      medications_count: 8,
      previous_admissions: 1,
      glucose: 140,
    };

    const result = await createPrediction(payload);

    expect(api.post).toHaveBeenCalledWith("/predict", payload);
    expect(result).toEqual(demoResponse);
  });
});
