import appIconGlyphUrl from "@/assets/app-icon-glyph.png";
import { cn } from "@/lib/utils";

export type MedScopeAppIconSize = "sm" | "md" | "lg" | "xl";

const SIZE_CLASSES: Record<MedScopeAppIconSize, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-20 w-20 md:h-24 md:w-24",
};

interface MedScopeAppIconProps {
  size?: MedScopeAppIconSize;
  className?: string;
  title?: string;
}

/** MedScope brand mark — white glyph on `bg-primary` (exact design-system blue). */
export function MedScopeAppIcon({
  size = "md",
  className,
  title = "MedScope AI",
}: MedScopeAppIconProps) {
  return (
    <div
      role="img"
      aria-label={title}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[22%] bg-primary",
        SIZE_CLASSES[size],
        className,
      )}
    >
      <img
        src={appIconGlyphUrl}
        alt=""
        aria-hidden
        width={64}
        height={64}
        decoding="async"
        className="h-[64%] w-[64%] object-contain"
      />
    </div>
  );
}
