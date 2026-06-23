import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ClinicalSectionProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ClinicalSection({
  title,
  icon,
  children,
  className,
}: ClinicalSectionProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-level-1",
        className,
      )}
    >
      <div className="mb-4 flex items-center gap-2 border-b border-surface-container-highest pb-3">
        <span className="text-tertiary">{icon}</span>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-on-surface">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}
