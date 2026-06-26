import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageShell } from "@/components/layout/PageShell";

describe("PageShell", () => {
  it("is left-aligned without horizontal centering", () => {
    const { container } = render(
      <PageShell>
        <p>Page content</p>
      </PageShell>,
    );

    const shell = container.firstElementChild;
    expect(shell).toHaveClass("page-shell");
    expect(shell?.className).not.toMatch(/mx-auto/);
    expect(screen.getByText(/page content/i)).toBeInTheDocument();
  });
});
