import type { SimulateRequest, SimulateResponse } from "@/types/simulation";
import { api } from "./api";

/** Run what-if simulation against a stored prediction (UC-042, RBE-011). */
export async function createSimulation(
  payload: SimulateRequest,
): Promise<SimulateResponse> {
  const { data } = await api.post<SimulateResponse>("/simulate", payload);
  return data;
}
