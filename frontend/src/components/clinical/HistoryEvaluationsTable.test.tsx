import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HistoryEvaluationsTable } from "@/components/clinical/HistoryEvaluationsTable";
import type { HistoryListItem } from "@/types/history";

const demoItem: HistoryListItem = {
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

describe("HistoryEvaluationsTable", () => {
  it("renders history rows with risk badge and summary", () => {
    render(
      <MemoryRouter>
        <HistoryEvaluationsTable items={[demoItem]} />
      </MemoryRouter>,
    );

    expect(screen.getByText(/demo clinician/i)).toBeInTheDocument();
    expect(screen.getByText(/42\.0%/)).toBeInTheDocument();
    expect(screen.getByText(/medium risk/i)).toBeInTheDocument();
    expect(screen.getByText(/moderate readmission risk/i)).toBeInTheDocument();
    expect(screen.getByText(/lr-v1/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view/i })).toHaveAttribute(
      "href",
      `/history/${demoItem.id}`,
    );
  });
});
