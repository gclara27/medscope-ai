/** Support ticket mailto helpers — T-X05-05, UC-065, RF-073. */

export type SupportTicketPriority = "standard" | "urgent";

export interface SupportTicketCategoryOption {
  value: string;
  label: string;
}

export const SUPPORT_TICKET_CATEGORIES: readonly SupportTicketCategoryOption[] = [
  { value: "technical-error", label: "Technical Error / Bug" },
  { value: "ai-diagnostic", label: "AI Diagnostic Query" },
  { value: "account-access", label: "Account Access" },
  { value: "ehr-integration", label: "EHR Integration" },
] as const;

export const SUPPORT_TICKET_PRIORITY_LABELS: Record<SupportTicketPriority, string> = {
  standard: "Standard",
  urgent: "Urgent (Clinical)",
};

export const SUPPORT_TICKET_COPY = {
  formHeading: "Submit a Ticket",
  categoryLabel: "Issue Category",
  priorityLabel: "Priority Level",
  descriptionLabel: "Description",
  descriptionPlaceholder: "Describe the issue in detail…",
  submitLabel: "Submit to IT Support",
  descriptionRequired: "Please describe the issue before submitting.",
} as const;

export interface SupportTicketDraft {
  category: string;
  priority: SupportTicketPriority;
  description: string;
}

export function getSupportTicketCategoryLabel(value: string): string {
  const match = SUPPORT_TICKET_CATEGORIES.find((option) => option.value === value);
  return match?.label ?? value;
}

export function buildSupportTicketMailtoUrl(
  email: string,
  draft: SupportTicketDraft,
): string {
  const categoryLabel = getSupportTicketCategoryLabel(draft.category);
  const priorityLabel = SUPPORT_TICKET_PRIORITY_LABELS[draft.priority];
  const subject = `[MedScope AI] ${categoryLabel} — ${priorityLabel}`;
  const body = [
    `Category: ${categoryLabel}`,
    `Priority: ${priorityLabel}`,
    "",
    draft.description.trim(),
  ].join("\n");

  const params = new URLSearchParams({
    subject,
    body,
  });

  return `mailto:${email}?${params.toString()}`;
}

export function submitSupportTicket(email: string, draft: SupportTicketDraft): void {
  window.location.href = buildSupportTicketMailtoUrl(email, draft);
}
