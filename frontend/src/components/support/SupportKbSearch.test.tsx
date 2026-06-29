import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SupportKbSearch } from "@/components/support/SupportKbSearch";
import { SUPPORT_CENTER_COPY } from "@/lib/supportKb";

describe("SupportKbSearch (RTS-040)", () => {
  it("renders search input with knowledge base placeholder", () => {
    render(<SupportKbSearch value="" onChange={vi.fn()} />);

    expect(screen.getByRole("searchbox")).toHaveAttribute(
      "placeholder",
      SUPPORT_CENTER_COPY.searchPlaceholder,
    );
  });

  it("calls onChange when the query changes", () => {
    const onChange = vi.fn();

    render(<SupportKbSearch value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "compliance" } });

    expect(onChange).toHaveBeenCalledWith("compliance");
  });
});
