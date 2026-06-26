import type { DashboardResponse } from "@/types/dashboard";
import { api } from "./api";

/** Fetch clinical dashboard KPIs (UC-010, RF-010–011). */
export async function getDashboard(): Promise<DashboardResponse> {
  const { data } = await api.get<DashboardResponse>("/dashboard");
  return data;
}
