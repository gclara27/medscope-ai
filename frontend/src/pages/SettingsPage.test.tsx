import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SettingsPage } from "@/pages/SettingsPage";

describe("SettingsPage", () => {
  it("renders admin settings placeholder with planned modules", () => {
    render(<SettingsPage />);

    expect(screen.getByRole("heading", { name: /system settings/i })).toBeInTheDocument();
    expect(screen.getByText(/coming in a later sprint/i)).toBeInTheDocument();
    expect(screen.getByText(/user management/i)).toBeInTheDocument();
    expect(screen.getByText(/role policies/i)).toBeInTheDocument();
    expect(screen.getByText(/system configuration/i)).toBeInTheDocument();
  });
});
