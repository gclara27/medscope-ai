import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { RoleRoute } from "@/components/RoleRoute";

const useAuthMock = vi.fn();

vi.mock("@/context/useAuth", () => ({
  useAuth: () => useAuthMock(),
}));

function renderRoleRoute(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/protected"
          element={
            <RoleRoute allowedRoles={["admin", "clinician"]}>
              <div>Protected content</div>
            </RoleRoute>
          }
        />
        <Route path="/unauthorized" element={<div>Unauthorized page</div>} />
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RoleRoute", () => {
  it("renders children when the user role is allowed", () => {
    useAuthMock.mockReturnValue({
      user: {
        id: "1",
        email: "clinician@medscope.ai",
        first_name: "Clara",
        last_name: "Clinician",
        role: "clinician",
      },
    });

    renderRoleRoute("/protected");

    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });

  it("redirects to unauthorized when the user role is not allowed", () => {
    useAuthMock.mockReturnValue({
      user: {
        id: "2",
        email: "nurse@medscope.ai",
        first_name: "Nora",
        last_name: "Nurse",
        role: "nurse",
      },
    });

    renderRoleRoute("/protected");

    expect(screen.getByText("Unauthorized page")).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("redirects to login when there is no authenticated user", () => {
    useAuthMock.mockReturnValue({ user: null });

    renderRoleRoute("/protected");

    expect(screen.getByText("Login page")).toBeInTheDocument();
  });
});
