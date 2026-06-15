import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types/roles";

interface RoleRouteProps {
  allowedRoles: UserRole[];
  children: ReactNode;
}

export function RoleRoute({ allowedRoles, children }: RoleRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!allowedRoles.includes(user.role as UserRole)) {
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{ from: location, requiredRoles: allowedRoles }}
      />
    );
  }

  return children;
}
