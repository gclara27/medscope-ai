import type { PredictRequest, PredictResponse } from "@/types/prediction";
import type {
  SimulateResponse,
  SimulationFormValues,
  SimulationLocationState,
} from "@/types/simulation";

export const SIMULATION_SESSION_KEY = "medscope_simulation_context";
const SIMULATION_FORCE_RESET_KEY = "medscope_simulation_force_reset";

/** Set before navigating via Run simulation so reload does not wipe the draft. */
export function markSimulationForceReset(): void {
  try {
    sessionStorage.setItem(SIMULATION_FORCE_RESET_KEY, "1");
  } catch {
    // ignore
  }
}

/** True only once after an explicit Run simulation navigation (not F5 / history). */
export function consumeSimulationForceReset(): boolean {
  try {
    const shouldReset = sessionStorage.getItem(SIMULATION_FORCE_RESET_KEY) === "1";
    sessionStorage.removeItem(SIMULATION_FORCE_RESET_KEY);
    return shouldReset;
  } catch {
    return false;
  }
}

/** Persisted simulation context + in-progress draft (survives page refresh). */
export interface SimulationSession extends SimulationLocationState {
  draftValues?: SimulationFormValues;
  lastSimResult?: SimulateResponse | null;
}

export function buildSimulationLocationState(
  result: PredictResponse,
  baseline: PredictRequest,
): SimulationLocationState {
  return {
    predictionId: result.id,
    baseline,
    result,
    originalRisk: {
      risk_score: result.risk_score,
      risk_percent: result.risk_percent,
      risk_level: result.risk_level,
    },
  };
}

export function isValidSimulationContext(
  context: Partial<SimulationLocationState> | null | undefined,
): context is SimulationLocationState {
  return Boolean(
    context?.predictionId &&
      context?.baseline &&
      context?.result &&
      context?.originalRisk,
  );
}

export function saveSimulationSession(state: SimulationSession): void {
  try {
    sessionStorage.setItem(SIMULATION_SESSION_KEY, JSON.stringify(state));
  } catch {
    // sessionStorage may be unavailable in private mode — navigation state still works
  }
}

/** Save prediction context without wiping an in-progress draft for the same prediction. */
export function saveSimulationContext(context: SimulationLocationState): void {
  const existing = loadSimulationSession();
  if (existing?.predictionId === context.predictionId && existing.draftValues) {
    saveSimulationSession({
      ...context,
      draftValues: existing.draftValues,
      lastSimResult: existing.lastSimResult ?? null,
    });
    return;
  }
  saveSimulationSession(context);
}

export function shouldRestoreSimulationDraft(
  session: SimulationSession | null,
  predictionId: string | undefined,
  resetDraft: boolean,
): boolean {
  return (
    !resetDraft &&
    predictionId != null &&
    session?.draftValues != null &&
    session.predictionId === predictionId
  );
}

export function loadSimulationSession(): SimulationSession | null {
  try {
    const raw = sessionStorage.getItem(SIMULATION_SESSION_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as SimulationSession;
    if (!isValidSimulationContext(parsed)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearSimulationSession(): void {
  try {
    sessionStorage.removeItem(SIMULATION_SESSION_KEY);
  } catch {
    // ignore
  }
}
