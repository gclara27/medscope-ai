import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  FlaskConical,
  History,
  LayoutDashboard,
  LifeBuoy,
  Settings,
  Stethoscope,
} from "lucide-react";

import type { User } from "@/types/auth";
import type { PermissionModule } from "@/types/permissions";
import { DEFAULT_ROLE_PERMISSIONS } from "@/types/permissions";
import type { UserRole } from "@/types/roles";
import { resolveUserPermissions } from "@/utils/permissions";

export interface AppNavItem {
  label: string;
  to: string;
  permission: PermissionModule;
  icon: LucideIcon;
}

export interface AppFooterNavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

/** Support center — visible to every authenticated user (T-X05-06, RF-012). */
export const SUPPORT_NAV_ITEM: AppFooterNavItem = {
  label: "Support",
  to: "/support",
  icon: LifeBuoy,
};

export const APP_NAV_ITEMS: AppNavItem[] = [
  {
    label: "Dashboard",
    to: "/dashboard",
    permission: "dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Evaluation",
    to: "/evaluation",
    permission: "evaluation",
    icon: Stethoscope,
  },
  {
    label: "Simulation",
    to: "/simulation",
    permission: "simulation",
    icon: FlaskConical,
  },
  {
    label: "History",
    to: "/history",
    permission: "history",
    icon: History,
  },
  {
    label: "Analytics",
    to: "/analytics",
    permission: "analytics",
    icon: BarChart3,
  },
  {
    label: "Settings",
    to: "/settings",
    permission: "settings",
    icon: Settings,
  },
];

export function getNavItemsForUser(user: Pick<User, "role" | "permissions"> | null): AppNavItem[] {
  if (!user) {
    return [];
  }

  const permissions = resolveUserPermissions(user);
  const items = APP_NAV_ITEMS.filter((item) => permissions[item.permission]);

  const settingsItem = APP_NAV_ITEMS.find((item) => item.to === "/settings");
  const hasSettings = items.some((item) => item.to === "/settings");

  if (settingsItem && !hasSettings) {
    items.push(settingsItem);
  }

  return items;
}

export function getNavItemsForRole(role: string): AppNavItem[] {
  const permissions = DEFAULT_ROLE_PERMISSIONS[role as UserRole];
  if (!permissions) {
    return [];
  }
  return getNavItemsForUser({ role: role as UserRole, permissions });
}

export function getRouteIcon(path: string): LucideIcon | undefined {
  if (path === "/support" || path.startsWith("/support/")) {
    return LifeBuoy;
  }

  const item = APP_NAV_ITEMS.find(
    (nav) => path === nav.to || path.startsWith(`${nav.to}/`),
  );
  return item?.icon;
}

export function canAccessRoute(
  user: Pick<User, "role" | "permissions"> | null,
  path: string,
): boolean {
  if (path === "/settings" || path.startsWith("/settings/")) {
    return Boolean(user);
  }

  const item = APP_NAV_ITEMS.find(
    (nav) => path === nav.to || path.startsWith(`${nav.to}/`),
  );
  if (!item) {
    return true;
  }
  return resolveUserPermissions(user)[item.permission];
}
