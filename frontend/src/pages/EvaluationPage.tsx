import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Alert } from "@/components/Alert";
import { ClinicalEvaluationForm } from "@/components/clinical/ClinicalEvaluationForm";
import { createPrediction } from "@/services/predictions";
import type { PredictRequest } from "@/types/prediction";
import { getPredictionErrorMessage } from "@/utils/predictionErrors";
import { buildSimulationLocationState, saveSimulationContext } from "@/utils/simulationSession";

export function EvaluationPage() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(payload: PredictRequest) {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const result = await createPrediction(payload);
      saveSimulationContext(buildSimulationLocationState(result, payload));
      navigate("/evaluation/result", { state: { result, baselineRequest: payload } });
    } catch (error) {
      setSubmitError(getPredictionErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8 p-4 md:p-8">
      <header>
        <h1 className="text-2xl font-semibold text-on-surface md:text-3xl">
          Clinical Evaluation
        </h1>
        <p className="mt-2 max-w-3xl text-on-surface-variant">
          Enter de-identified clinical variables to generate an AI readmission risk
          assessment. Fields align with the Diabetes 130-US model features (RF-020).
        </p>
      </header>

      {submitError ? <Alert variant="error">{submitError}</Alert> : null}

      <ClinicalEvaluationForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
