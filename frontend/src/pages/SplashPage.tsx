import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { MedScopeAppIcon } from "@/components/brand/MedScopeAppIcon";
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
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center opacity-[0.17] blur-[1px] brightness-[2] saturate-[0.35] contrast-[0.85]"
        style={{ backgroundImage: "url('/splash-corridor.png')" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-surface/94 backdrop-blur-md" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-surface/30 to-transparent" aria-hidden />

      <main className="relative z-10 flex max-w-3xl flex-col items-center px-4 text-center md:px-10">
        <div className="mb-6 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
          <MedScopeAppIcon size="xl" className="shadow-level-1" />
        </div>

        <div
          className="mb-10 animate-fade-in-up"
          style={{ animationDelay: "150ms", opacity: 0 }}
        >
          <h1 className="text-3xl font-bold tracking-tight text-primary md:text-5xl">
            MedScope AI
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-lg text-on-surface-variant">
            Clinical Decision Support
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
