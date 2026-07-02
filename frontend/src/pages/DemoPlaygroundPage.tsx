import {
  AlertTriangle,
  ArrowRight,
  FlaskConical,
  LogIn,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Alert } from "@/components/Alert";
import { RiskGaugeChart } from "@/components/charts/RiskGaugeChart";
import { ShapExplanationChart } from "@/components/charts/ShapExplanationChart";
import { SimulationComparisonPanel } from "@/components/clinical/SimulationComparisonPanel";
import { RiskIndicator } from "@/components/clinical/RiskIndicator";
import { XaiClinicalSummary } from "@/components/clinical/XaiClinicalSummary";
import { DemoGuidePanel } from "@/components/demo/DemoGuidePanel";
import { DemoPlaygroundShell } from "@/components/demo/DemoPlaygroundShell";
import { DemoStepProgress } from "@/components/demo/DemoStepProgress";
import { DemoTourLayout } from "@/components/demo/DemoTourLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  buildScenarioPredictRequest,
  getClinicalDemoScenario,
} from "@/lib/clinicalDemoScenarios";
import {
  DEMO_SIMULATION_TARGETS,
  DEMO_TOUR_STEP_ORDER,
  getDemoTourStep,
  getFurthestReachableDemoStep,
  isDemoTourStepReachable,
  parseDemoTourStepId,
  type DemoTourStepId,
} from "@/lib/demoTour";
import { RISK_BADGE_CLASSES, RISK_BADGE_LABELS } from "@/lib/riskDisplay";
import {
  buildSimulationModifications,
  hasSimulationModifications,
  predictRequestToSimulationValues,
} from "@/lib/simulationForm";
import { createDemoPrediction, createDemoSimulation } from "@/services/demo";
import type { PredictRequest, PredictResponse } from "@/types/prediction";
import type { SimulateResponse, SimulationFormValues } from "@/types/simulation";
import { getPredictionErrorMessage } from "@/utils/predictionErrors";
import { getSimulationErrorMessage } from "@/utils/simulationErrors";
import { scrollToPageSection } from "@/utils/scrollToSection";
import { cn } from "@/lib/utils";

const SHOWCASE_SCENARIO = getClinicalDemoScenario("simulation-showcase");
const DEMO_SIMULATION_SECTION_ID = "demo-simulation";

