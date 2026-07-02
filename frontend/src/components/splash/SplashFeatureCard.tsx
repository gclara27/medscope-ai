import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SplashFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  onClick?: () => void;
}

/** Glass feature highlight for the splash screen (RFW-splash). */
export function SplashFeatureCard({
  icon: Icon,
  title,
  description,
  className,
  onClick,
}: SplashFeatureCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Learn more about ${title}`}
      className={cn(
        "flex w-full items-center gap-4 rounded-xl border border-white/20 bg-white/10 p-4 text-left shadow-lg backdrop-blur-md",
        "transition-colors hover:border-white/35 hover:bg-white/15",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        className,
      )}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/40">
        <Icon className="h-6 w-6 text-white" aria-hidden />
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="text-xs leading-relaxed text-white/80">{description}</p>
      </div>
    </button>
  );
}
