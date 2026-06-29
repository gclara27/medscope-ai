import { describe, expect, it } from "vitest";

import {
  SUPPORT_TICKET_CATEGORIES,
  buildSupportTicketMailtoUrl,
  getSupportTicketCategoryLabel,
} from "@/lib/supportTicket";

describe("supportTicket", () => {
  it("builds mailto URL with encoded subject and body", () => {
    const url = buildSupportTicketMailtoUrl("support@medscope.ai", {
      category: "technical-error",
      priority: "urgent",
      description: "Dashboard fails to load after login.",
    });

    expect(url.startsWith("mailto:support@medscope.ai?")).toBe(true);

    const query = url.split("?")[1] ?? "";
    const params = new URLSearchParams(query);
    expect(params.get("subject")).toBe("[MedScope AI] Technical Error / Bug — Urgent (Clinical)");
    expect(params.get("body")).toContain("Dashboard fails to load after login.");
  });

  it("resolves category labels for all ticket categories", () => {
    for (const option of SUPPORT_TICKET_CATEGORIES) {
      expect(getSupportTicketCategoryLabel(option.value)).toBe(option.label);
    }
  });
});
