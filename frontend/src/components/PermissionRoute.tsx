import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

import { useAuth } from "@/context/useAuth";
import type { PermissionModule } from "@/types/permissions";
import { canAccessModule } from "@/utils/permissions";

interface PermissionRouteProps {
  module: PermissionModule;
  children: ReactNode;
}

export function PermissionRoute({ module, children }: PermissionRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!canAccessModule(user, module)) {
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{ from: location, requiredModule: module }}
      />
    );
  }

  return children;
}
