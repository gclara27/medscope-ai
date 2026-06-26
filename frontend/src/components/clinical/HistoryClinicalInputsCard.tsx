import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HistoryPatientDetail } from "@/types/history";

interface HistoryClinicalInputsCardProps {
  patientInput: HistoryPatientDetail;
}

function formatValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  return String(value);
}

/** Persisted clinical inputs for a historical evaluation (RF-052). */
export function HistoryClinicalInputsCard({ patientInput }: HistoryClinicalInputsCardProps) {
  const fields: Array<{ label: string; value: string }> = [
    { label: "Age (years)", value: formatValue(patientInput.age) },
    { label: "Gender", value: formatValue(patientInput.gender) },
    { label: "BMI", value: formatValue(patientInput.bmi) },
    { label: "Blood pressure (mmHg)", value: formatValue(patientInput.blood_pressure) },
    { label: "Blood glucose (mg/dL)", value: formatValue(patientInput.glucose) },
    { label: "Hospital stay (days)", value: formatValue(patientInput.hospital_stay_days) },
    { label: "Distinct medications", value: formatValue(patientInput.medications_count) },
    { label: "Previous admissions", value: formatValue(patientInput.previous_admissions) },
  ];

  return (
    <Card>
      <CardHeader className="border-b border-outline-variant">
        <CardTitle className="text-base">Clinical inputs</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.label}>
              <dt className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                {field.label}
              </dt>
              <dd className="mt-1 text-sm text-on-surface">{field.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
