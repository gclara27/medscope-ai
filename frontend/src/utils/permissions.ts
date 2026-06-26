import type { PermissionModule } from "@/types/permissions";
import { DEFAULT_ROLE_PERMISSIONS, PERMISSION_MODULES } from "@/types/permissions";
import type { User } from "@/types/auth";

export function resolveUserPermissions(
  user: Pick<User, "role" | "permissions"> | null,
): Record<PermissionModule, boolean> {
  if (!user) {
    return Object.fromEntries(
      PERMISSION_MODULES.map((module) => [module, false]),
    ) as Record<PermissionModule, boolean>;
  }

  if (user.permissions && PERMISSION_MODULES.every((module) => module in user.permissions!)) {
    return user.permissions as Record<PermissionModule, boolean>;
  }

  return (
    DEFAULT_ROLE_PERMISSIONS[user.role] ??
    Object.fromEntries(PERMISSION_MODULES.map((module) => [module, false]))
  );
}

export function canAccessModule(
  user: Pick<User, "role" | "permissions"> | null,
  module: PermissionModule,
): boolean {
  return resolveUserPermissions(user)[module];
}
