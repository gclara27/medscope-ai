import { describe, expect, it } from "vitest";

import {
  buildProductionModelExplanation,
  formatModelMetric,
  mapModelComparisonChartData,
} from "@/lib/mlComparisonDisplay";
import type { ModelComparisonResponse } from "@/types/mlComparison";

const demoComparison: ModelComparisonResponse = {
  is_available: true,
  primary_metric: "recall",
  recall_winner: "logistic_regression",
  baseline_winner: "logistic_regression",
  production_model_id: "logistic_regression",
  production_model_version: "1.0.0",
  summary: "Logistic Regression leads on recall.",
  rationale: [],
  offline_note: "Offline evaluation only.",
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
      available: true,
      metrics: {
        accuracy: 0.67,
        recall: 0.44,
        precision: 0.12,
        f1: 0.19,
        roc_auc: 0.6,
      },
    },
  ],
};

describe("buildProductionModelExplanation", () => {
  it("explains recall-first production choice in plain language", () => {
    const explanation = buildProductionModelExplanation(demoComparison);

    expect(explanation).not.toBeNull();
    expect(explanation?.title).toMatch(/why this production model/i);
    expect(explanation?.intro).toMatch(/recall/i);
    expect(explanation?.selectionReason).toContain("Logistic Regression");
    expect(explanation?.selectionReason).toContain(formatModelMetric(0.54));
    expect(explanation?.comparisons.join(" ")).toMatch(/Random Forest/i);
    expect(explanation?.comparisons.join(" ")).toMatch(/accuracy/i);
    expect(explanation?.comparisons.join(" ")).toMatch(/XGBoost/i);
  });

  it("returns null when production metrics are unavailable", () => {
    const explanation = buildProductionModelExplanation({
      ...demoComparison,
      models: demoComparison.models.map((model) =>
        model.is_production ? { ...model, available: false, metrics: null } : model,
      ),
    });

    expect(explanation).toBeNull();
  });
});

describe("mapModelComparisonChartData", () => {
  it("maps available models to percentage bars", () => {
    const data = mapModelComparisonChartData(
      demoComparison.models,
      "recall",
      "logistic_regression",
    );

    expect(data).toHaveLength(3);
    expect(data[0]).toMatchObject({
      model: "Logistic Regression",
      metricPercent: 54,
      isProduction: true,
    });
  });
});
