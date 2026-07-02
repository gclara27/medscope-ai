import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { AuthProvider } from "@/context/AuthContext";
import { LoginPage } from "@/pages/LoginPage";
import { SplashPage } from "@/pages/SplashPage";

function renderSplash(initialEntry = "/") {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/" element={<SplashPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe("SplashPage", () => {
  it("renders value proposition, CTAs, and feature highlights", () => {
    renderSplash();

    expect(screen.getByText("MedScope AI")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /predictive intelligence for critical decisions/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/explainable ai insights, and what-if simulations/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: /explore demo/i })).toHaveAttribute("href", "/demo");
    expect(screen.getByText(/real-time risk scoring/i)).toBeInTheDocument();
    expect(screen.getByText(/explainable AI \(XAI\)/i)).toBeInTheDocument();
    expect(screen.getByText(/clinical simulation/i)).toBeInTheDocument();
  });

  it("opens the login page when sign in is clicked", async () => {
    const user = userEvent.setup();
    renderSplash();

    await user.click(screen.getByRole("link", { name: /sign in/i }));

    expect(screen.getByText(/secure clinical login/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /authenticate/i })).toBeInTheDocument();
  });

  it("opens a detail dialog when a feature card is clicked", async () => {
    const user = userEvent.setup();
    renderSplash();

    await user.click(
      screen.getByRole("button", { name: /learn more about explainable AI \(XAI\)/i }),
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByText(/SHAP-based explanations that show which variables push risk/i),
    ).toBeInTheDocument();
  });

  it("closes the feature dialog when Escape is pressed", async () => {
    const user = userEvent.setup();
    renderSplash();

    await user.click(
      screen.getByRole("button", { name: /learn more about clinical simulation/i }),
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
