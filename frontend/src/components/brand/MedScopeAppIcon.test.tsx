import { MedScopeAppIcon } from "@/components/brand/MedScopeAppIcon";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("MedScopeAppIcon", () => {
  it("renders accessible brand mark with primary blue tile", () => {
    render(<MedScopeAppIcon size="md" />);

    expect(screen.getByRole("img", { name: /medscope ai/i })).toHaveClass("bg-primary");
  });

  it("applies size classes for layout slots", () => {
    const { container } = render(<MedScopeAppIcon size="sm" />);

    expect(container.querySelector('[role="img"]')).toHaveClass("h-8", "w-8");
  });

  it("renders the white microscope glyph", () => {
    const { container } = render(<MedScopeAppIcon size="md" />);

    const glyph = container.querySelector('img[aria-hidden="true"]');
    expect(glyph).toBeInTheDocument();
    expect(glyph?.getAttribute("src")).toMatch(/app-icon-glyph/);
  });
});
