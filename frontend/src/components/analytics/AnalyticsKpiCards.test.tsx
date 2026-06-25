import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AnalyticsKpiCards } from "@/components/analytics/AnalyticsKpiCards";
import type { AnalyticsSummary } from "@/types/analytics";

const demoSummary: AnalyticsSummary = {
  total_predictions: 12,
  average_risk_percent: 41.5,
  high_risk_count: 2,
  medium_risk_count: 5,
  low_risk_count: 5,
  average_prediction_time_ms: 78.2,
};

describe("AnalyticsKpiCards", () => {
  it("renders executive KPI cards from analytics summary", () => {
    render(<AnalyticsKpiCards summary={demoSummary} />);

    expect(screen.getByLabelText(/analytics kpis/i)).toBeInTheDocument();
    expect(screen.getByText(/total evaluations/i)).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("41.5%")).toBeInTheDocument();
    expect(screen.getByText(/high risk evaluations/i)).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("78 ms")).toBeInTheDocument();
    expect(screen.getByText(/5 low · 5 med · 2 high/i)).toBeInTheDocument();
  });

  it("shows placeholders when inference time is missing", () => {
    render(
      <AnalyticsKpiCards
        summary={{
          ...demoSummary,
          average_prediction_time_ms: null,
        }}
      />,
    );

    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getByText(/not recorded/i)).toBeInTheDocument();
  });
});
