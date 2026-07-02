import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface DemoGuidePanelProps {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
  actionLoading?: boolean;
  showContinueIcon?: boolean;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
  children?: ReactNode;
}

/** Coach panel with primary CTA for each demo tour step. */
export function DemoGuidePanel({
  title,
  body,
  actionLabel,
  onAction,
  actionDisabled = false,
  actionLoading = false,
  showContinueIcon = true,
  secondaryActionLabel,
  onSecondaryAction,
  className,
  children,
}: DemoGuidePanelProps) {
  return (
    <Card
      className={cn(
        "border-primary/25 bg-gradient-to-br from-primary/8 via-surface to-surface shadow-level-2",
        className,
      )}
    >
      <CardContent className="space-y-4 p-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-on-surface">{title}</h2>
          <p className="text-sm leading-relaxed text-on-surface-variant">{body}</p>
        </div>

        {children}

        {(actionLabel && onAction) || (secondaryActionLabel && onSecondaryAction) ? (
          <div className="flex flex-col gap-3">
            {actionLabel && onAction ? (
              <Button
                type="button"
                onClick={onAction}
                disabled={actionDisabled || actionLoading}
                className="w-full justify-between gap-2"
              >
                <span>{actionLoading ? "Working…" : actionLabel}</span>
                {showContinueIcon && !actionLoading ? (
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                ) : null}
              </Button>
            ) : null}
            {secondaryActionLabel && onSecondaryAction ? (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onSecondaryAction}
              >
                {secondaryActionLabel}
              </Button>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
