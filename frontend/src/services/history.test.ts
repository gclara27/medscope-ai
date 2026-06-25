import { beforeEach, describe, expect, it, vi } from "vitest";

import type { HistoryListResponse } from "@/types/history";
import { api } from "./api";
import { listHistory } from "./history";

vi.mock("./api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./api")>();
  return {
    ...actual,
    api: {
      get: vi.fn(),
    },
  };
});

const demoResponse: HistoryListResponse = {
  items: [
    {
      id: "11111111-1111-1111-1111-111111111111",
      risk_score: 0.42,
      risk_percent: 42,
      risk_level: "medium",
      confidence_score: 0.58,
      summary: "Moderate readmission risk.",
      model_version: "lr-v1",
      prediction_time_ms: 85,
      created_at: "2026-06-11T10:00:00Z",
      user: {
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        email: "clinician@medscope.ai",
        first_name: "Demo",
        last_name: "Clinician",
        role: "clinician",
      },
      patient_input: {
        age: 65,
        gender: "Female",
        glucose: 140,
        hospital_stay_days: 3,
      },
    },
  ],
  total: 1,
  limit: 50,
  offset: 0,
};

describe("listHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches paginated history from GET /history", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: demoResponse });

    const result = await listHistory();

    expect(api.get).toHaveBeenCalledWith("/history", { params: {} });
    expect(result).toEqual(demoResponse);
  });

  it("passes filter and pagination query params", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: demoResponse });

    await listHistory({
      risk_level: "high",
      user_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      date_from: "2026-06-01",
      date_to: "2026-06-30",
      limit: 25,
      offset: 10,
    });

    expect(api.get).toHaveBeenCalledWith("/history", {
      params: {
        risk_level: "high",
        user_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        date_from: "2026-06-01",
        date_to: "2026-06-30",
        limit: 25,
        offset: 10,
      },
    });
  });
});
