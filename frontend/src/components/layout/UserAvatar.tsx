import { UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

export type UserAvatarSize = "sm" | "md";

const SIZE_CLASSES: Record<UserAvatarSize, { container: string; icon: string }> = {
  sm: { container: "h-8 w-8", icon: "h-4 w-4" },
  md: { container: "h-10 w-10", icon: "h-5 w-5" },
};

interface UserAvatarProps {
  displayName?: string;
  size?: UserAvatarSize;
  className?: string;
}

/** Circular profile placeholder — ready for a photo URL in a future iteration. */
export function UserAvatar({ displayName, size = "md", className }: UserAvatarProps) {
  const { container, icon } = SIZE_CLASSES[size];
  const label = displayName
    ? `${displayName} profile photo placeholder`
    : "User profile photo placeholder";

  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border border-outline-variant bg-surface-container-low text-on-surface-variant",
        container,
        className,
      )}
    >
      <UserRound className={icon} aria-hidden />
    </div>
  );
}
