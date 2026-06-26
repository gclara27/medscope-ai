import type { PermissionModule } from "@/types/permissions";

export interface RolePolicy {
  id: string;
  name: string;
  description: string | null;
  permissions: Record<PermissionModule, boolean>;
  is_locked: boolean;
}

export interface RolePolicyListResponse {
  items: RolePolicy[];
  modules: PermissionModule[];
}

export interface ModelMetadata {
  model_id: string | null;
  model_version: string | null;
  production_threshold: number | null;
  ml_ready: boolean;
}

export interface SystemSettings {
  platform_name: string;
  risk_threshold_high: number;
  risk_threshold_medium: number;
  support_contact_email: string;
  model: ModelMetadata;
}

export interface UpdateSystemSettingsPayload {
  platform_name?: string;
  risk_threshold_high?: number;
  risk_threshold_medium?: number;
  support_contact_email?: string;
}

export interface UpdateRolePolicyPayload {
  permissions: Partial<Record<PermissionModule, boolean>>;
}
