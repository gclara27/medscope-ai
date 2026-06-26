import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { HistoryFiltersPanel } from "@/components/clinical/HistoryFiltersPanel";
import { DEFAULT_HISTORY_FILTERS } from "@/lib/historyFilters";
import type { HistoryUserSummary } from "@/types/history";

const evaluators: HistoryUserSummary[] = [
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    email: "clinician@medscope.ai",
    first_name: "Demo",
    last_name: "Clinician",
    role: "clinician",
  },
];

describe("HistoryFiltersPanel", () => {
  it("renders date, risk, and evaluator filters", () => {
    render(
      <HistoryFiltersPanel
        value={DEFAULT_HISTORY_FILTERS}
        evaluators={evaluators}
        onChange={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    expect(screen.getByRole("region", { name: /history search filters/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/date range filter/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/risk level filter/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/evaluator filter/i)).toBeInTheDocument();
  });

  it("calls onChange when risk level changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <HistoryFiltersPanel
        value={DEFAULT_HISTORY_FILTERS}
        evaluators={evaluators}
        onChange={onChange}
        onReset={vi.fn()}
      />,
    );

    await user.selectOptions(screen.getByLabelText(/risk level filter/i), "high");

    expect(onChange).toHaveBeenCalledWith({
      ...DEFAULT_HISTORY_FILTERS,
      risk_level: "high",
    });
  });

  it("calls onReset when reset is clicked", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();

    render(
      <HistoryFiltersPanel
        value={DEFAULT_HISTORY_FILTERS}
        evaluators={evaluators}
        onChange={vi.fn()}
        onReset={onReset}
      />,
    );

    await user.click(screen.getByRole("button", { name: /reset/i }));

    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
