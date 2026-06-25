import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildAnalyticsDateRangeValue } from "@/lib/analyticsDateRange";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { getAnalytics } from "@/services/analytics";
import type { AnalyticsResponse } from "@/types/analytics";

vi.mock("@/services/analytics", () => ({
  getAnalytics: vi.fn(),
}));

const demoResponse: AnalyticsResponse = {
  summary: {
    total_predictions: 12,
    average_risk_percent: 41.5,
    high_risk_count: 2,
    medium_risk_count: 5,
    low_risk_count: 5,
    average_prediction_time_ms: 78.2,
  },
  risk_distribution: [
    { risk_level: "low", count: 5, percentage: 41.7 },
    { risk_level: "medium", count: 5, percentage: 41.7 },
    { risk_level: "high", count: 2, percentage: 16.6 },
  ],
  trend: [
    { date: "2026-06-10", count: 4, average_risk_percent: 38.2 },
    { date: "2026-06-11", count: 8, average_risk_percent: 43.1 },
  ],
  date_from: null,
  date_to: null,
};

describe("AnalyticsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads analytics dashboard with default date range", async () => {
    vi.mocked(getAnalytics).mockResolvedValue(demoResponse);

    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText("12")).toBeInTheDocument();
    });

    const defaultRange = buildAnalyticsDateRangeValue("last_30");
    expect(getAnalytics).toHaveBeenCalledWith({
      date_from: defaultRange.date_from,
      date_to: defaultRange.date_to,
    });
    expect(screen.getByRole("heading", { name: /population analytics/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/analytics kpis/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /prediction volume and average risk/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /risk distribution/i })).toBeInTheDocument();
  });

  it("refetches analytics when date preset changes", async () => {
    vi.mocked(getAnalytics).mockResolvedValue(demoResponse);

    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText("12")).toBeInTheDocument();
    });

    const allTimeRange = buildAnalyticsDateRangeValue("all");
    fireEvent.change(screen.getByLabelText(/analytics date range/i), {
      target: { value: "all" },
    });

    await waitFor(() => {
      expect(getAnalytics).toHaveBeenLastCalledWith({});
    });

    expect(screen.getByText(/showing: all time/i)).toBeInTheDocument();
    expect(allTimeRange.preset).toBe("all");
  });

  it("shows error message when API fails", async () => {
    vi.mocked(getAnalytics).mockRejectedValue({
      isAxiosError: true,
      response: { status: 403, data: { detail: "Forbidden" } },
    });

    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText(/you do not have permission to view analytics/i)).toBeInTheDocument();
    });
  });
});
