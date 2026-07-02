import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { SplashFeature } from "@/lib/splashFeatures";
import { cn } from "@/lib/utils";

export interface SplashFeatureDialogProps {
  feature: SplashFeature | null;
  open: boolean;
  onClose: () => void;
}

/** Feature detail overlay for the splash screen. */
export function SplashFeatureDialog({ feature, open, onClose }: SplashFeatureDialogProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !feature) {
    return null;
  }

  const Icon = feature.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        aria-label="Close feature details"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative z-10 w-full max-w-lg rounded-xl border border-white/20",
          "bg-[#0b1326]/95 p-6 text-white shadow-2xl backdrop-blur-md",
        )}
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/50">
            <Icon className="h-6 w-6 text-white" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 pr-8">
            <h2 id={titleId} className="text-lg font-semibold text-white">
              {feature.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/85">{feature.summary}</p>
          </div>
          <Button
            ref={closeButtonRef}
            type="button"
            variant="outline"
            size="icon"
            className="absolute right-4 top-4 h-8 w-8 border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>

        <ul className="mt-5 space-y-2 border-t border-white/15 pt-4 text-sm text-white/80">
          {feature.bullets.map((bullet) => (
            <li key={bullet} className="flex gap-2 leading-relaxed">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
