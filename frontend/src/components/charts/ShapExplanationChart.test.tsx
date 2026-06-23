import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ShapExplanationChart } from "@/components/charts/ShapExplanationChart";
import type { ShapExplanationItem } from "@/types/prediction";

const explanations: ShapExplanationItem[] = [
  {
    feature_name: "Distinct medications",
    feature_value: 8,
    shap_value: 0.12,
    importance_rank: 1,
    direction: "increases_risk",
    impact_direction: "positive",
  },
  {
    feature_name: "Hospital stay days",
    feature_value: 3,
    shap_value: -0.05,
    importance_rank: 2,
    direction: "decreases_risk",
    impact_direction: "negative",
  },
];

describe("ShapExplanationChart", () => {
  it("renders SHAP section with legend and feature rows", () => {
    render(<ShapExplanationChart explanations={explanations} />);

    expect(screen.getByLabelText(/shap explainability chart/i)).toBeInTheDocument();
    expect(screen.getByText(/explainable ai \(xai\) analysis/i)).toBeInTheDocument();
    expect(screen.getByText(/increased risk/i)).toBeInTheDocument();
    expect(screen.getByText(/decreased risk/i)).toBeInTheDocument();
    expect(screen.getByText("Distinct medications")).toBeInTheDocument();
    expect(screen.getByText("Hospital stay days")).toBeInTheDocument();
    expect(screen.getByText(/value: 8/i)).toBeInTheDocument();
  });

  it("shows empty state when no explanations", () => {
    render(<ShapExplanationChart explanations={[]} />);

    expect(screen.getByText(/no explainability factors/i)).toBeInTheDocument();
  });
});
