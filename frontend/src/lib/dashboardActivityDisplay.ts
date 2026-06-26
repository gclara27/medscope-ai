export function formatEvaluationReference(id: string): string {
  return `EV-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export function formatRelativeEvaluationTime(iso: string, now = Date.now()): string {
  const timestamp = new Date(iso).getTime();
  const diffMs = Math.max(0, now - timestamp);
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) {
    return "Just now";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function formatAlertSummary(summary: string | null, riskPercent: number): string {
  if (summary?.trim()) {
    return summary.trim();
  }
  return `AI readmission risk score ${riskPercent.toFixed(1)}% requires clinical review.`;
}
