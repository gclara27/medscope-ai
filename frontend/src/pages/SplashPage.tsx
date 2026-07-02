import { LogIn, Compass } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { MedScopeAppIcon } from "@/components/brand/MedScopeAppIcon";
import { SplashFeatureCard } from "@/components/splash/SplashFeatureCard";
import { SplashFeatureDialog } from "@/components/splash/SplashFeatureDialog";
import { Button } from "@/components/ui/button";
import { SPLASH_FEATURES, type SplashFeature, type SplashFeatureId } from "@/lib/splashFeatures";
import { cn } from "@/lib/utils";
function SplashFadeIn({
  children,
  className,
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  return (
    <div
      className={cn(
        "animate-fade-in-up opacity-0 motion-reduce:animate-none motion-reduce:opacity-100",
        className,
      )}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}

export function SplashPage() {
  const [selectedFeature, setSelectedFeature] = useState<SplashFeature | null>(null);

  function openFeature(id: SplashFeatureId) {
    const feature = SPLASH_FEATURES.find((item) => item.id === id);
    setSelectedFeature(feature ?? null);
  }

  function closeFeature() {
    setSelectedFeature(null);
  }

  return (    <div className="relative flex min-h-screen flex-col overflow-hidden bg-black text-white">
      <div className="absolute inset-0 z-0" aria-hidden>
        <div
          className="h-full w-full scale-105 bg-cover bg-center"
          style={{ backgroundImage: "url('/splash-hero.png')" }}
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col justify-between px-4 py-8 md:px-10 md:py-10">
        <SplashFadeIn className="flex w-full justify-center">
          <div className="flex items-center gap-3">
            <MedScopeAppIcon
              size="lg"
              className="h-11 w-11 bg-primary/70 shadow-none ring-1 ring-white/20 md:h-12 md:w-12"
            />
            <span className="text-xl font-bold tracking-tight text-white/95 md:text-[1.75rem] md:leading-none">
              MedScope AI
            </span>
          </div>
        </SplashFadeIn>

        <main className="mx-auto flex w-full max-w-4xl flex-col items-center px-2 text-center">
          <SplashFadeIn delayMs={150} className="mb-8 flex max-w-3xl flex-col gap-4 md:mb-10">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-white drop-shadow-md md:text-5xl md:leading-[1.1]">
              Predictive intelligence for critical decisions
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/90 drop-shadow-sm md:text-lg">
              MedScope AI turns clinical data into actionable readmission risk scores,
              explainable AI insights, and what-if simulations — a decision support platform
              built for modern care teams.
            </p>
          </SplashFadeIn>

          <SplashFadeIn
            delayMs={300}
            className="grid w-full max-w-xs grid-cols-1 gap-3 sm:w-auto sm:max-w-none sm:grid-cols-2"
          >
            <Button
              size="lg"
              className="group w-full justify-center gap-2 px-8 shadow-xl transition-transform active:scale-95"
              asChild
            >
              <Link to="/login">
                Sign in
                <LogIn className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full justify-center gap-2 border-white/40 bg-white/10 px-8 text-white backdrop-blur-md hover:bg-white/20 hover:text-white active:scale-95"
              asChild
            >
              <Link to="/demo">
                Explore demo
                <Compass className="h-5 w-5" aria-hidden />
              </Link>
            </Button>
          </SplashFadeIn>

          <p className="mt-4 max-w-lg text-xs text-white/70">
            Demo mode lets you try evaluation, SHAP, and simulation with synthetic data — no login
            or database writes.
          </p>
        </main>

        <SplashFadeIn delayMs={450} className="mx-auto w-full max-w-5xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {SPLASH_FEATURES.map((feature) => (
              <SplashFeatureCard
                key={feature.id}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                onClick={() => openFeature(feature.id)}
              />
            ))}
          </div>
        </SplashFadeIn>
      </div>

      <SplashFeatureDialog
        feature={selectedFeature}
        open={selectedFeature !== null}
        onClose={closeFeature}
      />
    </div>
  );
}