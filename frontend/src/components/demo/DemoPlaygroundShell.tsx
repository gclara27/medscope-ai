import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import { MedScopeAppIcon } from "@/components/brand/MedScopeAppIcon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DemoPlaygroundShellProps {
  children: ReactNode;
  stepper?: ReactNode;
  className?: string;
}

/** Light clinical shell for the public demo playground. */
export function DemoPlaygroundShell({ children, stepper, className }: DemoPlaygroundShellProps) {
  return (
    <div className={cn("min-h-screen bg-surface", className)}>
      <header className="border-b border-outline-variant bg-surface shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <MedScopeAppIcon size="md" />
            <div>
              <p className="text-sm font-semibold tracking-tight text-primary">MedScope AI</p>
              <p className="text-xs text-on-surface-variant">
                Interactive demo · Synthetic data only
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Exit demo
            </Link>
          </Button>
        </div>
        {stepper ? (
          <div className="border-t border-outline-variant bg-surface-container-lowest px-4 py-4 sm:px-6">
            <div className="mx-auto max-w-7xl">{stepper}</div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
