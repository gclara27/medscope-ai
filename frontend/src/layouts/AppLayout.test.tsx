import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { AppLayout } from "@/layouts/AppLayout";

const logoutMock = vi.fn();

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: "1",
      email: "nurse@medscope.ai",
      first_name: "Nora",
      last_name: "Nurse",
      role: "nurse",
    },
    logout: logoutMock,
    isLoading: false,
  }),
}));

function renderLayout(initialPath = "/dashboard") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<div>Dashboard content</div>} />
          <Route path="/history" element={<div>History content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("AppLayout role navigation", () => {
  it("shows only routes allowed for the nurse role", () => {
    renderLayout();

    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /history/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /evaluation/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /analytics/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /settings/i })).not.toBeInTheDocument();
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
