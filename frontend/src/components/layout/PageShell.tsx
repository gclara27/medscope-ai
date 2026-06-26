import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageShellProps {
  children: ReactNode;
  className?: string;
}

/** Standard page container — left-aligned max width; lateral gutters live on AppLayout main (T-701). */
export function PageShell({ children, className }: PageShellProps) {
  return <div className={cn("page-shell space-y-8", className)}>{children}</div>;
}
