import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AnalyticsResponse } from "@/types/analytics";
import { api } from "./api";
import { downloadAnalyticsPdf, getAnalytics } from "./analytics";

vi.mock("./api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./api")>();
  return {
    ...actual,
    api: {
      get: vi.fn(),
    },
  };
});

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

describe("getAnalytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches analytics from GET /analytics", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: demoResponse });

    const result = await getAnalytics();

    expect(api.get).toHaveBeenCalledWith("/analytics", { params: {} });
    expect(result).toEqual(demoResponse);
  });

  it("passes date range query params", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        ...demoResponse,
        date_from: "2026-06-01",
        date_to: "2026-06-30",
      },
    });

    await getAnalytics({
      date_from: "2026-06-01",
      date_to: "2026-06-30",
    });

    expect(api.get).toHaveBeenCalledWith("/analytics", {
      params: {
        date_from: "2026-06-01",
        date_to: "2026-06-30",
      },
    });
  });
});

describe("downloadAnalyticsPdf", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:analytics"),
      revokeObjectURL: vi.fn(),
    });
  });

  it("downloads analytics export from GET /analytics/export.pdf", async () => {
    const clickMock = vi.fn();
    const removeMock = vi.fn();
    const appendChildMock = vi.fn();
    const link = {
      href: "",
      download: "",
      rel: "",
      click: clickMock,
      remove: removeMock,
    };
    vi.spyOn(document, "createElement").mockReturnValue(link as unknown as HTMLAnchorElement);
    vi.spyOn(document.body, "appendChild").mockImplementation(appendChildMock);

    vi.mocked(api.get).mockResolvedValue({
      data: new Blob(["%PDF-1.4"], { type: "application/pdf" }),
      headers: {
        "content-disposition": 'attachment; filename="medscope-analytics-2026-06-11.pdf"',
      },
    });

    await downloadAnalyticsPdf({ date_from: "2026-06-01", date_to: "2026-06-11" });

    expect(api.get).toHaveBeenCalledWith("/analytics/export.pdf", {
      params: {
        date_from: "2026-06-01",
        date_to: "2026-06-11",
      },
      responseType: "blob",
    });
    expect(link.download).toBe("medscope-analytics-2026-06-11.pdf");
    expect(clickMock).toHaveBeenCalled();
    expect(removeMock).toHaveBeenCalled();
  });
});
