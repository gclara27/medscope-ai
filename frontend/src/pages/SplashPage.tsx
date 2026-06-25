import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/useAuth";

const SPLASH_AUTO_REDIRECT_MS = 2800;

export function SplashPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  function continueToApp() {
    navigate(isAuthenticated ? "/dashboard" : "/login", { replace: true });
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate(isAuthenticated ? "/dashboard" : "/login", { replace: true });
    }, SPLASH_AUTO_REDIRECT_MS);
    return () => window.clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-surface/90 to-surface backdrop-blur-sm" />

      <main className="relative z-10 flex max-w-3xl flex-col items-center px-4 text-center md:px-10">
        <div
          className="mb-6 flex h-20 w-20 animate-fade-in-up items-center justify-center rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-level-1 md:h-24 md:w-24"
          style={{ animationDelay: "0ms" }}
        >
          <span className="text-3xl font-bold text-primary md:text-4xl">M</span>
        </div>

        <div
          className="mb-10 animate-fade-in-up"
          style={{ animationDelay: "150ms", opacity: 0 }}
        >
          <h1 className="text-3xl font-bold tracking-tight text-primary md:text-5xl">
            MedScope AI
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-lg text-on-surface-variant">
            Precision AI for Clinical Decision Support
          </p>
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: "300ms", opacity: 0 }}>
          <Button size="lg" onClick={continueToApp} className="gap-2">
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}
