import type { UserRole } from "@/types/roles";

export interface AppNavItem {
  label: string;
  to: string;
  roles: UserRole[];
}

export const APP_NAV_ITEMS: AppNavItem[] = [
  {
    label: "Dashboard",
    to: "/dashboard",
    roles: ["admin", "clinician", "analyst", "nurse"],
  },
  {
    label: "Evaluation",
    to: "/evaluation",
    roles: ["admin", "clinician"],
  },
  {
    label: "Simulation",
    to: "/simulation",
    roles: ["admin", "clinician"],
  },
  {
    label: "History",
    to: "/history",
    roles: ["admin", "clinician", "nurse"],
  },
  {
    label: "Analytics",
    to: "/analytics",
    roles: ["admin", "analyst"],
  },
  {
    label: "Settings",
    to: "/settings",
    roles: ["admin"],
  },
];

export function getNavItemsForRole(role: string): AppNavItem[] {
  return APP_NAV_ITEMS.filter((item) => item.roles.includes(role as UserRole));
}

export function canAccessRoute(role: string, path: string): boolean {
  const item = APP_NAV_ITEMS.find((nav) => nav.to === path);
  if (!item) {
    return true;
  }
  return item.roles.includes(role as UserRole);
}
