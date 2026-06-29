import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ModelComparisonPanel } from "@/components/settings/ModelComparisonPanel";
import type { ModelComparisonResponse } from "@/types/mlComparison";

const getModelComparisonMock = vi.fn();

vi.mock("@/services/mlComparison", () => ({
  getModelComparison: (...args: unknown[]) => getModelComparisonMock(...args),
}));

const demoComparison: ModelComparisonResponse = {
  is_available: true,
  primary_metric: "recall",
  recall_winner: "logistic_regression",
  baseline_winner: "logistic_regression",
  production_model_id: "logistic_regression",
  production_model_version: "1.0.0",
  summary: "Logistic Regression leads on recall among evaluated candidates.",
  rationale: ["Includes XGBoost when evaluation artifact exists."],
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

describe("ModelComparisonPanel", () => {
  it("renders model metrics table with production badge", async () => {
    getModelComparisonMock.mockResolvedValue(demoComparison);

    render(<ModelComparisonPanel />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /ml model comparison/i })).toBeInTheDocument();
    });

    expect(screen.getByText("Production model")).toBeInTheDocument();
    expect(screen.getAllByText("Logistic Regression").length).toBeGreaterThan(0);
    expect(screen.getByText("Random Forest")).toBeInTheDocument();
    expect(screen.getByText("54.0%")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /why this production model/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /recall comparison/i })).toBeInTheDocument();
    expect(screen.getByText(/highest recall/i)).toBeInTheDocument();
    expect(screen.getByText(/offline training evaluation/i)).toBeInTheDocument();
    expect(getModelComparisonMock).toHaveBeenCalled();
  });

  it("shows unavailable message when artifacts are missing", async () => {
    getModelComparisonMock.mockResolvedValue({
      ...demoComparison,
      is_available: false,
      missing_artifacts: ["baseline_comparison.json"],
      models: [],
    });

    render(<ModelComparisonPanel />);

    await waitFor(() => {
      expect(screen.getByText(/model comparison is unavailable/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/baseline_comparison.json/i)).toBeInTheDocument();
  });
});
