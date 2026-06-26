import { describe, expect, it, vi } from "vitest";

import { getDashboard } from "@/services/dashboard";
import { api } from "@/services/api";

vi.mock("@/services/api", () => ({
  api: {
    get: vi.fn(),
  },
}));

const apiGetMock = vi.mocked(api.get);

describe("getDashboard", () => {
  it("calls GET /dashboard", async () => {
    const payload = {
      kpis: {
        total_evaluations: 1,
        average_risk_percent: 22.5,
        high_risk_count: 0,
        low_risk_count: 1,
        medium_risk_count: 0,
        evaluations_last_24h: 1,
      },
      risk_distribution: [],
      recent_evaluations: [],
      high_risk_alerts: [],
    };
    apiGetMock.mockResolvedValue({ data: payload });

    await expect(getDashboard()).resolves.toEqual(payload);
    expect(apiGetMock).toHaveBeenCalledWith("/dashboard");
  });
});
