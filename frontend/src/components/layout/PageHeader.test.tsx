import { LayoutDashboard } from "lucide-react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageHeader } from "@/components/layout/PageHeader";

describe("PageHeader", () => {
  it("renders eyebrow, title, and description", () => {
    render(
      <PageHeader
        eyebrow="Clinical overview"
        title="Clinical Dashboard"
        description="Welcome back."
      />,
    );

    expect(screen.getByText(/clinical overview/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /clinical dashboard/i })).toBeInTheDocument();
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });

  it("renders optional route icon beside the title", () => {
    const { container } = render(
      <PageHeader icon={LayoutDashboard} title="Clinical Dashboard" />,
    );

    expect(screen.getByRole("heading", { name: /clinical dashboard/i })).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders optional actions", () => {
    render(
      <PageHeader
        title="History"
        actions={<button type="button">Export</button>}
      />,
    );

    expect(screen.getByRole("button", { name: /export/i })).toBeInTheDocument();
  });
});
