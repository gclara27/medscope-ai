import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HistoryDetailPage } from "@/pages/HistoryDetailPage";
import type { HistoryDetailResponse } from "@/types/history";

const getHistoryDetailMock = vi.fn();
const useAuthMock = vi.fn();

vi.mock("@/services/history", () => ({
  getHistoryDetail: (...args: unknown[]) => getHistoryDetailMock(...args),
}));

vi.mock("@/context/useAuth", () => ({
  useAuth: () => useAuthMock(),
}));

const demoDetail: HistoryDetailResponse = {
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
    blood_pressure: 120,
    medications_count: 8,
    previous_admissions: 1,
    hospital_stay_days: 3,
    bmi: 28.4,
  },
  baseline_request: {
    age: 65,
    gender: "Female",
    hospital_stay_days: 3,
    medications_count: 8,
    previous_admissions: 1,
    glucose: 140,
    blood_pressure: 120,
    bmi: 28.4,
  },
  shap_explanations: [
    {
      feature_name: "previous_admissions",
      feature_value: 1,
      shap_value: 0.12,
      importance_rank: 1,
      direction: "increases risk",
      impact_direction: "positive",
    },
  ],
  simulations: [
    {
      id: "22222222-2222-2222-2222-222222222222",
      created_at: "2026-06-11T11:00:00Z",
      original_risk_percent: 42,
      simulated_risk_percent: 35,
      delta_risk_percent: -7,
      simulation_summary: "Lowering admissions reduced risk.",
    },
  ],
};

function renderDetail(predictionId = demoDetail.id) {
  return render(
    <MemoryRouter initialEntries={[`/history/${predictionId}`]}>
      <Routes>
        <Route path="/history/:predictionId" element={<HistoryDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("HistoryDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthMock.mockReturnValue({
      user: { role: "clinician", email: "clinician@medscope.ai" },
    });
    getHistoryDetailMock.mockResolvedValue(demoDetail);
  });

  it("loads and renders historical evaluation with SHAP and inputs", async () => {
    renderDetail();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /historical evaluation detail/i })).toBeInTheDocument();
    });

    expect(getHistoryDetailMock).toHaveBeenCalledWith(demoDetail.id);
    expect(screen.getByText(/moderate readmission risk/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^clinical inputs$/i })).toBeInTheDocument();
    expect(screen.getByText(/explainable ai/i)).toBeInTheDocument();
    expect(screen.getByText(/lowering admissions reduced risk/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /run simulation/i })).toBeInTheDocument();
  });

  it("hides simulation action for nurse role", async () => {
    useAuthMock.mockReturnValue({
      user: { role: "nurse", email: "nurse@medscope.ai" },
    });

    renderDetail();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /historical evaluation detail/i })).toBeInTheDocument();
    });

    expect(screen.queryByRole("link", { name: /run simulation/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to history/i })).toBeInTheDocument();
  });

  it("shows error when detail request fails", async () => {
    getHistoryDetailMock.mockRejectedValue({
      isAxiosError: true,
      response: { status: 404, data: { detail: "Prediction not found" } },
    });

    renderDetail();

    await waitFor(() => {
      expect(screen.getByText(/the requested evaluation was not found/i)).toBeInTheDocument();
    });
  });
});
