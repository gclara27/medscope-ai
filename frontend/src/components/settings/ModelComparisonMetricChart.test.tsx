import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ModelComparisonMetricChart } from "@/components/settings/ModelComparisonMetricChart";
import { renderWithTheme } from "@/test/renderWithTheme";
import type { ModelComparisonItem } from "@/types/mlComparison";

const demoModels: ModelComparisonItem[] = [
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
];

describe("ModelComparisonMetricChart", () => {
  it("renders recall comparison bar chart", () => {
    const { container } = renderWithTheme(
      <ModelComparisonMetricChart
        models={demoModels}
        primaryMetric="recall"
        productionModelId="logistic_regression"
      />,
    );

    expect(screen.getByRole("heading", { name: /recall comparison/i })).toBeInTheDocument();
    expect(container.querySelector(".recharts-responsive-container")).toBeInTheDocument();
  });

  it("shows empty state when no evaluated models exist", () => {
    renderWithTheme(
      <ModelComparisonMetricChart
        models={[
          {
            model_id: "xgboost",
            display_name: "XGBoost",
            version: "1.0.0",
            is_production: false,
            available: false,
            metrics: null,
          },
        ]}
        primaryMetric="recall"
        productionModelId="logistic_regression"
      />,
    );

    expect(screen.getByText(/no chart data available/i)).toBeInTheDocument();
  });
});
