import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { XaiClinicalSummary } from "@/components/clinical/XaiClinicalSummary";
import { CLINICAL_DISCLAIMER } from "@/lib/xaiSummaryDisplay";

const fullSummary =
  "Main risk drivers: Prior inpatient visits, Medication count. " +
  "Factors associated with lower risk: Age. " +
  CLINICAL_DISCLAIMER;

describe("XaiClinicalSummary", () => {
  it("renders structured summary with highlights and disclaimer", () => {
    render(<XaiClinicalSummary summary={fullSummary} modelVersion="lr-v1" />);

    expect(screen.getByRole("region", { name: /ai clinical summary/i })).toBeInTheDocument();
    expect(screen.getByText(/model: lr-v1/i)).toBeInTheDocument();
    expect(screen.getByText("Prior inpatient visits")).toHaveClass("text-risk-high");
    expect(screen.getByText("Age")).toHaveClass("text-risk-low");
    expect(screen.getByText(/clinical insight/i)).toBeInTheDocument();
    expect(screen.getByText(CLINICAL_DISCLAIMER)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view full shap analysis/i })).toHaveAttribute(
      "href",
      "#xai-analysis",
    );
  });

  it("scrolls to the SHAP section when the in-page link is clicked", async () => {
    const user = userEvent.setup();
    const scrollIntoViewMock = vi.fn();
    const replaceStateMock = vi.spyOn(window.history, "replaceState").mockImplementation(() => {});

    render(
      <>
        <XaiClinicalSummary summary={fullSummary} modelVersion="lr-v1" />
        <section id="xai-analysis" tabIndex={-1}>
          SHAP chart
        </section>
      </>,
    );

    const shapSection = document.getElementById("xai-analysis");
    expect(shapSection).not.toBeNull();
    shapSection!.scrollIntoView = scrollIntoViewMock;
    const focusSpy = vi.spyOn(shapSection!, "focus");

    await user.click(screen.getByRole("link", { name: /view full shap analysis/i }));

    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
    expect(replaceStateMock).toHaveBeenCalledWith(null, "", "#xai-analysis");

    replaceStateMock.mockRestore();
    focusSpy.mockRestore();
  });

  it("falls back to raw summary text when format is unknown", () => {
    render(
      <XaiClinicalSummary
        summary="Moderate readmission risk based on clinical profile."
        modelVersion="lr-v1"
      />,
    );

    expect(screen.getByText(/moderate readmission risk based on clinical profile/i)).toBeInTheDocument();
  });
});
