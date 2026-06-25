import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AnalyticsRiskDistributionChart } from "@/components/analytics/AnalyticsRiskDistributionChart";
import type { RiskDistributionItem } from "@/types/analytics";

const demoDistribution: RiskDistributionItem[] = [
  { risk_level: "low", count: 5, percentage: 41.7 },
  { risk_level: "medium", count: 5, percentage: 41.7 },
  { risk_level: "high", count: 2, percentage: 16.6 },
];

describe("AnalyticsRiskDistributionChart", () => {
  it("renders risk distribution chart from analytics payload", () => {
    const { container } = render(
      <AnalyticsRiskDistributionChart distribution={demoDistribution} />,
    );

    expect(screen.getByRole("heading", { name: /risk distribution/i })).toBeInTheDocument();
    expect(screen.getByText(/population readmission risk buckets/i)).toBeInTheDocument();
    expect(container.querySelector(".recharts-responsive-container")).toBeInTheDocument();
  });

  it("shows empty state when there are no predictions", () => {
    render(
      <AnalyticsRiskDistributionChart
        distribution={[
          { risk_level: "low", count: 0, percentage: 0 },
          { risk_level: "medium", count: 0, percentage: 0 },
          { risk_level: "high", count: 0, percentage: 0 },
        ]}
      />,
    );

    expect(screen.getByText(/no predictions in the selected period/i)).toBeInTheDocument();
  });
});
