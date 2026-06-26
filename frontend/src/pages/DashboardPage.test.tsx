import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "@/context/AuthContext";
import { DashboardPage } from "@/pages/DashboardPage";
import { getDashboard } from "@/services/dashboard";

vi.mock("@/services/dashboard", () => ({
  getDashboard: vi.fn(),
}));

vi.mock("@/components/dashboard/DashboardRiskDistributionChart", () => ({
  DashboardRiskDistributionChart: () => (
    <section aria-label="Risk distribution chart">
      <h2>Risk distribution</h2>
    </section>
  ),
}));

const getDashboardMock = vi.mocked(getDashboard);

const demoDashboard = {
  kpis: {
    total_evaluations: 5,
    average_risk_percent: 28.5,
    high_risk_count: 1,
    low_risk_count: 3,
    medium_risk_count: 1,
    evaluations_last_24h: 2,
  },
  risk_distribution: [
    { risk_level: "low" as const, count: 3, percentage: 60 },
    { risk_level: "medium" as const, count: 1, percentage: 20 },
    { risk_level: "high" as const, count: 1, percentage: 20 },
  ],
  recent_evaluations: [],
  high_risk_alerts: [],
};

function renderDashboardPage() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe("DashboardPage", () => {
  beforeEach(() => {
    getDashboardMock.mockReset();
  });

  it("loads dashboard KPI cards from the API", async () => {
    getDashboardMock.mockResolvedValue(demoDashboard);

    renderDashboardPage();

    expect(await screen.findByLabelText(/dashboard kpis/i)).toBeInTheDocument();
    expect(screen.getByText("28.5%")).toBeInTheDocument();
    expect(screen.getByText(/recent ai evaluations/i)).toBeInTheDocument();
    expect(screen.getByText(/critical alerts/i)).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: /risk distribution/i }),
    ).toBeInTheDocument();
    expect(getDashboardMock).toHaveBeenCalledTimes(1);
  });

  it("shows an error when dashboard loading fails", async () => {
    getDashboardMock.mockRejectedValue(new Error("network"));

    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByText(/unable to load the dashboard/i)).toBeInTheDocument();
    });
  });
});
