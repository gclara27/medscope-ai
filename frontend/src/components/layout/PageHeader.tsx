import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  icon?: LucideIcon;
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/** Shared page title block — eyebrow, headline, body copy (design-system.light.md). */
export function PageHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  meta,
  actions,
  className,
}: PageHeaderProps) {
  const hasActions = Boolean(actions);

  return (
    <header
      className={cn(
        hasActions && "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? <p className="page-eyebrow">{eyebrow}</p> : null}
        <h1 className={cn("page-title", Icon && "flex items-center gap-2.5")}>
          {Icon ? <Icon className="h-7 w-7 shrink-0 text-primary" aria-hidden /> : null}
          <span>{title}</span>
        </h1>
        {description ? <p className="page-description">{description}</p> : null}
        {meta ? <div className="mt-2 text-sm text-on-surface-variant">{meta}</div> : null}
      </div>
      {hasActions ? (
        <div className="flex flex-col gap-2 sm:shrink-0 sm:flex-row">{actions}</div>
      ) : null}
    </header>
  );
}
