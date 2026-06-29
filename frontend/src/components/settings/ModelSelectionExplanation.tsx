import { Lightbulb } from "lucide-react";

import {
  buildProductionModelExplanation,
  type ProductionModelExplanation,
} from "@/lib/mlComparisonDisplay";
import type { ModelComparisonResponse } from "@/types/mlComparison";

interface ModelSelectionExplanationProps {
  comparison: ModelComparisonResponse;
}

/** Plain-language summary of why the production model was selected (RF-076, UC-084). */
export function ModelSelectionExplanation({ comparison }: ModelSelectionExplanationProps) {
  const explanation = buildProductionModelExplanation(comparison);
  if (!explanation) {
    return null;
  }

  return (
    <section
      aria-label="Production model selection rationale"
      className="rounded-xl border border-primary/20 bg-primary/5 p-4"
    >
      <div className="flex items-start gap-3">
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div className="space-y-3 text-sm text-on-surface">
          <h3 className="font-semibold text-on-surface">{explanation.title}</h3>
          <ExplanationBody explanation={explanation} />
        </div>
      </div>
    </section>
  );
}

function ExplanationBody({ explanation }: { explanation: ProductionModelExplanation }) {
  return (
    <>
      <p className="text-on-surface-variant">{explanation.intro}</p>
      <p>{explanation.selectionReason}</p>
      {explanation.comparisons.length > 0 ? (
        <ul className="list-disc space-y-1 pl-5 text-on-surface-variant">
          {explanation.comparisons.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
      {explanation.caveat ? (
        <p className="text-xs text-on-surface-variant">{explanation.caveat}</p>
      ) : null}
    </>
  );
}
