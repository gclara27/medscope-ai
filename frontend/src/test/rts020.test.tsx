/**
 * RTS-020 consolidated frontend tests — T-707, Testing.md §9.
 * Route guards and MVP sidebar navigation (login covered in LoginPage.test.tsx).
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PermissionRoute } from "@/components/PermissionRoute";
import { PrivateRoute } from "@/components/PrivateRoute";
import { AppLayout } from "@/layouts/AppLayout";

const useAuthMock = vi.fn();
const logoutMock = vi.fn();

vi.mock("@/context/useAuth", () => ({
  useAuth: () => useAuthMock(),
}));

const clinicianUser = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "clinician@medscope.ai",
  first_name: "Clara",
  last_name: "Clinician",
  role: "clinician" as const,
  permissions: {
    dashboard: true,
    evaluation: true,
    simulation: true,
    history: true,
    analytics: false,
    settings: true,
  },
};

const nurseUser = {
  id: "00000000-0000-0000-0000-000000000002",
  email: "nurse@medscope.ai",
  first_name: "Nora",
  last_name: "Nurse",
  role: "nurse" as const,
  permissions: {
    dashboard: true,
    evaluation: false,
    simulation: false,
    history: true,
    analytics: false,
    settings: true,
  },
};

describe("RTS-020 route guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects unauthenticated users to login from private routes", () => {
    useAuthMock.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isBootstrapping: false,
      isLoading: false,
      logout: logoutMock,
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/login" element={<div>Login screen</div>} />
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<div>Dashboard content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Login screen")).toBeInTheDocument();
  });

  it("allows clinician access to evaluation and denies nurse", () => {
    useAuthMock.mockReturnValue({
      user: clinicianUser,
      isAuthenticated: true,
      isBootstrapping: false,
      isLoading: false,
      logout: logoutMock,
    });

    const { unmount } = render(
      <MemoryRouter initialEntries={["/evaluation"]}>
        <Routes>
          <Route
            path="/evaluation"
            element={
              <PermissionRoute module="evaluation">
                <div>Evaluation workspace</div>
              </PermissionRoute>
            }
          />
          <Route path="/unauthorized" element={<div>Unauthorized screen</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Evaluation workspace")).toBeInTheDocument();
    unmount();

    useAuthMock.mockReturnValue({
      user: nurseUser,
      isAuthenticated: true,
      isBootstrapping: false,
      isLoading: false,
      logout: logoutMock,
    });

    render(
      <MemoryRouter initialEntries={["/evaluation"]}>
        <Routes>
          <Route
            path="/evaluation"
            element={
              <PermissionRoute module="evaluation">
                <div>Evaluation workspace</div>
              </PermissionRoute>
            }
          />
          <Route path="/unauthorized" element={<div>Unauthorized screen</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Unauthorized screen")).toBeInTheDocument();
  });
});

describe("RTS-020 MVP sidebar navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthMock.mockReturnValue({
      user: clinicianUser,
      isAuthenticated: true,
      isBootstrapping: false,
      isLoading: false,
      logout: logoutMock,
    });
  });

  function renderClinicianLayout(initialPath = "/dashboard") {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<div>Dashboard content</div>} />
            <Route path="/evaluation" element={<div>Evaluation content</div>} />
            <Route path="/simulation" element={<div>Simulation content</div>} />
            <Route path="/history" element={<div>History content</div>} />
            <Route path="/settings" element={<div>Settings content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
  }

  it("shows clinician MVP links and navigates between modules", async () => {
    const user = userEvent.setup();
    renderClinicianLayout();

    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /evaluation/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /simulation/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /history/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^analytics$/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: /evaluation/i }));
    expect(screen.getByText("Evaluation content")).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: /simulation/i }));
    expect(screen.getByText("Simulation content")).toBeInTheDocument();
  });
});
