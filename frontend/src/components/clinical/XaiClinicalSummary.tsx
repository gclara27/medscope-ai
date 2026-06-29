import { ArrowDown, Sparkles } from "lucide-react";
import type { MouseEvent } from "react";

import { parseClinicalSummary } from "@/lib/xaiSummaryDisplay";
import { cn } from "@/lib/utils";
import { scrollToPageSection } from "@/utils/scrollToSection";

interface XaiClinicalSummaryProps {
  summary: string;
  modelVersion: string;
  shapSectionId?: string;
  className?: string;
}

function FeatureHighlightList({
  features,
  className,
}: {
  features: string[];
  className: string;
}) {
  return (
    <>
      {features.map((feature, index) => (
        <span key={`${feature}-${index}`}>
          <span className={cn("font-medium", className)}>{feature}</span>
          {index < features.length - 1 ? ", " : null}
        </span>
      ))}
    </>
  );
}

/** AI clinical summary panel from backend text (T-515, RF-032, UC-032). */
export function XaiClinicalSummary({
  summary,
  modelVersion,
  shapSectionId = "xai-analysis",
  className,
}: XaiClinicalSummaryProps) {
  const parsed = parseClinicalSummary(summary);

  function handleShapLinkClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    scrollToPageSection(shapSectionId);
    window.history.replaceState(null, "", `#${shapSectionId}`);
  }

  if (parsed.paragraphs.length === 0 && !summary.trim()) {
    return (
      <p className="text-sm text-on-surface-variant">
        No clinical summary was returned for this prediction.
      </p>
    );
  }

  return (
    <section className={cn("flex flex-col", className)} aria-label="AI clinical summary">
      <div className="mb-4 flex items-center justify-between border-b border-outline-variant pb-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-on-surface-variant">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden />
          AI clinical summary
        </h2>
        <span className="font-mono text-xs text-on-surface-variant">Model: {modelVersion}</span>
      </div>

      <div className="flex-1 space-y-4 text-base leading-relaxed text-on-surface">
        {parsed.paragraphs.length > 0 ? (
          parsed.paragraphs.map((paragraph) => {
            if (paragraph.kind === "risk_drivers") {
              return (
                <p key={paragraph.raw}>
                  {paragraph.label}:{" "}
                  <FeatureHighlightList features={paragraph.features} className="text-risk-high-readable" />
                </p>
              );
            }

            if (paragraph.kind === "protective_factors") {
              return (
                <p key={paragraph.raw}>
                  {paragraph.label}:{" "}
                  <FeatureHighlightList features={paragraph.features} className="text-risk-low-readable" />
                </p>
              );
            }

            return <p key={paragraph.raw}>{paragraph.raw}</p>;
          })
        ) : (
          <p>{summary}</p>
        )}
      </div>

      {parsed.disclaimer ? (
        <div className="mt-4 rounded-r-lg border-l-2 border-primary bg-surface-container-low p-4">
          <p className="text-sm font-semibold text-primary">Clinical insight</p>
          <p className="mt-1 text-sm text-on-surface-variant">{parsed.disclaimer}</p>
        </div>
      ) : null}

      <div className="mt-4 flex justify-end pt-2">
        <a
          href={`#${shapSectionId}`}
          onClick={handleShapLinkClick}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          View full SHAP analysis
          <ArrowDown className="h-4 w-4" aria-hidden />
        </a>
      </div>
    </section>
  );
}
