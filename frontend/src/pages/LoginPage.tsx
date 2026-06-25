import { FormEvent, useCallback, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { Alert } from "@/components/Alert";
import { MedScopeAppIcon } from "@/components/brand/MedScopeAppIcon";
import { Spinner } from "@/components/Spinner";
import { Toast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/useAuth";
import { getAuthErrorMessage } from "@/utils/authErrors";

const LOGIN_ERROR_DISMISS_MS = 5000;

export function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [logoutToastOpen, setLogoutToastOpen] = useState(false);

  const redirectPath =
    (location.state as { from?: { pathname: string } } | null)?.from?.pathname ??
    "/dashboard";

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

  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (!error) {
      return;
    }

    const timer = window.setTimeout(dismissError, LOGIN_ERROR_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [error, dismissError]);

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
        <Card className="w-full max-w-[440px] overflow-hidden">
          <div className="flex flex-col items-center border-b border-surface-container-highest p-8 text-center">
            <MedScopeAppIcon size="lg" className="mb-4 shadow-level-1" />
            <h1 className="text-2xl font-semibold text-on-surface">MedScope AI</h1>
            <p className="mt-1 text-sm text-on-surface-variant">Secure Clinical Login</p>
          </div>

          <CardContent className="p-8 pt-6">
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {error ? <Alert variant="error">{error}</Alert> : null}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="your.email@hospital.org"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onFocus={dismissError}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onFocus={dismissError}
                />
              </div>

              <Button type="submit" disabled={isLoading} className="mt-2 w-full">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" label="Authenticating" />
                    Authenticating…
                  </span>
                ) : (
                  "Authenticate"
                )}
              </Button>
            </form>
          </CardContent>

          <div className="border-t border-surface-container-highest bg-surface-container-low px-8 py-4 text-xs text-on-surface-variant">
            Authorized clinical personnel only. Access is logged and monitored.
          </div>
        </Card>
      </div>
    </>
  );
}
