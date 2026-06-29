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
        "group cursor-pointer rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-level-1 transition-colors hover:border-primary",
        className,
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container-low text-primary transition-colors group-hover:bg-primary-fixed">
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold text-on-surface">{category.title}</h3>
      <p className="mt-1 text-sm text-on-surface-variant">{category.description}</p>
    </article>
  );
}
