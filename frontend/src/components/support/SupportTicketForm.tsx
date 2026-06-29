import { Send } from "lucide-react";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  SUPPORT_TICKET_CATEGORIES,
  SUPPORT_TICKET_COPY,
  SUPPORT_TICKET_PRIORITY_LABELS,
  type SupportTicketPriority,
  submitSupportTicket,
} from "@/lib/supportTicket";
import { cn } from "@/lib/utils";

interface SupportTicketFormProps {
  supportEmail: string;
  disabled?: boolean;
  className?: string;
}

/** Mailto-based support ticket form (T-X05-05, UC-065). */
export function SupportTicketForm({
  supportEmail,
  disabled = false,
  className,
}: SupportTicketFormProps) {
  const [category, setCategory] = useState(SUPPORT_TICKET_CATEGORIES[0]?.value ?? "");
  const [priority, setPriority] = useState<SupportTicketPriority>("standard");
  const [description, setDescription] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = description.trim();
    if (!trimmed) {
      setValidationError(SUPPORT_TICKET_COPY.descriptionRequired);
      return;
    }

    setValidationError(null);
    submitSupportTicket(supportEmail, { category, priority, description: trimmed });
  }

  return (
    <section
      className={cn(
        "rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-level-1",
        className,
      )}
      aria-labelledby="support-ticket-heading"
    >
      <h3
        id="support-ticket-heading"
        className="mb-4 border-b border-outline-variant pb-3 text-lg font-semibold text-on-surface"
      >
        {SUPPORT_TICKET_COPY.formHeading}
      </h3>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <Label htmlFor="support-ticket-category">{SUPPORT_TICKET_COPY.categoryLabel}</Label>
          <select
            id="support-ticket-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            disabled={disabled}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {SUPPORT_TICKET_CATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="space-y-2" disabled={disabled}>
          <legend className="text-sm font-semibold text-foreground">
            {SUPPORT_TICKET_COPY.priorityLabel}
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(SUPPORT_TICKET_PRIORITY_LABELS) as SupportTicketPriority[]).map((value) => {
              const isSelected = priority === value;
              const isUrgent = value === "urgent";

              return (
                <label key={value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="support-ticket-priority"
                    value={value}
                    checked={isSelected}
                    onChange={() => setPriority(value)}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      "flex items-center justify-center rounded-md border px-2 py-2 text-center text-xs font-medium transition-colors",
                      isSelected && !isUrgent && "border-primary-container bg-primary-container text-on-primary-container",
                      isSelected && isUrgent && "border-error-container bg-error-container text-on-error-container",
                      !isSelected && "border-outline-variant text-on-surface-variant",
                    )}
                  >
                    {SUPPORT_TICKET_PRIORITY_LABELS[value]}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="space-y-2">
          <Label htmlFor="support-ticket-description">{SUPPORT_TICKET_COPY.descriptionLabel}</Label>
          <textarea
            id="support-ticket-description"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              if (validationError) {
                setValidationError(null);
              }
            }}
            disabled={disabled}
            rows={4}
            placeholder={SUPPORT_TICKET_COPY.descriptionPlaceholder}
            className="flex w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
          {validationError ? (
            <p className="text-sm text-error" role="alert">
              {validationError}
            </p>
          ) : null}
        </div>

        <Button type="submit" className="w-full gap-2" disabled={disabled}>
          <Send className="h-4 w-4" aria-hidden />
          {SUPPORT_TICKET_COPY.submitLabel}
        </Button>
      </form>
    </section>
  );
}
