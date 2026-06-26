import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DashboardKpiCards } from "@/components/dashboard/DashboardKpiCards";
import type { DashboardKpis } from "@/types/dashboard";

const demoKpis: DashboardKpis = {
  total_evaluations: 157,
  average_risk_percent: 34.2,
  high_risk_count: 12,
  low_risk_count: 98,
  medium_risk_count: 47,
  evaluations_last_24h: 8,
};

describe("DashboardKpiCards", () => {
  it("renders clinical dashboard KPI cards from API summary", () => {
    render(<DashboardKpiCards kpis={demoKpis} />);

    expect(screen.getByLabelText(/dashboard kpis/i)).toBeInTheDocument();
    expect(screen.getByText(/high risk patients/i)).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText(/stable condition/i)).toBeInTheDocument();
    expect(screen.getByText("98")).toBeInTheDocument();
    expect(screen.getByText(/new evaluations \(24h\)/i)).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText(/average risk score/i)).toBeInTheDocument();
    expect(screen.getByText("34.2%")).toBeInTheDocument();
    expect(screen.getByText(/157 total evaluations/i)).toBeInTheDocument();
  });
});
