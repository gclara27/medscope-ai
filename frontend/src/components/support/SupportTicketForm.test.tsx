import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SupportTicketForm } from "@/components/support/SupportTicketForm";
import * as supportTicket from "@/lib/supportTicket";

vi.mock("@/lib/supportTicket", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/supportTicket")>();
  return {
    ...actual,
    submitSupportTicket: vi.fn(),
  };
});

describe("SupportTicketForm (RTS-040)", () => {
  it("submits urgent ticket with selected category", async () => {
    const user = userEvent.setup();
    render(<SupportTicketForm supportEmail="help@hospital.org" />);

    await user.selectOptions(screen.getByLabelText(/issue category/i), "ehr-integration");
    await user.click(screen.getByRole("radio", { name: /urgent \(clinical\)/i }));
    await user.type(screen.getByLabelText(/description/i), "EHR sync failed overnight.");
    await user.click(screen.getByRole("button", { name: /submit to it support/i }));

    expect(supportTicket.submitSupportTicket).toHaveBeenCalledWith("help@hospital.org", {
      category: "ehr-integration",
      priority: "urgent",
      description: "EHR sync failed overnight.",
    });
  });

  it("disables fields while contact email is loading", () => {
    render(<SupportTicketForm supportEmail="help@hospital.org" disabled />);

    expect(screen.getByLabelText(/issue category/i)).toBeDisabled();
    expect(screen.getByLabelText(/description/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /submit to it support/i })).toBeDisabled();
  });
});