function DemoPatientCaseCard() {
  if (!SHOWCASE_SCENARIO) {
    return null;
  }

  return (
    <Card className="overflow-hidden border-outline-variant shadow-level-2">
      <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-risk-high/30 bg-risk-high/10 px-3 py-1 text-xs font-semibold text-risk-high">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
            {RISK_BADGE_LABELS[SHOWCASE_SCENARIO.expectedRisk]} · Expected band
          </div>
          <div>
            <h3 className="text-xl font-semibold text-on-surface">{SHOWCASE_SCENARIO.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              {SHOWCASE_SCENARIO.vignette}
            </p>
          </div>
          <p className="text-xs text-on-surface-variant">
            De-identified synthetic case for demonstration only. Not real patient data.
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 rounded-xl border border-outline-variant bg-surface-container-low p-4 text-sm">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
              Age
            </dt>
            <dd className="mt-1 font-semibold text-on-surface">
              {SHOWCASE_SCENARIO.formValues.age}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
              Sex
            </dt>
            <dd className="mt-1 font-semibold text-on-surface">
              {SHOWCASE_SCENARIO.formValues.gender}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
              Prior admissions
            </dt>
            <dd className="mt-1 font-semibold text-on-surface">
              {SHOWCASE_SCENARIO.formValues.previous_admissions}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
              Glucose
            </dt>
            <dd className="mt-1 font-semibold text-on-surface">
              {SHOWCASE_SCENARIO.formValues.glucose} mg/dL
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
              Medications
            </dt>
            <dd className="mt-1 font-semibold text-on-surface">
              {SHOWCASE_SCENARIO.formValues.medications_count}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
              Stay (days)
            </dt>
            <dd className="mt-1 font-semibold text-on-surface">
              {SHOWCASE_SCENARIO.formValues.hospital_stay_days}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

function DemoInterventionTargets() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-lg border border-primary/25 bg-primary/5 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">Intervention A</p>
        <p className="mt-1 text-sm text-on-surface">Previous admissions</p>
        <p className="mt-2 font-mono text-2xl font-semibold text-on-surface">
          5 → {DEMO_SIMULATION_TARGETS.previous_admissions}
        </p>
      </div>
      <div className="rounded-lg border border-primary/25 bg-primary/5 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">Intervention B</p>
        <p className="mt-1 text-sm text-on-surface">Blood glucose</p>
        <p className="mt-2 font-mono text-2xl font-semibold text-on-surface">
          198 → {DEMO_SIMULATION_TARGETS.glucose} mg/dL
        </p>
      </div>
    </div>
  );
}

/** Public guided demo — predict, SHAP, and simulation without sign-in (RFW-splash). */
export function DemoPlaygroundPage() {
  const navigate = useNavigate();
  const { stepId: stepParam } = useParams<{ stepId?: string }>();
  const [baselineRequest, setBaselineRequest] = useState<PredictRequest | null>(null);
  const [prediction, setPrediction] = useState<PredictResponse | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulateResponse | null>(null);
  const [predictError, setPredictError] = useState<string | null>(null);
  const [simulateError, setSimulateError] = useState<string | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationAnimationKey, setSimulationAnimationKey] = useState("demo-sim-initial");
  const autoSimulateRequestedRef = useRef(false);

  const stepId = useMemo(
    () => parseDemoTourStepId(stepParam ?? null) ?? "welcome",
    [stepParam],
  );

  const progressFlags = useMemo(
    () => ({
      caseLoaded: baselineRequest !== null,
      predictionReady: prediction !== null,
      simulationReady: simulationResult !== null,
    }),
    [baselineRequest, prediction, simulationResult],
  );

  const currentStep = getDemoTourStep(stepId);
  const { caseLoaded, predictionReady, simulationReady } = progressFlags;

  const baselineSimValues = useMemo(
    () => (baselineRequest ? predictRequestToSimulationValues(baselineRequest) : null),
    [baselineRequest],
  );

  const interventionValues = useMemo<SimulationFormValues | null>(() => {
    if (!baselineSimValues) {
      return null;
    }
    return {
      ...baselineSimValues,
      previous_admissions: DEMO_SIMULATION_TARGETS.previous_admissions,
      glucose: DEMO_SIMULATION_TARGETS.glucose,
    };
  }, [baselineSimValues]);

  useEffect(() => {
    if (stepId !== "case" || baselineRequest || !SHOWCASE_SCENARIO) {
      return;
    }
    setBaselineRequest(buildScenarioPredictRequest(SHOWCASE_SCENARIO));
  }, [stepId, baselineRequest]);

  const goToStep = useCallback(
    (nextId: DemoTourStepId) => {
      if (nextId === "welcome") {
        navigate("/demo");
        return;
      }
      navigate(`/demo/${nextId}`);
    },
    [navigate],
  );

  useEffect(() => {
    if (stepId === "welcome") {
      return;
    }
    if (isDemoTourStepReachable(stepId, progressFlags)) {
      return;
    }

    const fallback = getFurthestReachableDemoStep(progressFlags);
    if (fallback === "case" && !progressFlags.caseLoaded) {
      navigate("/demo", { replace: true });
      return;
    }
    navigate(`/demo/${fallback}`, { replace: true });
  }, [stepId, progressFlags, navigate]);

  const runSimulation = useCallback(async () => {
    if (!baselineRequest || !interventionValues) {
      return false;
    }

    const modifications = buildSimulationModifications(baselineRequest, interventionValues);
    if (!hasSimulationModifications(modifications)) {
      setSimulateError(
        "Intervention values match the baseline. Reload the demo case and try again.",
      );
      return false;
    }

    setSimulateError(null);
    setIsSimulating(true);
    try {
      const result = await createDemoSimulation({ baseline: baselineRequest, modifications });
      setSimulationResult(result);
      setSimulationAnimationKey(`demo-sim-${result.id}`);
      return true;
    } catch (error) {
      setSimulateError(getSimulationErrorMessage(error));
      return false;
    } finally {
      setIsSimulating(false);
    }
  }, [baselineRequest, interventionValues]);

  useEffect(() => {
    if (stepId !== "simulate" || !prediction || autoSimulateRequestedRef.current) {
      return;
    }
    autoSimulateRequestedRef.current = true;
    void runSimulation();
  }, [stepId, prediction, runSimulation]);

  useEffect(() => {
    if (stepId !== "simulate") {
      return undefined;
    }

    const scrollTimer = window.setTimeout(() => {
      scrollToPageSection(DEMO_SIMULATION_SECTION_ID);
    }, 150);

    return () => window.clearTimeout(scrollTimer);
  }, [stepId, simulationResult, isSimulating]);

  async function handlePredict() {
    if (!baselineRequest) {
      return;
    }

    setPredictError(null);
    setIsPredicting(true);
    try {
      const result = await createDemoPrediction(baselineRequest);
      setPrediction(result);
      setSimulationResult(null);
      autoSimulateRequestedRef.current = false;
      setSimulationAnimationKey("demo-sim-initial");
      goToStep("explain");
    } catch (error) {
      setPredictError(getPredictionErrorMessage(error));
    } finally {
      setIsPredicting(false);
    }
  }

  async function handleSimulate() {
    await runSimulation();
  }

  function restartDemo() {
    setBaselineRequest(null);
    setPrediction(null);
    setSimulationResult(null);
    setPredictError(null);
    setSimulateError(null);
    setSimulationAnimationKey("demo-sim-initial");
    autoSimulateRequestedRef.current = false;
    navigate("/demo", { replace: true });
  }

  const showStepper = stepId !== "welcome";

  const tourGuidePanel =
    stepId === "complete" ? (
      <DemoGuidePanel
        title={currentStep.guideTitle}
        body={currentStep.guideBody}
        showContinueIcon={false}
        secondaryActionLabel="Restart demo"
        onSecondaryAction={restartDemo}
      >
        <Button asChild size="lg" className="w-full">
          <Link to="/login" className="flex w-full items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2">
              <LogIn className="h-4 w-4" aria-hidden />
              Sign in to MedScope AI
            </span>
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
          </Link>
        </Button>
      </DemoGuidePanel>
    ) : (
      <DemoGuidePanel
        title={currentStep.guideTitle}
        body={currentStep.guideBody}
        actionLabel={
          stepId === "case"
            ? currentStep.primaryAction
            : stepId === "predict"
              ? currentStep.primaryAction
              : stepId === "explain"
                ? currentStep.primaryAction
                : stepId === "simulate"
                  ? simulationResult
                    ? "Finish demo"
                    : currentStep.primaryAction
                  : undefined
        }
        onAction={
          stepId === "case"
            ? () => goToStep("predict")
            : stepId === "predict"
              ? () => void handlePredict()
              : stepId === "explain"
                ? () => goToStep("simulate")
                : stepId === "simulate"
                  ? simulationResult
                    ? () => goToStep("complete")
                    : () => void handleSimulate()
                  : undefined
        }
        actionDisabled={
          (stepId === "case" && !caseLoaded) ||
          (stepId === "predict" && !caseLoaded) ||
          (stepId === "simulate" && !predictionReady)
        }
        actionLoading={
          stepId === "predict" ? isPredicting : stepId === "simulate" ? isSimulating : false
        }
      />
    );

  return (
    <DemoPlaygroundShell
      stepper={
        showStepper ? (
          <DemoStepProgress
            currentStepId={stepId}
            caseLoaded={caseLoaded}
            predictionReady={predictionReady}
            simulationReady={simulationReady}
            onStepSelect={goToStep}
          />
        ) : undefined
      }
    >
      <div className="space-y-8">
        {stepId === "welcome" ? (
          <section className="grid items-center gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                Explore demo
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
                Try predictive intelligence — no sign-in required
              </h1>
              <p className="text-base leading-relaxed text-on-surface-variant">
                Walk through a high-impact clinical workflow: AI readmission risk, transparent SHAP
                explanations, and real-time what-if simulation. All data is synthetic and nothing is
                saved.
              </p>
              <ul className="space-y-3 text-sm text-on-surface-variant">
                <li className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  Live model inference on de-identified demo patients
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  Step-by-step guidance — perfect for a first impression
                </li>
                <li className="flex items-start gap-2">
                  <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  See how interventions change estimated risk instantly
                </li>
              </ul>
              <Button type="button" size="lg" className="gap-2" onClick={() => goToStep("case")}>
                {currentStep.primaryAction}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>

            <Card className="border-primary/25 bg-surface shadow-level-1">
              <CardContent className="p-8">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                  Demo workflow
                </p>
                <ol className="mt-6 space-y-4">
                  {DEMO_TOUR_STEP_ORDER.filter((id) => id !== "welcome" && id !== "complete").map(
                    (id, index) => {
                      const step = getDemoTourStep(id);
                      const StepIcon = step.icon;
                      return (
                        <li key={id} className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/5 text-sm font-semibold text-primary">
                            {index + 1}
                          </span>
                          <StepIcon className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                          <span className="font-medium text-primary">{step.label}</span>
                        </li>
                      );
                    },
                  )}
                </ol>
              </CardContent>
            </Card>
          </section>
        ) : (
          <DemoTourLayout guide={tourGuidePanel}>
            {predictError ? <Alert variant="error">{predictError}</Alert> : null}
            {simulateError ? <Alert variant="error">{simulateError}</Alert> : null}

            {stepId === "case" ? <DemoPatientCaseCard /> : null}

            {stepId === "predict" && baselineRequest ? (
              <Card className="border-outline-variant shadow-level-1">
                <CardContent className="space-y-4 p-6">
                  <p className="text-sm font-medium text-on-surface">Ready to score this patient</p>
                  <p className="text-sm text-on-surface-variant">
                    The model will return a 30-day readmission probability, risk band, and SHAP
                    feature drivers — typically in under one second.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={cn(
                        "rounded-md border px-2.5 py-1 text-xs font-semibold",
                        RISK_BADGE_CLASSES.high,
                      )}
                    >
                      High-risk profile loaded
                    </span>
                    <span className="rounded-md border border-outline-variant bg-surface-container-low px-2.5 py-1 text-xs text-on-surface-variant">
                      No data persisted
                    </span>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {(stepId === "explain" || stepId === "simulate" || stepId === "complete") && prediction ? (
          <div className="grid gap-6 lg:grid-cols-12">
            <Card className="lg:col-span-5">
              <CardContent className="flex flex-col gap-6 p-8">
                <RiskGaugeChart
                  riskPercent={prediction.risk_percent}
                  riskLevel={prediction.risk_level}
                />
                <RiskIndicator riskLevel={prediction.risk_level} />
                {prediction.confidence_score !== null ? (
                  <p className="text-center text-sm text-on-surface-variant">
                    Model confidence: {(prediction.confidence_score * 100).toFixed(1)}%
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <Card className="lg:col-span-7">
              <CardContent className="space-y-6 p-8">
                <XaiClinicalSummary
                  summary={prediction.summary}
                  modelVersion={prediction.model_version}
                />
                <p className="text-xs text-on-surface-variant">
                  Inference: {prediction.prediction_time_ms} ms · Demo mode (ephemeral)
                </p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {(stepId === "explain" || stepId === "simulate" || stepId === "complete") && prediction ? (
          <Card id="xai-analysis" tabIndex={-1} className="scroll-mt-6">
            <CardContent className="p-8">
              <ShapExplanationChart explanations={prediction.shap_explanations} />
            </CardContent>
          </Card>
        ) : null}

        {(stepId === "simulate" || stepId === "complete") && prediction && baselineRequest ? (
          <div
            id={DEMO_SIMULATION_SECTION_ID}
            tabIndex={-1}
            className="scroll-mt-8 space-y-6"
          >
            <DemoInterventionTargets />

            <SimulationComparisonPanel
              originalRisk={{
                risk_percent:
                  simulationResult?.original_risk_percent ?? prediction.risk_percent,
                risk_level: simulationResult?.original_risk_level ?? prediction.risk_level,
              }}
              simulatedRisk={{
                risk_percent:
                  simulationResult?.simulated_risk_percent ?? prediction.risk_percent,
                risk_level: simulationResult?.simulated_risk_level ?? prediction.risk_level,
              }}
              delta={simulationResult?.delta_risk_percent}
              isRecalculating={isSimulating}
              hasSimulationResult={simulationResult !== null}
              simulatedAnimateFromPercent={
                simulationResult
                  ? simulationResult.original_risk_percent
                  : undefined
              }
              simulationAnimationKey={simulationAnimationKey}
            />

            {stepId === "simulate" && !simulationResult ? (
              <div className="flex justify-center">
                <Button
                  type="button"
                  size="lg"
                  className="gap-2"
                  disabled={isSimulating || !predictionReady}
                  onClick={() => void handleSimulate()}
                >
                  {isSimulating ? "Recalculating…" : "Recalculate risk"}
                </Button>
              </div>
            ) : null}

            {simulationResult ? (
              <Card className="border-risk-low/30 bg-risk-low/5">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-on-surface">Simulation insight</p>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                    {simulationResult.simulation_summary}
                  </p>
                </CardContent>
              </Card>
            ) : null}
          </div>
        ) : null}
          </DemoTourLayout>
        )}
      </div>
    </DemoPlaygroundShell>
  );
}
