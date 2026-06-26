export const PERMISSION_MODULES = [
  "dashboard",
  "evaluation",
  "simulation",
  "history",
  "analytics",
  "settings",
] as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[number];

export type RolePermissions = Record<PermissionModule, boolean>;

export const PERMISSION_LABELS: Record<PermissionModule, string> = {
  dashboard: "Dashboard",
  evaluation: "Clinical evaluation",
  simulation: "Clinical simulation",
  history: "Prediction history",
  analytics: "Analytics",
  settings: "System settings",
};

export const DEFAULT_ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  admin: {
    dashboard: true,
    evaluation: true,
    simulation: true,
    history: true,
    analytics: true,
    settings: true,
  },
  clinician: {
    dashboard: true,
    evaluation: true,
    simulation: true,
    history: true,
    analytics: false,
    settings: false,
  },
  analyst: {
    dashboard: true,
    evaluation: false,
    simulation: false,
    history: false,
    analytics: true,
    settings: false,
  },
  nurse: {
    dashboard: true,
    evaluation: false,
    simulation: false,
    history: true,
    analytics: false,
    settings: false,
  },
};
