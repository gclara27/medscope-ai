import { Link, useLocation } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

export function UnauthorizedPage() {
  const { user } = useAuth();
  const location = useLocation();
  const fromPath =
    (location.state as { from?: { pathname: string } } | null)?.from
      ?.pathname ?? "/dashboard";

  return (
    <div className="flex min-h-full items-center justify-center p-8">
      <div className="max-w-lg rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-level-1">
        <p className="text-sm font-semibold uppercase tracking-wide text-error">
          Access denied
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-on-surface">
          Insufficient permissions
        </h1>
        <p className="mt-3 text-sm text-on-surface-variant">
          Your role{" "}
          <span className="font-medium capitalize text-on-surface">
            {user?.role}
          </span>{" "}
          cannot access{" "}
          <span className="font-medium text-on-surface">{fromPath}</span>.
          Contact an administrator if you believe this is an error.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary-container"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
