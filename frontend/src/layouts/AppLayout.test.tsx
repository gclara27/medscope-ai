import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppLayout } from "@/layouts/AppLayout";

const logoutMock = vi.fn();
const useAuthMock = vi.fn();

vi.mock("@/context/useAuth", () => ({
  useAuth: () => useAuthMock(),
}));

function renderLayout(initialPath = "/dashboard") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<div>Dashboard content</div>} />
          <Route path="/history" element={<div>History content</div>} />
          <Route path="/history/:predictionId" element={<div>History detail content</div>} />
          <Route path="/settings" element={<div>Settings content</div>} />
          <Route path="/support" element={<div>Support content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("AppLayout role navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthMock.mockReturnValue({
      user: {
        id: "1",
        email: "nurse@medscope.ai",
        first_name: "Nora",
        last_name: "Nurse",
        role: "nurse",
      },
      logout: logoutMock,
      isLoading: false,
    });
  });

  it("shows only routes allowed for the nurse role", () => {
    renderLayout();

    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /history/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /evaluation/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /analytics/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /settings/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /support/i })).toHaveAttribute("href", "/support");
  });

  it("highlights support nav when on support route", () => {
    renderLayout("/support");

    const supportLink = screen.getByRole("link", { name: /support/i });
    expect(supportLink.className).toMatch(/bg-secondary-container/);
    expect(screen.getByText("Support content")).toBeInTheDocument();
  });

  it("shows settings link for admin role", () => {
    useAuthMock.mockReturnValue({
      user: {
        id: "2",
        email: "admin@medscope.ai",
        first_name: "Admin",
        last_name: "User",
        role: "admin",
      },
      logout: logoutMock,
      isLoading: false,
    });

    renderLayout("/settings");

    const settingsLink = screen.getByRole("link", { name: /settings/i });
    expect(settingsLink).toHaveAttribute("href", "/settings");
    expect(settingsLink.className).toMatch(/bg-primary/);
    expect(screen.getByText("Settings content")).toBeInTheDocument();
  });

  it("highlights history nav on detail route", () => {
    renderLayout("/history/11111111-1111-1111-1111-111111111111");

    const historyLink = screen.getByRole("link", { name: /history/i });
    expect(historyLink.className).toMatch(/bg-primary/);
    expect(screen.getByText("History detail content")).toBeInTheDocument();
  });

  it("shows mobile navigation toggle on small screens", () => {
    renderLayout();

    expect(screen.getByRole("button", { name: /open navigation menu/i })).toBeInTheDocument();
  });

  it("logs out and navigates to login", async () => {
    logoutMock.mockResolvedValue(undefined);
    const user = userEvent.setup();

    renderLayout();

    await user.click(screen.getByRole("button", { name: /log out/i }));

    expect(logoutMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Login page")).toBeInTheDocument();
  });
});
