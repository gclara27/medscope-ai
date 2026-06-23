import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Alert } from "@/components/Alert";
import { Spinner } from "@/components/Spinner";

describe("UX feedback components (T-412)", () => {
  it("renders spinner with accessible status", () => {
    render(<Spinner label="Loading dashboard" />);
    expect(screen.getByRole("status", { name: /loading dashboard/i })).toBeInTheDocument();
  });

  it("renders error alert with alert role", () => {
    render(<Alert variant="error">Invalid credentials</Alert>);
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid credentials");
  });
});
