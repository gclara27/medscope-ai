import { resolveApiErrorMessage } from "@/utils/apiErrors";

export function getSimulationErrorMessage(error: unknown): string {
  return resolveApiErrorMessage(error, {
    fallback: "Unable to run simulation. Please try again.",
    forbidden: "You do not have permission to run simulations.",
    notFound: "The selected prediction was not found.",
    serverError: "Simulation failed due to a server error. Please try again.",
    unavailable: "The simulation service is temporarily unavailable.",
  });
}
