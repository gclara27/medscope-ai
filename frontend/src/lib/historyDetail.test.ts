import { describe, expect, it } from "vitest";

import {
  historyDetailBaselineRequest,
  historyDetailToPredictResponse,
} from "@/lib/historyDetail";
import type { HistoryDetailResponse } from "@/types/history";

const demoDetail: HistoryDetailResponse = {
  id: "11111111-1111-1111-1111-111111111111",
  risk_score: 0.42,
  risk_percent: 42,
  risk_level: "medium",
  confidence_score: 0.58,
  summary: "Moderate readmission risk.",
  model_version: "lr-v1",
  prediction_time_ms: 85,
  created_at: "2026-06-11T10:00:00Z",
  user: {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    email: "clinician@medscope.ai",
    first_name: "Demo",
    last_name: "Clinician",
    role: "clinician",
  },
  patient_input: {
    age: 65,
    gender: "Female",
    glucose: 140,
    blood_pressure: 120,
    medications_count: 8,
    previous_admissions: 1,
    hospital_stay_days: 3,
    bmi: 28.4,
  },
  baseline_request: {
    age: 65,
    gender: "Female",
    hospital_stay_days: 3,
    medications_count: 8,
    previous_admissions: 1,
    glucose: 140,
    blood_pressure: 120,
    bmi: 28.4,
  },
  shap_explanations: [
    {
      feature_name: "previous_admissions",
      feature_value: 1,
      shap_value: 0.12,
      importance_rank: 1,
      direction: "increases risk",
      impact_direction: "positive",
    },
  ],
  simulations: [],
};

describe("historyDetail helpers", () => {
  it("maps detail to predict response for simulation reuse", () => {
    const result = historyDetailToPredictResponse(demoDetail);

    expect(result.id).toBe(demoDetail.id);
    expect(result.risk_percent).toBe(42);
    expect(result.shap_explanations).toHaveLength(1);
    expect(result.summary).toBe("Moderate readmission risk.");
  });

  it("returns baseline request from detail", () => {
    expect(historyDetailBaselineRequest(demoDetail).age).toBe(65);
    expect(historyDetailBaselineRequest(demoDetail).glucose).toBe(140);
  });
});
