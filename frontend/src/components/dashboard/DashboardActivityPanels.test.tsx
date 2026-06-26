import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import {
  DashboardHighRiskAlerts,
  DashboardRecentEvaluations,
} from "@/components/dashboard/DashboardActivityPanels";
import type { HistoryListItem } from "@/types/history";

const baseItem: HistoryListItem = {
  id: "11111111-2222-3333-4444-555555555555",
  risk_score: 0.82,
  risk_percent: 82,
  risk_level: "high",
  confidence_score: 0.82,
  summary: "Elevated readmission risk driven by prior admissions.",
  model_version: "lr-v1",
  prediction_time_ms: 72,
  created_at: new Date(Date.now() - 5 * 60_000).toISOString(),
  user: {
    id: "user-1",
    email: "clinician@medscope.ai",
    first_name: "Alex",
    last_name: "Rivera",
    role: "clinician",
  },
  patient_input: {
    age: 68,
    gender: "Female",
    glucose: 140,
    hospital_stay_days: 4,
  },
};

describe("Dashboard activity panels", () => {
  it("renders high-risk alerts", () => {
    render(<DashboardHighRiskAlerts alerts={[baseItem]} />);

    expect(screen.getByText(/critical alerts/i)).toBeInTheDocument();
    expect(screen.getByText(/1 active/i)).toBeInTheDocument();
    expect(screen.getByText(/EV-11111111/i)).toBeInTheDocument();
    expect(screen.getByText(/elevated readmission risk/i)).toBeInTheDocument();
  });

  it("renders recent evaluations with link to history", () => {
    render(
      <MemoryRouter>
        <DashboardRecentEvaluations items={[baseItem]} />
      </MemoryRouter>,
    );

    expect(screen.getByText(/recent ai evaluations/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view full log/i })).toHaveAttribute("href", "/history");
    expect(screen.getByText("82.0%")).toBeInTheDocument();
    expect(screen.getByText(/high/i)).toBeInTheDocument();
  });

  it("shows empty states when no data is available", () => {
    render(
      <MemoryRouter>
        <>
          <DashboardHighRiskAlerts alerts={[]} />
          <DashboardRecentEvaluations items={[]} />
        </>
      </MemoryRouter>,
    );

    expect(screen.getByText(/no high-risk alerts right now/i)).toBeInTheDocument();
    expect(screen.getByText(/no evaluations yet/i)).toBeInTheDocument();
  });
});
