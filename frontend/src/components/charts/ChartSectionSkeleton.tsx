import { Spinner } from "@/components/Spinner";
import { cn } from "@/lib/utils";

interface ChartSectionSkeletonProps {
  label: string;
  className?: string;
}

/** Placeholder while lazy-loaded Recharts bundles render (T-703). */
export function ChartSectionSkeleton({ label, className }: ChartSectionSkeletonProps) {
  return (
    <div
      className={cn(
        "flex h-64 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-lowest",
        className,
      )}
      aria-hidden
    >
      <Spinner label={label} />
    </div>
  );
}

export function AnalyticsChartsSkeleton() {
  return (
    <section className="grid gap-6 lg:grid-cols-3" aria-label="Loading analytics charts">
      <div className="lg:col-span-2">
        <ChartSectionSkeleton label="Loading trend chart" />
      </div>
      <ChartSectionSkeleton label="Loading risk distribution chart" />
    </section>
  );
}

export function ModelComparisonChartSkeleton() {
  return <ChartSectionSkeleton label="Loading model comparison chart" className="h-64 w-full" />;
}
