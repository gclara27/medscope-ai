import { ArrowLeft, FlaskConical } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Alert } from "@/components/Alert";
import { RiskGaugeChart } from "@/components/charts/RiskGaugeChart";
import { ShapExplanationChart } from "@/components/charts/ShapExplanationChart";
import { HistoryClinicalInputsCard } from "@/components/clinical/HistoryClinicalInputsCard";
import { HistorySimulationsPanel } from "@/components/clinical/HistorySimulationsPanel";
import { RiskIndicator } from "@/components/clinical/RiskIndicator";
import { XaiClinicalSummary } from "@/components/clinical/XaiClinicalSummary";
import { Spinner } from "@/components/Spinner";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { getRouteIcon } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/useAuth";
import {
  historyDetailBaselineRequest,
  historyDetailToPredictResponse,
} from "@/lib/historyDetail";
import { formatEvaluatorName, formatHistoryDateTime } from "@/lib/historyDisplay";
import { getHistoryDetail } from "@/services/history";
import type { HistoryDetailResponse } from "@/types/history";
import { getHistoryErrorMessage } from "@/utils/historyErrors";
import {
  buildSimulationLocationState,
  markSimulationForceReset,
  saveSimulationContext,
} from "@/utils/simulationSession";

export function HistoryDetailPage() {
  const { predictionId } = useParams<{ predictionId: string }>();
  const { user } = useAuth();
  const [detail, setDetail] = useState<HistoryDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canRunSimulation = user?.role === "admin" || user?.role === "clinician";

  const simulationState = useMemo(() => {
    if (!detail) {
      return null;
    }
    return buildSimulationLocationState(
      historyDetailToPredictResponse(detail),
      historyDetailBaselineRequest(detail),
    );
  }, [detail]);

  useEffect(() => {
    if (simulationState) {
      saveSimulationContext(simulationState);
    }
  }, [simulationState]);

  useEffect(() => {
    if (!predictionId) {
      setError("Prediction identifier is missing.");
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    void getHistoryDetail(predictionId)
      .then((response) => {
        if (!cancelled) {
          setDetail(response);
          setError(null);
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setDetail(null);
          setError(getHistoryErrorMessage(loadError));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [predictionId]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner label="Loading historical evaluation" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <PageShell className="space-y-6">
        <Button asChild variant="outline" className="gap-2">
          <Link to="/history">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to history
          </Link>
        </Button>
        <Alert variant="error">{error ?? "Unable to load historical evaluation."}</Alert>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        icon={getRouteIcon("/history")}
        eyebrow="Clinical audit trail"
        title="Historical evaluation detail"
        description="Stored readmission risk, clinical inputs, and SHAP explanation for audit review."
        meta={
          <>
            Evaluated {formatHistoryDateTime(detail.created_at)} by{" "}
            <span className="font-medium text-on-surface">
              {formatEvaluatorName(detail.user)}
            </span>
          </>
        }
        actions={
          <>
            {canRunSimulation && simulationState ? (
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
            ) : null}
            <Button asChild variant="outline" className="gap-2">
              <Link to="/history">
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Back to history
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="relative overflow-hidden lg:col-span-5">
          <CardContent className="flex flex-col gap-6 p-8">
            <RiskGaugeChart riskPercent={detail.risk_percent} riskLevel={detail.risk_level} />
            <RiskIndicator riskLevel={detail.risk_level} />
            {detail.confidence_score !== null ? (
              <p className="text-center text-sm text-on-surface-variant">
                Model confidence: {(detail.confidence_score * 100).toFixed(1)}%
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="lg:col-span-7">
          <CardContent className="space-y-6 p-8">
            <XaiClinicalSummary summary={detail.summary ?? ""} modelVersion={detail.model_version} />
            <dl className="grid gap-4 border-t border-outline-variant pt-6 sm:grid-cols-2">
              <div>
                <dt className="meta-label">Prediction ID</dt>
                <dd className="mt-1 font-data text-sm text-on-surface">{detail.id}</dd>
              </div>
              <div>
                <dt className="meta-label">Model version</dt>
                <dd className="mt-1 text-sm text-on-surface">{detail.model_version}</dd>
              </div>
              <div>
                <dt className="meta-label">Inference time</dt>
                <dd className="mt-1 text-sm text-on-surface">
                  {detail.prediction_time_ms != null ? `${detail.prediction_time_ms} ms` : "—"}
                </dd>
              </div>
              <div>
                <dt className="meta-label">Probability score</dt>
                <dd className="mt-1 text-sm text-on-surface">
                  {(detail.risk_score * 100).toFixed(2)}% ({detail.risk_level})
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {detail.patient_input ? (
        <HistoryClinicalInputsCard patientInput={detail.patient_input} />
      ) : null}

      <Card id="xai-analysis" tabIndex={-1} className="scroll-mt-6">
        <CardContent className="p-8">
          <ShapExplanationChart explanations={detail.shap_explanations} />
        </CardContent>
      </Card>

      <HistorySimulationsPanel simulations={detail.simulations} />
    </PageShell>
  );
}
