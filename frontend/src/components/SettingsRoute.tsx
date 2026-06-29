import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

import { useAuth } from "@/context/useAuth";
import { canAccessMlComparison } from "@/utils/mlComparisonAccess";
import { canAccessModule } from "@/utils/permissions";

interface SettingsRouteProps {
  children: ReactNode;
}

/** Settings page for admins; analysts may enter for ML comparison only (T-X07-06). */
export function SettingsRoute({ children }: SettingsRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!canAccessModule(user, "settings") && !canAccessMlComparison(user)) {
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{ from: location, requiredModule: "settings" }}
      />
    );
  }

  return children;
}
