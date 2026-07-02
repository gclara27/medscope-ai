import { useId, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CLINICAL_DEMO_SCENARIOS,
  getClinicalDemoScenario,
  type ClinicalDemoScenario,
  type ClinicalDemoScenarioId,
} from "@/lib/clinicalDemoScenarios";
import { RISK_BADGE_CLASSES, RISK_BADGE_LABELS } from "@/lib/riskDisplay";
import { cn } from "@/lib/utils";

const SCENARIO_ICONS: Record<ClinicalDemoScenarioId, LucideIcon> = {
  "high-readmission": AlertTriangle,
  "moderate-risk": Activity,
  "low-risk-stable": ShieldCheck,
  "simulation-showcase": FlaskConical,
};

export interface ClinicalDemoScenarioPanelProps {
  selectedScenarioId?: ClinicalDemoScenarioId | null;
  onSelectScenario: (scenario: ClinicalDemoScenario) => void;
  disabled?: boolean;
  className?: string;
  /** When false (default), scenario cards start collapsed to reduce visual clutter. */
  defaultExpanded?: boolean;
}

interface ClinicalDemoScenarioCardProps {
  scenario: ClinicalDemoScenario;
  selected: boolean;
  disabled: boolean;
  onSelect: (scenario: ClinicalDemoScenario) => void;
}

function ClinicalDemoScenarioCard({
  scenario,
  selected,
  disabled,
  onSelect,
}: ClinicalDemoScenarioCardProps) {
  const Icon = SCENARIO_ICONS[scenario.id];

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`Load demo scenario: ${scenario.title}`}
      onClick={() => onSelect(scenario)}
      className={cn(
        "group w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-5 text-left shadow-level-1 transition-colors",
        "hover:border-primary/30 hover:bg-surface-container-low",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-60",
        selected && "border-primary/50 bg-primary/5 ring-1 ring-primary/20",
      )}
    >
      <div className="flex min-h-10 items-center justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-low text-primary transition-colors group-hover:bg-primary-fixed">
          <Icon className="h-5 w-5 shrink-0" aria-hidden />
        </div>
        <span
          className={cn(
            "inline-flex h-6 shrink-0 items-center justify-center rounded-md px-2 text-[10px] font-semibold uppercase leading-none tracking-wide",
            RISK_BADGE_CLASSES[scenario.expectedRisk],
          )}
        >
          {RISK_BADGE_LABELS[scenario.expectedRisk]}
        </span>
      </div>

      <h3 className="mt-4 text-base font-semibold text-on-surface">{scenario.title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{scenario.vignette}</p>

      {scenario.simulationHint ? (
        <p className="mt-3 border-t border-outline-variant pt-3 text-xs text-on-surface-variant">
          <span className="font-medium text-primary">Demo tip:</span> {scenario.simulationHint}
        </p>
      ) : null}
    </button>
  );
}

/** Demo scenario picker for Evaluation (T-907-02, RF-020, RUX-001). */
export function ClinicalDemoScenarioPanel({
  selectedScenarioId = null,
  onSelectScenario,
  disabled = false,
  className,
  defaultExpanded = false,
}: ClinicalDemoScenarioPanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const contentId = useId();
  const selectedScenario = selectedScenarioId
    ? getClinicalDemoScenario(selectedScenarioId)
    : undefined;

  return (
    <Card className={cn("border-outline-variant", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base font-semibold uppercase tracking-wide text-on-surface-variant">
              Demo clinical scenarios
            </CardTitle>
            <CardDescription className="text-sm text-on-surface-variant">
              De-identified synthetic cases for training and demonstration.
            </CardDescription>
            {!expanded && selectedScenario ? (
              <p className="mt-2 text-xs text-on-surface-variant">
                Active scenario:{" "}
                <span className="font-medium text-on-surface">{selectedScenario.title}</span>
              </p>
            ) : null}
          </div>
          <button
            type="button"
            disabled={disabled}
            aria-expanded={expanded}
            aria-controls={contentId}
            aria-label={
              expanded ? "Hide demo clinical scenarios" : "Show demo clinical scenarios"
            }
            onClick={() => setExpanded((current) => !current)}
            className={cn(
              "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-outline-variant bg-surface-container-lowest text-on-surface-variant transition-colors",
              "hover:border-primary/30 hover:bg-surface-container-low hover:text-on-surface",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" aria-hidden />
            ) : (
              <ChevronDown className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
      </CardHeader>
      {expanded ? (
        <CardContent id={contentId}>
          <div
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            role="list"
            aria-label="Demo clinical scenarios"
          >
            {CLINICAL_DEMO_SCENARIOS.map((scenario) => (
              <div key={scenario.id} role="listitem">
                <ClinicalDemoScenarioCard
                  scenario={scenario}
                  selected={selectedScenarioId === scenario.id}
                  disabled={disabled}
                  onSelect={onSelectScenario}
                />
              </div>
            ))}
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
}
