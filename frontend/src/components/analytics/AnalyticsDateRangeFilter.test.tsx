import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { AnalyticsDateRangeFilter } from "@/components/analytics/AnalyticsDateRangeFilter";
import { buildAnalyticsDateRangeValue } from "@/lib/analyticsDateRange";
import type { AnalyticsDateRangeValue } from "@/types/analytics";

function FilterHarness({
  initialValue = buildAnalyticsDateRangeValue("last_30"),
}: {
  initialValue?: AnalyticsDateRangeValue;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <>
      <AnalyticsDateRangeFilter value={value} onChange={setValue} />
      <output data-testid="range-state">
        {value.preset}:{value.date_from ?? ""}:{value.date_to ?? ""}
      </output>
    </>
  );
}

describe("AnalyticsDateRangeFilter", () => {
  it("applies preset ranges immediately", () => {
    render(<FilterHarness />);

    const ytd = buildAnalyticsDateRangeValue("ytd");
    fireEvent.change(screen.getByLabelText(/analytics date range/i), {
      target: { value: "ytd" },
    });

    expect(screen.getByTestId("range-state")).toHaveTextContent(
      `ytd:${ytd.date_from}:${ytd.date_to}`,
    );
  });

  it("shows custom date inputs and validates range order", () => {
    const initial = buildAnalyticsDateRangeValue("last_30");
    render(<FilterHarness initialValue={initial} />);

    fireEvent.change(screen.getByLabelText(/analytics date range/i), {
      target: { value: "custom" },
    });
    fireEvent.change(screen.getByLabelText(/^from$/i), { target: { value: "2026-06-30" } });
    fireEvent.change(screen.getByLabelText(/^to$/i), { target: { value: "2026-06-01" } });
    fireEvent.click(screen.getByRole("button", { name: /apply range/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/on or before/i);
    expect(screen.getByTestId("range-state")).toHaveTextContent(
      `custom:${initial.date_from}:${initial.date_to}`,
    );
  });

  it("applies a valid custom range", () => {
    render(<FilterHarness />);

    fireEvent.change(screen.getByLabelText(/analytics date range/i), {
      target: { value: "custom" },
    });
    fireEvent.change(screen.getByLabelText(/^from$/i), { target: { value: "2026-06-01" } });
    fireEvent.change(screen.getByLabelText(/^to$/i), { target: { value: "2026-06-30" } });
    fireEvent.click(screen.getByRole("button", { name: /apply range/i }));

    expect(screen.getByTestId("range-state")).toHaveTextContent("custom:2026-06-01:2026-06-30");
  });
});
