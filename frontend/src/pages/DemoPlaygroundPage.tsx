import { ArrowLeft, FlaskConical } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/** Public demo entry placeholder — full playground wiring comes in a later task. */
export function DemoPlaygroundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <Card className="w-full max-w-lg border-outline-variant shadow-level-2">
        <CardContent className="space-y-5 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FlaskConical className="h-7 w-7" aria-hidden />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-on-surface">Demo playground</h1>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              Interactive demo mode is coming next. You will be able to run predictions,
              explore SHAP explanations, and simulate clinical changes with synthetic data —
              without signing in or saving to the database.
            </p>
          </div>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to splash
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
