import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SupportPage } from "@/pages/SupportPage";
import { DEFAULT_SUPPORT_CONTACT_EMAIL, SUPPORT_KB_CATEGORIES } from "@/lib/supportKb";
import { getSupportContact } from "@/services/support";
import * as supportTicket from "@/lib/supportTicket";

vi.mock("@/services/support", () => ({
  getSupportContact: vi.fn(),
}));

vi.mock("@/lib/supportTicket", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/supportTicket")>();
  return {
    ...actual,
    submitSupportTicket: vi.fn(),
  };
});

describe("SupportPage (RTS-040)", () => {
  beforeEach(() => {
    vi.mocked(getSupportContact).mockResolvedValue({
      support_contact_email: "bioinformatics@institution.edu",
    });
    vi.mocked(supportTicket.submitSupportTicket).mockReset();
  });

  it("renders support center hero and knowledge base heading", async () => {
    render(<SupportPage />);

    expect(screen.getByRole("heading", { level: 1, name: /clinical support center/i })).toBeInTheDocument();
    expect(
      screen.getByText(/access documentation, troubleshoot ai model behaviors/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /knowledge base topics/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("link", { name: /bioinformatics@institution\.edu/i })).toBeInTheDocument();
    });
  });

  it("renders all knowledge base category cards", () => {
    render(<SupportPage />);

    for (const category of SUPPORT_KB_CATEGORIES) {
      expect(screen.getByRole("heading", { level: 3, name: category.title })).toBeInTheDocument();
      expect(screen.getByText(category.description)).toBeInTheDocument();
    }
  });

  it("filters knowledge base categories when searching", async () => {
    const user = userEvent.setup();
    render(<SupportPage />);

    await user.type(screen.getByRole("searchbox"), "hipaa");

    expect(screen.getByRole("heading", { level: 3, name: /compliance & security/i })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3, name: /getting started/i })).not.toBeInTheDocument();
  });

  it("shows empty state when search has no matches", async () => {
    const user = userEvent.setup();
    render(<SupportPage />);

    await user.type(screen.getByRole("searchbox"), "zzzz-not-found");

    expect(screen.getByText(/no knowledge base topics match your search/i)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3, name: /getting started/i })).not.toBeInTheDocument();
  });

  it("restores all categories when search is cleared", async () => {
    const user = userEvent.setup();
    render(<SupportPage />);

    const search = screen.getByRole("searchbox");
    await user.type(search, "hipaa");
    await user.clear(search);

    expect(screen.getByRole("heading", { level: 3, name: /getting started/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: /compliance & security/i })).toBeInTheDocument();
  });

  it("falls back to default support email when contact API fails", async () => {
    vi.mocked(getSupportContact).mockRejectedValueOnce(new Error("network"));

    render(<SupportPage />);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: new RegExp(DEFAULT_SUPPORT_CONTACT_EMAIL, "i") })).toBeInTheDocument();
    });
    expect(screen.getByText(/using default support contact/i)).toBeInTheDocument();
  });

  it("submits support ticket via mailto when description is provided", async () => {
    const user = userEvent.setup();
    render(<SupportPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /submit to it support/i })).toBeEnabled();
    });

    await user.type(screen.getByLabelText(/description/i), "Unable to export analytics PDF.");
    await user.click(screen.getByRole("button", { name: /submit to it support/i }));

    expect(supportTicket.submitSupportTicket).toHaveBeenCalledWith(
      "bioinformatics@institution.edu",
      expect.objectContaining({
        category: "technical-error",
        priority: "standard",
        description: "Unable to export analytics PDF.",
      }),
    );
  });

  it("requires description before submitting ticket", async () => {
    const user = userEvent.setup();
    render(<SupportPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /submit to it support/i })).toBeEnabled();
    });

    await user.click(screen.getByRole("button", { name: /submit to it support/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/please describe the issue/i);
    expect(supportTicket.submitSupportTicket).not.toHaveBeenCalled();
  });
});
