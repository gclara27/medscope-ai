import { Gauge } from "lucide-react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SplashFeatureCard } from "@/components/splash/SplashFeatureCard";

describe("SplashFeatureCard", () => {
  it("renders icon, title, and description", () => {
    render(
      <SplashFeatureCard
        icon={Gauge}
        title="Real-time risk scoring"
        description="30-day readmission risk in under one second."
      />,
    );

    expect(screen.getByText("Real-time risk scoring")).toBeInTheDocument();
    expect(
      screen.getByText(/30-day readmission risk in under one second/i),
    ).toBeInTheDocument();
  });

  it("calls onClick when the card is activated", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <SplashFeatureCard
        icon={Gauge}
        title="Real-time risk scoring"
        description="30-day readmission risk in under one second."
        onClick={onClick}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /learn more about real-time risk scoring/i }),
    );

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
