import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ModelComparisonResponse } from "@/types/mlComparison";
import { api } from "./api";
import { getModelComparison } from "./mlComparison";

vi.mock("./api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./api")>();
  return {
    ...actual,
    api: {
      get: vi.fn(),
    },
  };
});

const demoResponse: ModelComparisonResponse = {
  is_available: true,
  primary_metric: "recall",
  recall_winner: "logistic_regression",
  baseline_winner: "logistic_regression",
  production_model_id: "logistic_regression",
  production_model_version: "1.0.0",
  summary: "Logistic Regression leads on recall.",
  rationale: ["Offline evaluation only."],
  offline_note: "Metrics come from offline training evaluation.",
  missing_artifacts: [],
  models: [
    {
      model_id: "logistic_regression",
      display_name: "Logistic Regression",
      version: "1.0.0",
      is_production: true,
      available: true,
      metrics: {
        accuracy: 0.61,
        recall: 0.54,
        precision: 0.12,
        f1: 0.2,
        roc_auc: 0.61,
      },
    },
    {
      model_id: "random_forest",
      display_name: "Random Forest",
      version: "1.0.0",
      is_production: false,
      available: true,
      metrics: {
        accuracy: 0.82,
        recall: 0.2,
        precision: 0.14,
        f1: 0.17,
        roc_auc: 0.59,
      },
    },
    {
      model_id: "xgboost",
      display_name: "XGBoost",
      version: "1.0.0",
      is_production: false,
      available: false,
      metrics: null,
    },
  ],
};

describe("getModelComparison", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches comparison from GET /ml/models/comparison", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: demoResponse });

    const result = await getModelComparison();

    expect(api.get).toHaveBeenCalledWith("/ml/models/comparison");
    expect(result.production_model_id).toBe("logistic_regression");
    expect(result.models).toHaveLength(3);
  });

  it("rejects malformed API payloads", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: "<!doctype html>" });

    await expect(getModelComparison()).rejects.toThrow(/invalid model comparison response/i);
  });
});
