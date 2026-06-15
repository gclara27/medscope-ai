import { FormEvent, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { Toast } from "@/components/Toast";
import { useAuth } from "@/context/AuthContext";
import { getAuthErrorMessage } from "@/utils/authErrors";

export function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [logoutToastOpen, setLogoutToastOpen] = useState(false);

  const redirectPath =
    (location.state as { from?: { pathname: string } } | null)?.from
      ?.pathname ?? "/dashboard";

  useEffect(() => {
    const loggedOut = Boolean(
      (location.state as { loggedOut?: boolean } | null)?.loggedOut,
    );

    if (!loggedOut) {
      return;
    }

    setLogoutToastOpen(true);
    navigate("/login", { replace: true, state: {} });
  }, [location.state, navigate]);

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      await login({ email: email.trim(), password });
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }

  return (
    <>
      <Toast
        open={logoutToastOpen}
        message="You have been signed out successfully."
        variant="success"
        duration={3500}
        onClose={() => setLogoutToastOpen(false)}
      />

      <div className="flex min-h-screen items-center justify-center p-4 md:p-10">
        <div className="w-full max-w-[440px] overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-level-1">
          <div className="flex flex-col items-center border-b border-surface-container-highest p-8 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-2xl font-bold text-on-primary">
              M
            </div>
            <h1 className="text-2xl font-semibold text-on-surface">MedScope AI</h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              Secure Clinical Login
            </p>
          </div>

          <form className="flex flex-col gap-4 p-8" onSubmit={handleSubmit}>
            {error ? (
              <div
                className="rounded-lg border border-error bg-error-container px-4 py-3 text-sm text-on-error-container"
                role="alert"
              >
                {error}
              </div>
            ) : null}

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="clinical-input"
                placeholder="your.email@hospital.org"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="clinical-input"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center rounded-lg bg-primary py-3 text-sm font-semibold text-on-primary transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Authenticating…" : "Authenticate"}
            </button>
          </form>

          <div className="border-t border-surface-container-highest bg-surface-container-low px-8 py-4 text-xs text-on-surface-variant">
            Authorized clinical personnel only. Access is logged and monitored.
          </div>
        </div>
      </div>
    </>
  );
}
