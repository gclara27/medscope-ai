import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { SimulationComparisonPanel } from "@/components/clinical/SimulationComparisonPanel";
import { SimulationControlPanel } from "@/components/clinical/SimulationControlPanel";
import { SimulationImpactChart } from "@/components/clinical/SimulationImpactChart";
import { Alert } from "@/components/Alert";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { getRouteIcon } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { buildPredictRequest, DEFAULT_CLINICAL_FORM_VALUES } from "@/lib/clinicalFormDefaults";
import {
  buildSimulationModifications,
  hasSimulationModifications,
  predictRequestToSimulationValues,
} from "@/lib/simulationForm";
import {
  computeSimulationImpactRows,
  topImpactFieldKeys,
} from "@/lib/simulationImpact";
import { createSimulation } from "@/services/simulations";
import type {
  SimulateModifications,
  SimulateResponse,
  SimulationFormValues,
  SimulationLocationState,
  SimulationNavigationState,
} from "@/types/simulation";
import { getSimulationErrorMessage } from "@/utils/simulationErrors";
import {
  consumeSimulationForceReset,
  isValidSimulationContext,
  loadSimulationSession,
  saveSimulationSession,
  shouldRestoreSimulationDraft,
  type SimulationSession,
} from "@/utils/simulationSession";

const SIMULATION_DEBOUNCE_MS = 500;

function buildSessionSnapshot(
  context: SimulationLocationState,
  draftValues: SimulationFormValues,
  lastSimResult: SimulateResponse | null,
): SimulationSession {
  return {
    ...context,
    draftValues,
    lastSimResult,
  };
}

function stripNavigationState(
  navState: SimulationNavigationState | null,
): SimulationLocationState | null {
  if (!navState || !isValidSimulationContext(navState)) {
    return null;
  }

  return {
    predictionId: navState.predictionId,
    baseline: navState.baseline,
    result: navState.result,
    originalRisk: navState.originalRisk,
  };
}

function SimulationEmptyState() {
  return (
    <PageShell>
      <PageHeader
        icon={getRouteIcon("/simulation")}
        eyebrow="What-if clinical simulation"
        title="Clinical Simulation"
        description="Complete a clinical evaluation first to load patient variables and run what-if scenarios."
      />

      <Card>
        <CardContent className="space-y-4 p-6">
          <p className="text-on-surface-variant">
            Simulation needs a stored prediction from the evaluation workflow. Submit the
            clinical form, then open simulation from the result screen or return here after
            an evaluation.
          </p>
          <Button asChild>
            <Link to="/evaluation">Go to evaluation</Link>
          </Button>
        </CardContent>
      </Card>
    </PageShell>
  );
}

