import axios from "axios";

import type { PredictRequest, PredictResponse } from "@/types/prediction";
import type { SimulateModifications, SimulateResponse } from "@/types/simulation";
import { resolveApiBaseUrl } from "@/utils/apiBaseUrl";

const baseURL = resolveApiBaseUrl();

/** Anonymous HTTP client for public demo routes (no inherited JWT). */
const demoApi = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

/** Run ephemeral demo prediction (no auth, no persistence). */
export async function createDemoPrediction(
  payload: PredictRequest,
): Promise<PredictResponse> {
  const { data } = await demoApi.post<PredictResponse>("/demo/predict", payload);
  return data;
}

export interface DemoSimulateRequest {
  baseline: PredictRequest;
  modifications: SimulateModifications;
}

/** Run ephemeral demo simulation (no auth, no persistence). */
export async function createDemoSimulation(
  payload: DemoSimulateRequest,
): Promise<SimulateResponse> {
  const { data } = await demoApi.post<SimulateResponse>("/demo/simulate", payload);
  return data;
}
