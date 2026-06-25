import { ArrowLeft, FlaskConical } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";

import { RiskGaugeChart } from "@/components/charts/RiskGaugeChart";
import { ShapExplanationChart } from "@/components/charts/ShapExplanationChart";
import { RiskIndicator } from "@/components/clinical/RiskIndicator";
import { XaiClinicalSummary } from "@/components/clinical/XaiClinicalSummary";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { PredictRequest, PredictResponse } from "@/types/prediction";
import {
  buildSimulationLocationState,
  markSimulationForceReset,
  saveSimulationContext,
} from "@/utils/simulationSession";
import { scrollToPageSection } from "@/utils/scrollToSection";

interface PredictionResultLocationState {
  result: PredictResponse;
  baselineRequest: PredictRequest;
}

export function PredictionResultPage() {
  const location = useLocation();
  const state = location.state as PredictionResultLocationState | null;
  const result = state?.result;
  const baselineRequest = state?.baselineRequest;

  const simulationState = useMemo(
    () =>
      result && baselineRequest
        ? buildSimulationLocationState(result, baselineRequest)
        : null,
    [result, baselineRequest],
  );

  useEffect(() => {
    if (simulationState) {
      saveSimulationContext(simulationState);
    }
  }, [simulationState]);

  useEffect(() => {
    if (location.hash === "#xai-analysis") {
      scrollToPageSection("xai-analysis");
    }
  }, [location.hash]);

  if (!result || !baselineRequest || !simulationState) {
    return <Navigate to="/evaluation" replace />;
  }

  return (
    <div className="space-y-8 p-4 md:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            AI readmission assessment
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-on-surface md:text-3xl">
            Prediction Result
          </h1>
          <p className="mt-2 max-w-2xl text-on-surface-variant">
            30-day readmission risk, clinical category, and SHAP factor analysis (RF-023,
            RF-030, UC-023–030).
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:shrink-0">
          <Button asChild className="gap-2">
            <Link
              to="/simulation"
              state={{ ...simulationState, resetDraft: true }}
              onClick={() => markSimulationForceReset()}
            >
              <FlaskConical className="h-4 w-4" aria-hidden />
              Run simulation
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/evaluation">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              New evaluation
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="relative overflow-hidden lg:col-span-5">
          <CardContent className="flex flex-col gap-6 p-8">
            <RiskGaugeChart
              riskPercent={result.risk_percent}
              riskLevel={result.risk_level}
            />

            <RiskIndicator riskLevel={result.risk_level} />

            {result.confidence_score !== null ? (
              <p className="text-center text-sm text-on-surface-variant">
                Model confidence: {(result.confidence_score * 100).toFixed(1)}%
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="lg:col-span-7">
          <CardContent className="space-y-6 p-8">
            <XaiClinicalSummary summary={result.summary} modelVersion={result.model_version} />

            <dl className="grid gap-4 border-t border-outline-variant pt-6 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                  Prediction ID
                </dt>
                <dd className="mt-1 font-mono text-sm text-on-surface">{result.id}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                  Model version
                </dt>
                <dd className="mt-1 text-sm text-on-surface">{result.model_version}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                  Inference time
                </dt>
                <dd className="mt-1 text-sm text-on-surface">
                  {result.prediction_time_ms} ms
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                  Probability score
                </dt>
                <dd className="mt-1 text-sm text-on-surface">
                  {(result.risk_score * 100).toFixed(2)}% ({result.risk_level})
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card id="xai-analysis" tabIndex={-1} className="scroll-mt-6">
        <CardContent className="p-8">
          <ShapExplanationChart explanations={result.shap_explanations} />
        </CardContent>
      </Card>
    </div>
  );
}
