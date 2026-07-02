import type { SupportKbCategory } from "@/lib/supportKb";
import { SUPPORT_KB_ICONS } from "@/components/support/supportKbIcons";
import { cn } from "@/lib/utils";

interface SupportKbCategoryCardProps {
  category: SupportKbCategory;
  className?: string;
}

export function SupportKbCategoryCard({ category, className }: SupportKbCategoryCardProps) {
  const Icon = SUPPORT_KB_ICONS[category.icon];

  return (
    <article
      className={cn(
        "rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-level-1",
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-container-low text-primary">
          <Icon className="h-6 w-6" aria-hidden />
        </div>
        <span className="rounded-full border border-outline-variant bg-surface px-2.5 py-0.5 text-xs font-medium text-on-surface-variant">
          Coming soon
        </span>
      </div>
      <h3 className="text-lg font-semibold text-on-surface">{category.title}</h3>
      <p className="mt-1 text-sm text-on-surface-variant">{category.description}</p>
    </article>
  );
}
