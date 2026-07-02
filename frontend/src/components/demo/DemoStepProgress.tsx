import {
  DEMO_STEP_COMPLETE_ICON,
  DEMO_TOUR_STEPS,
  isDemoTourStepReachable,
  type DemoTourStepId,
  isDemoTourStepComplete,
} from "@/lib/demoTour";
import { cn } from "@/lib/utils";

interface DemoStepProgressProps {
  currentStepId: DemoTourStepId;
  caseLoaded: boolean;
  predictionReady: boolean;
  simulationReady: boolean;
  onStepSelect?: (stepId: DemoTourStepId) => void;
}

/** Horizontal stepper for the guided demo tour. */
export function DemoStepProgress({
  currentStepId,
  caseLoaded,
  predictionReady,
  simulationReady,
  onStepSelect,
}: DemoStepProgressProps) {
  const flags = { caseLoaded, predictionReady, simulationReady };
  const visibleSteps = DEMO_TOUR_STEPS.filter((step) => step.id !== "welcome");

  return (
    <nav aria-label="Demo progress">
      <ol className="flex flex-wrap items-center gap-2 sm:gap-3">
        {visibleSteps.map((step, index) => {
          const isCurrent = step.id === currentStepId;
          const isComplete = isDemoTourStepComplete(step.id, flags);
          const isReachable = isDemoTourStepReachable(step.id, flags);
          const Icon = isComplete && !isCurrent ? DEMO_STEP_COMPLETE_ICON : step.icon;

          const pillClassName = cn(
            "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
            isCurrent && "border-primary bg-primary/10 text-primary shadow-sm",
            isComplete &&
              !isCurrent &&
              "border-risk-low/40 bg-risk-low/10 text-risk-low",
            !isCurrent &&
              !isComplete &&
              isReachable &&
              "border-outline-variant bg-surface text-on-surface-variant",
            !isReachable && "border-outline-variant/70 bg-surface text-on-surface-variant/50",
            isReachable &&
              !isCurrent &&
              "hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
          );

          return (
            <li key={step.id} className="flex items-center gap-2 sm:gap-3">
              {isReachable ? (
                <button
                  type="button"
                  onClick={() => onStepSelect?.(step.id)}
                  disabled={isCurrent}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={
                    isCurrent
                      ? `Current step: ${step.label}`
                      : `Go to ${step.label}`
                  }
                  className={cn(pillClassName, isCurrent ? "cursor-default" : "cursor-pointer")}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{step.shortTitle}</span>
                </button>
              ) : (
                <div
                  className={pillClassName}
                  aria-disabled="true"
                  title="Complete earlier steps to unlock this section"
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{step.shortTitle}</span>
                </div>
              )}
              {index < visibleSteps.length - 1 ? (
                <span className="hidden h-px w-4 bg-outline-variant sm:block" aria-hidden />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
