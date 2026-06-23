import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ChartContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function ChartContainer({
  title,
  description,
  children,
  className,
}: ChartContainerProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-level-1",
        className,
      )}
    >
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-on-surface">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-on-surface-variant">{description}</p>
        ) : null}
      </header>
      <div className="h-64 w-full">{children}</div>
    </section>
  );
}
