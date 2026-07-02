import { SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";

import { ClinicalSection } from "@/components/clinical/ClinicalSection";
import { RangeField } from "@/components/clinical/RangeField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { GenderValue } from "@/types/prediction";
import type { SimulationFormValues } from "@/types/simulation";

const GENDER_OPTIONS: { value: GenderValue; label: string }[] = [
  { value: "Female", label: "Female" },
  { value: "Male", label: "Male" },
  { value: "Unknown", label: "Unknown" },
];

const selectClassName = cn(
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground",
  "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
);

interface SimulationControlPanelProps {
  values: SimulationFormValues;
  baselineValues: SimulationFormValues;
  onChange: (values: SimulationFormValues) => void;
  onReset: () => void;
  onRecalculate: () => void;
  isSubmitting: boolean;
  /** Top-impact fields from the latest simulation (RF-043). */
  impactHighlightFields?: string[];
}

function isModified(
  field: keyof SimulationFormValues,
  values: SimulationFormValues,
  baseline: SimulationFormValues,
): boolean {
  return values[field] !== baseline[field];
}

/** Uniform padding on every field; blue overlay on top when modified (no layout shift). */
function SimulationFieldShell({
  modified,
  highImpact,
  label,
  children,
  className,
}: {
  modified: boolean;
  highImpact?: boolean;
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative rounded-lg p-3",
        className,
      )}
    >
      {modified ? (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 rounded-lg",
            highImpact
              ? "bg-primary/10 shadow-[inset_0_0_0_2px_rgb(var(--color-primary)/0.85)]"
              : "bg-primary/[0.04] shadow-[inset_0_0_0_1px_rgb(var(--color-primary)/0.4)]",
          )}
        />
      ) : null}
      {highImpact && label ? (
        <span className="relative mb-2 inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
          Top driver
        </span>
      ) : null}
      <div className="relative">{children}</div>
    </div>
  );
}

/** Sliders and inputs for what-if clinical overrides (T-520, RF-040). */
export function SimulationControlPanel({
  values,
  baselineValues,
  onChange,
  onReset,
  onRecalculate,
  isSubmitting,
  impactHighlightFields = [],
}: SimulationControlPanelProps) {
  const impactHighlights = new Set(impactHighlightFields);

  function updateField<K extends keyof SimulationFormValues>(
    field: K,
    value: SimulationFormValues[K],
  ) {
    onChange({ ...values, [field]: value });
  }

  function fieldShellProps(field: keyof SimulationFormValues, label?: string) {
    const modified = isModified(field, values, baselineValues);
    return {
      modified,
      highImpact: modified && impactHighlights.has(field),
      label,
    };
  }

  return (
    <div className="flex flex-col gap-6">
      <ClinicalSection title="Clinical variables" icon={<SlidersHorizontal className="h-5 w-5" />}>
        <div className="flex flex-col gap-4">
          {impactHighlightFields.length > 0 ? (
            <p className="text-xs leading-relaxed text-on-surface-variant">
              Fields marked <span className="font-semibold text-primary">Top driver</span> contribute
              most to the simulated risk change.
            </p>
          ) : null}
          <div className="flex flex-col gap-5">
          <SimulationFieldShell {...fieldShellProps("age", "Age (years)")}>
            <RangeField
              id="sim-age"
              label="Age (years)"
              min={0}
              max={120}
              value={values.age}
              onChange={(value) => updateField("age", value)}
            />
          </SimulationFieldShell>

          <SimulationFieldShell
            {...fieldShellProps("gender", "Biological sex")}
            className="flex flex-col gap-1.5"
          >
            <Label htmlFor="sim-gender">Biological sex</Label>
            <select
              id="sim-gender"
              className={selectClassName}
              value={values.gender}
              onChange={(event) => updateField("gender", event.target.value as GenderValue)}
            >
              {GENDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </SimulationFieldShell>

          <SimulationFieldShell {...fieldShellProps("glucose", "Blood glucose")}>
            <RangeField
              id="sim-glucose"
              label="Blood glucose"
              min={0}
              max={600}
              unit="mg/dL"
              value={values.glucose}
              onChange={(value) => updateField("glucose", value)}
            />
          </SimulationFieldShell>

          <SimulationFieldShell {...fieldShellProps("blood_pressure", "Systolic BP")}>
            <RangeField
              id="sim-bp"
              label="Systolic blood pressure"
              min={40}
              max={250}
              unit="mmHg"
              value={values.blood_pressure}
              onChange={(value) => updateField("blood_pressure", value)}
            />
          </SimulationFieldShell>

          <SimulationFieldShell {...fieldShellProps("hospital_stay_days", "Hospital stay")}>
            <RangeField
              id="sim-stay"
              label="Hospital stay"
              min={1}
              max={60}
              unit="days"
              value={values.hospital_stay_days}
              onChange={(value) => updateField("hospital_stay_days", value)}
            />
          </SimulationFieldShell>

          <SimulationFieldShell {...fieldShellProps("medications_count", "Medications count")}>
            <RangeField
              id="sim-meds"
              label="Medications count"
              min={0}
              max={50}
              value={values.medications_count}
              onChange={(value) => updateField("medications_count", value)}
            />
          </SimulationFieldShell>

          <SimulationFieldShell {...fieldShellProps("previous_admissions", "Previous admissions")}>
            <RangeField
              id="sim-admissions"
              label="Previous admissions"
              min={0}
              max={30}
              value={values.previous_admissions}
              onChange={(value) => updateField("previous_admissions", value)}
            />
          </SimulationFieldShell>

          <div className="grid gap-4 sm:grid-cols-2">
            <SimulationFieldShell {...fieldShellProps("number_outpatient", "Outpatient visits")}>
              <RangeField
                id="sim-outpatient"
                label="Outpatient visits"
                min={0}
                max={30}
                value={values.number_outpatient}
                onChange={(value) => updateField("number_outpatient", value)}
              />
            </SimulationFieldShell>
            <SimulationFieldShell {...fieldShellProps("number_emergency", "Emergency visits")}>
              <RangeField
                id="sim-emergency"
                label="Emergency visits"
                min={0}
                max={30}
                value={values.number_emergency}
                onChange={(value) => updateField("number_emergency", value)}
              />
            </SimulationFieldShell>
          </div>

          <SimulationFieldShell
            {...fieldShellProps("bmi", "BMI")}
            className="flex flex-col gap-1.5"
          >
            <Label htmlFor="sim-bmi">BMI (optional)</Label>
            <Input
              id="sim-bmi"
              type="number"
              min={10}
              max={80}
              step="0.1"
              value={values.bmi}
              onChange={(event) => updateField("bmi", event.target.value)}
            />
          </SimulationFieldShell>
          </div>
        </div>
      </ClinicalSection>

      <div className="flex flex-col gap-3 border-t border-outline-variant pt-4">
        <Button type="button" variant="outline" onClick={onReset} disabled={isSubmitting}>
          Reset to baseline
        </Button>
        <Button type="button" onClick={onRecalculate} disabled={isSubmitting} className="gap-2">
          {isSubmitting ? "Recalculating…" : "Recalculate risk"}
        </Button>
      </div>
    </div>
  );
}
