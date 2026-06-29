import { Badge, Mail } from "lucide-react";

import { Spinner } from "@/components/Spinner";
import { SUPPORT_CENTER_COPY } from "@/lib/supportKb";
import { cn } from "@/lib/utils";

interface SupportContactCardProps {
  email: string;
  isLoading?: boolean;
  className?: string;
}

/** Support contact details from system settings (T-X05-04, RF-073). */
export function SupportContactCard({
  email,
  isLoading = false,
  className,
}: SupportContactCardProps) {
  return (
    <aside
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-low p-6",
        className,
      )}
      aria-labelledby="support-contact-heading"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
          <Badge className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <h3 id="support-contact-heading" className="text-lg font-semibold text-on-surface">
            {SUPPORT_CENTER_COPY.contactHeading}
          </h3>
          <p className="mt-1 text-sm text-on-surface-variant">
            {SUPPORT_CENTER_COPY.contactDescription}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Spinner size="sm" label="Loading contact details" />
          Loading contact details…
        </div>
      ) : (
        <a
          href={`mailto:${email}`}
          className="flex items-center gap-3 text-sm text-on-surface transition hover:text-primary"
        >
          <Mail className="h-4 w-4 shrink-0 text-secondary" aria-hidden />
          <span>
            <span className="sr-only">{SUPPORT_CENTER_COPY.contactEmailLabel}: </span>
            {email}
          </span>
        </a>
      )}
    </aside>
  );
}
