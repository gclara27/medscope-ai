import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Alert } from "@/components/Alert";
import { ClinicalDemoScenarioPanel } from "@/components/clinical/ClinicalDemoScenarioPanel";
import { ClinicalEvaluationForm } from "@/components/clinical/ClinicalEvaluationForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { getRouteIcon } from "@/config/navigation";
import { DEFAULT_CLINICAL_FORM_VALUES } from "@/lib/clinicalFormDefaults";
import type { ClinicalDemoScenario, ClinicalDemoScenarioId } from "@/lib/clinicalDemoScenarios";
import { createPrediction } from "@/services/predictions";
import type { PredictRequest } from "@/types/prediction";
import { getPredictionErrorMessage } from "@/utils/predictionErrors";
import { buildSimulationLocationState, saveSimulationContext } from "@/utils/simulationSession";

export function EvaluationPage() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState(DEFAULT_CLINICAL_FORM_VALUES);
  const [selectedScenarioId, setSelectedScenarioId] = useState<ClinicalDemoScenarioId | null>(
    null,
  );

  function handleSelectScenario(scenario: ClinicalDemoScenario) {
    setFormValues(scenario.formValues);
    setSelectedScenarioId(scenario.id);
    setSubmitError(null);
  }

  function handleFormValuesChange(nextValues: typeof formValues) {
    setFormValues(nextValues);
    setSelectedScenarioId(null);
  }

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
    <PageShell>
      <PageHeader
        icon={getRouteIcon("/evaluation")}
        eyebrow="Clinical decision support"
        title="Clinical Evaluation"
        description="Enter de-identified clinical variables to generate an AI readmission risk assessment based on the Diabetes 130-US cohort model."
      />

      {submitError ? <Alert variant="error">{submitError}</Alert> : null}

      <ClinicalDemoScenarioPanel
        className="mb-2"
        selectedScenarioId={selectedScenarioId}
        onSelectScenario={handleSelectScenario}
        disabled={isSubmitting}
      />

      <ClinicalEvaluationForm
        values={formValues}
        onValuesChange={handleFormValuesChange}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </PageShell>
  );
}
