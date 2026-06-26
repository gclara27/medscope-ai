import { api } from "@/services/api";
import type {
  RolePolicy,
  RolePolicyListResponse,
  SystemSettings,
  UpdateRolePolicyPayload,
  UpdateSystemSettingsPayload,
} from "@/types/adminSettings";

export async function listRolePolicies(): Promise<RolePolicyListResponse> {
  const { data } = await api.get<RolePolicyListResponse>("/admin/roles");
  return {
    items: Array.isArray(data?.items) ? data.items : [],
    modules: Array.isArray(data?.modules) ? data.modules : [],
  };
}

export async function updateRolePolicy(
  roleId: string,
  payload: UpdateRolePolicyPayload,
): Promise<RolePolicy> {
  const { data } = await api.patch<RolePolicy>(`/admin/roles/${roleId}`, payload);
  return data;
}

export async function getSystemSettings(): Promise<SystemSettings> {
  const { data } = await api.get<SystemSettings>("/admin/settings");
  return data;
}

export async function updateSystemSettings(
  payload: UpdateSystemSettingsPayload,
): Promise<SystemSettings> {
  const { data } = await api.patch<SystemSettings>("/admin/settings", payload);
  return data;
}
