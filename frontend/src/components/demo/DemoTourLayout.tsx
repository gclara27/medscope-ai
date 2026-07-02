import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface DemoTourLayoutProps {
  guide: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Two-column demo layout — sticky guide rail on the left, step content on the right. */
export function DemoTourLayout({ guide, children, className }: DemoTourLayoutProps) {
  return (
    <div
      className={cn(
        "grid gap-6 lg:grid-cols-[minmax(17.5rem,20rem)_minmax(0,1fr)] lg:items-start lg:gap-8",
        className,
      )}
    >
      <aside className="lg:sticky lg:top-6 lg:self-start">{guide}</aside>
      <div className="min-w-0 space-y-8">{children}</div>
    </div>
  );
}
