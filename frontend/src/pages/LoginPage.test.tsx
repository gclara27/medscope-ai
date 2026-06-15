import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { AuthProvider } from "@/context/AuthContext";
import { LoginPage } from "@/pages/LoginPage";

describe("LoginPage", () => {
  it("renders email and password fields", () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(screen.getByLabelText(/email/i)).toHaveValue("");
    expect(screen.getByLabelText(/password/i)).toHaveValue("");
    expect(screen.getByPlaceholderText(/your\.email@hospital\.org/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /authenticate/i }),
    ).toBeInTheDocument();
  });
});
