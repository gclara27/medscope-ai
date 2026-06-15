import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "@/context/AuthContext";
import { LoginPage } from "@/pages/LoginPage";

describe("LoginPage logout feedback", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows a toast after secure logout redirect", () => {
    render(
      <AuthProvider>
        <MemoryRouter
          initialEntries={[{ pathname: "/login", state: { loggedOut: true } }]}
        >
          <LoginPage />
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(
      screen.getByText(/signed out successfully/i),
    ).toBeInTheDocument();
  });

  it("auto-dismisses the logout toast after a few seconds", async () => {
    render(
      <AuthProvider>
        <MemoryRouter
          initialEntries={[{ pathname: "/login", state: { loggedOut: true } }]}
        >
          <LoginPage />
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(
      screen.getByText(/signed out successfully/i),
    ).toBeInTheDocument();

    vi.advanceTimersByTime(4000);

    await waitFor(() => {
      expect(
        screen.queryByText(/signed out successfully/i),
      ).not.toBeInTheDocument();
    });
  });

  it("allows manual dismissal of the logout toast", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <AuthProvider>
        <MemoryRouter
          initialEntries={[{ pathname: "/login", state: { loggedOut: true } }]}
        >
          <LoginPage />
        </MemoryRouter>
      </AuthProvider>,
    );

    await user.click(screen.getByRole("button", { name: /dismiss notification/i }));

    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(
        screen.queryByText(/signed out successfully/i),
      ).not.toBeInTheDocument();
    });
  });
});
