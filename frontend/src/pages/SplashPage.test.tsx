import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { AuthProvider } from "@/context/AuthContext";
import { SplashPage } from "@/pages/SplashPage";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe("SplashPage", () => {
  it("renders brand and get started action", () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <SplashPage />
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(screen.getByRole("heading", { name: /medscope ai/i })).toBeInTheDocument();
    expect(
      screen.getByText(/clinical decision support/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /get started/i })).toBeInTheDocument();
  });

  it("navigates to login when get started is clicked", async () => {
    const user = userEvent.setup();
    navigateMock.mockClear();

    render(
      <AuthProvider>
        <MemoryRouter>
          <SplashPage />
        </MemoryRouter>
      </AuthProvider>,
    );

    await user.click(screen.getByRole("button", { name: /get started/i }));

    expect(navigateMock).toHaveBeenCalledWith("/login", { replace: true });
  });
});
