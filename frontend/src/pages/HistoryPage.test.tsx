import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HistoryPage } from "@/pages/HistoryPage";
import { listHistory } from "@/services/history";
import type { HistoryListResponse } from "@/types/history";

vi.mock("@/services/history", () => ({
  listHistory: vi.fn(),
}));

const demoItem: HistoryListResponse["items"][number] = {
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
};

describe("HistoryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads and renders prediction history", async () => {
    vi.mocked(listHistory).mockResolvedValue({
      items: [demoItem],
      total: 1,
      limit: 20,
      offset: 0,
    });

    render(<HistoryPage />);

    await waitFor(() => {
      expect(screen.getByText(/moderate readmission risk/i)).toBeInTheDocument();
    });

    expect(listHistory).toHaveBeenCalledWith({ limit: 20, offset: 0 });
    expect(screen.getByRole("heading", { name: /prediction history/i })).toBeInTheDocument();
  });

  it("shows empty state when no evaluations exist", async () => {
    vi.mocked(listHistory).mockResolvedValue({
      items: [],
      total: 0,
      limit: 20,
      offset: 0,
    });

    render(<HistoryPage />);

    await waitFor(() => {
      expect(screen.getByText(/no evaluations found yet/i)).toBeInTheDocument();
    });
  });

  it("shows error message when API fails", async () => {
    vi.mocked(listHistory).mockRejectedValue({
      isAxiosError: true,
      response: { status: 403, data: { detail: "Forbidden" } },
    });

    render(<HistoryPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/you do not have permission to view prediction history/i),
      ).toBeInTheDocument();
    });
  });

  it("requests next page when pagination is used", async () => {
    const user = userEvent.setup();

    vi.mocked(listHistory)
      .mockResolvedValueOnce({
        items: Array.from({ length: 20 }, (_, index) => ({
          ...demoItem,
          id: `00000000-0000-0000-0000-${String(index).padStart(12, "0")}`,
        })),
        total: 25,
        limit: 20,
        offset: 0,
      })
      .mockResolvedValueOnce({
        items: [demoItem],
        total: 25,
        limit: 20,
        offset: 20,
      });

    render(<HistoryPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /next/i })).toBeEnabled();
    });

    await user.click(screen.getByRole("button", { name: /next/i }));

    await waitFor(() => {
      expect(listHistory).toHaveBeenLastCalledWith({ limit: 20, offset: 20 });
    });
  });
});