export function SimulationPage() {
  const location = useLocation();
  const navigationState = location.state as SimulationNavigationState | null;
  const resetDraftFromRouter = navigationState?.resetDraft === true;
  const [applyResetDraft] = useState(
    () => resetDraftFromRouter && consumeSimulationForceReset(),
  );
  const routerContext = useMemo(
    () => stripNavigationState(navigationState),
    [navigationState],
  );
  const sessionState = useMemo(() => loadSimulationSession(), [location.key]);
  const context = useMemo(
    () => routerContext ?? sessionState,
    [routerContext, sessionState],
  );

  const baseline = context?.baseline;
  const predictionId = context?.predictionId;

  const baselineValues = useMemo(
    () => (baseline ? predictRequestToSimulationValues(baseline) : null),
    [baseline],
  );

  const restoreDraft = shouldRestoreSimulationDraft(
    sessionState,
    predictionId,
    applyResetDraft,
  );

  const [values, setValues] = useState<SimulationFormValues>(() => {
    if (!baselineValues) {
      return predictRequestToSimulationValues(buildPredictRequest(DEFAULT_CLINICAL_FORM_VALUES));
    }
    if (restoreDraft && sessionState?.draftValues) {
      return sessionState.draftValues;
    }
    return baselineValues;
  });

  const [simResult, setSimResult] = useState<SimulateResponse | null>(() => {
    if (restoreDraft) {
      return sessionState?.lastSimResult ?? null;
    }
    return null;
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [simulatedAnimateFromPercent, setSimulatedAnimateFromPercent] = useState<
    number | undefined
  >();
  const displayedSimulatedPercentRef = useRef(context?.originalRisk.risk_percent ?? 0);

  const recalcSeq = useRef(0);
  const inFlightRequests = useRef(0);
  const skipInitialRecalc = useRef(
    restoreDraft && sessionState?.lastSimResult != null,
  );
  const skipNextSimulationAnimation = useRef(skipInitialRecalc.current);
  const debouncedValues = useDebouncedValue(values, SIMULATION_DEBOUNCE_MS);

  useEffect(() => {
    if (!isValidSimulationContext(context)) {
      return;
    }
    saveSimulationSession(buildSessionSnapshot(context, values, simResult));
  }, [context, values, simResult]);

  useEffect(() => {
    if (!simResult) {
      setSimulatedAnimateFromPercent(undefined);
      if (context) {
        displayedSimulatedPercentRef.current = context.originalRisk.risk_percent;
      }
      return;
    }

    if (skipNextSimulationAnimation.current) {
      skipNextSimulationAnimation.current = false;
      displayedSimulatedPercentRef.current = simResult.simulated_risk_percent;
      setSimulatedAnimateFromPercent(undefined);
      return;
    }

    const fromPercent = displayedSimulatedPercentRef.current;
    const toPercent = simResult.simulated_risk_percent;
    displayedSimulatedPercentRef.current = toPercent;

    if (Math.abs(fromPercent - toPercent) >= 0.05) {
      setSimulatedAnimateFromPercent(fromPercent);
    } else {
      setSimulatedAnimateFromPercent(undefined);
    }
  }, [simResult, context?.originalRisk.risk_percent]);

  const runSimulation = useCallback(
    async (modifications: SimulateModifications, predictionIdValue: string) => {
      const seq = ++recalcSeq.current;
      inFlightRequests.current += 1;
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const response = await createSimulation({
          prediction_id: predictionIdValue,
          modifications,
        });
        if (seq === recalcSeq.current) {
          setSimResult(response);
        }
      } catch (error) {
        if (seq === recalcSeq.current) {
          setSimResult(null);
          setSubmitError(getSimulationErrorMessage(error));
        }
      } finally {
        inFlightRequests.current = Math.max(0, inFlightRequests.current - 1);
        if (inFlightRequests.current === 0) {
          setIsSubmitting(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (!baseline || !predictionId) {
      return;
    }

    if (skipInitialRecalc.current) {
      skipInitialRecalc.current = false;
      return;
    }

    const modifications = buildSimulationModifications(baseline, debouncedValues);

    if (!hasSimulationModifications(modifications)) {
      recalcSeq.current += 1;
      setSimResult(null);
      setSubmitError(null);
      if (inFlightRequests.current === 0) {
        setIsSubmitting(false);
      }
      return;
    }

    void runSimulation(modifications, predictionId);
  }, [baseline, debouncedValues, predictionId, runSimulation]);

  const impactRows = useMemo(() => {
    if (!simResult || simResult.changes.length === 0) {
      return [];
    }

    return computeSimulationImpactRows(
      simResult.changes,
      simResult.delta_risk_percent,
      context?.result.shap_explanations ?? [],
    );
  }, [simResult, context?.result.shap_explanations]);

  const impactHighlightFields = useMemo(
    () => topImpactFieldKeys(impactRows),
    [impactRows],
  );

  if (!isValidSimulationContext(context) || !baselineValues) {
    return <SimulationEmptyState />;
  }

  const activeBaseline = context.baseline;
  const activePredictionId = context.predictionId;
  const activeOriginalRisk = context.originalRisk;
  const activeStoredResult = context.result;
  const activeBaselineValues = baselineValues;

  function handleReset() {
    recalcSeq.current += 1;
    inFlightRequests.current = 0;
    setValues(activeBaselineValues);
    setSimResult(null);
    setSubmitError(null);
    setIsSubmitting(false);
    setSimulatedAnimateFromPercent(undefined);
    displayedSimulatedPercentRef.current = activeOriginalRisk.risk_percent;
  }

  function handleRecalculate() {
    const modifications = buildSimulationModifications(activeBaseline, values);

    if (!hasSimulationModifications(modifications)) {
      setSubmitError("Change at least one clinical variable before recalculating.");
      return;
    }

    void runSimulation(modifications, activePredictionId);
  }

  const comparisonOriginal = simResult
    ? {
        risk_percent: simResult.original_risk_percent,
        risk_level: simResult.original_risk_level,
      }
    : activeOriginalRisk;

  const comparisonSimulated = simResult
    ? {
        risk_percent: simResult.simulated_risk_percent,
        risk_level: simResult.simulated_risk_level,
      }
    : {
        risk_percent: activeOriginalRisk.risk_percent,
        risk_level: activeOriginalRisk.risk_level,
      };

  const delta = simResult?.delta_risk_percent;

  return (
    <PageShell>
      <PageHeader
        icon={getRouteIcon("/simulation")}
        eyebrow="What-if clinical simulation"
        title="Clinical Simulation"
        description="Adjust variables from the stored prediction and recalculate readmission risk."
        actions={
          <Button asChild variant="outline" className="gap-2">
            <Link
              to="/evaluation/result"
              state={{ result: activeStoredResult, baselineRequest: activeBaseline }}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to result
            </Link>
          </Button>
        }
      />

      {submitError ? <Alert variant="error">{submitError}</Alert> : null}

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-4">
          <CardContent className="p-6">
            <SimulationControlPanel
              values={values}
              baselineValues={activeBaselineValues}
              onChange={setValues}
              onReset={handleReset}
              onRecalculate={handleRecalculate}
              isSubmitting={isSubmitting}
              impactHighlightFields={impactHighlightFields}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6 lg:col-span-8">
          <SimulationComparisonPanel
            originalRisk={comparisonOriginal}
            simulatedRisk={comparisonSimulated}
            delta={delta}
            isRecalculating={isSubmitting}
            hasSimulationResult={simResult !== null}
            simulatedAnimateFromPercent={simulatedAnimateFromPercent}
            simulationAnimationKey={simResult?.id}
          />

          {simResult ? <SimulationImpactChart rows={impactRows} /> : null}

          {simResult ? (
            <Card>
              <CardContent className="space-y-4 p-6">
                <h2 className="meta-label">Simulation summary</h2>
                <p className="text-on-surface">{simResult.simulation_summary}</p>
                {simResult.changes.length > 0 ? (
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {simResult.changes.map((change) => (
                      <li
                        key={change.feature_name}
                        className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm"
                      >
                        <span className="font-medium text-on-surface">{change.feature_name}</span>
                        <span className="mt-1 block font-data text-xs text-on-surface-variant">
                          {change.original_value ?? "—"} → {change.simulated_value ?? "—"}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </PageShell>
  );
}
