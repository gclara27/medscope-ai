import type { HistoryPatientSummary, HistoryUserSummary } from "@/types/history";

export function formatHistoryDateTime(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function formatEvaluatorName(user: HistoryUserSummary): string {
  const fullName = `${user.first_name} ${user.last_name}`.trim();
  return fullName || user.email;
}

export function formatPatientSnapshot(patient: HistoryPatientSummary | null): string {
  if (!patient) {
    return "—";
  }

  const parts: string[] = [];
  if (patient.age != null) {
    parts.push(`Age ${patient.age}`);
  }
  if (patient.gender) {
    parts.push(patient.gender);
  }
  if (patient.glucose != null) {
    parts.push(`Glucose ${patient.glucose}`);
  }
  if (patient.hospital_stay_days != null) {
    parts.push(`Stay ${patient.hospital_stay_days}d`);
  }

  return parts.length > 0 ? parts.join(" · ") : "—";
}

export function formatHistoryRangeLabel(offset: number, limit: number, total: number): string {
  if (total === 0) {
    return "No evaluations";
  }

  const start = offset + 1;
  const end = Math.min(offset + limit, total);
  return `Showing ${start}–${end} of ${total}`;
}
