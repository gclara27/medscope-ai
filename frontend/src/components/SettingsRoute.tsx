import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

import { useAuth } from "@/context/useAuth";

interface SettingsRouteProps {
  children: ReactNode;
}

/** Settings for all authenticated users (appearance); admin and analyst ML sections per RBAC. */
export function SettingsRoute({ children }: SettingsRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
