import { Settings, Shield, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PLANNED_MODULES = [
  {
    icon: Users,
    title: "User management",
    description: "Create, deactivate, and assign roles to platform users (RF-071).",
  },
  {
    icon: Shield,
    title: "Role policies",
    description: "Review role capabilities and access boundaries across clinical modules.",
  },
  {
    icon: Settings,
    title: "System configuration",
    description: "Platform defaults, model metadata, and operational settings (UC-071).",
  },
] as const;

/** Admin settings placeholder — full configuration ships post-MVP (T-610, RF-012). */
export function SettingsPage() {
  return (
    <div className="space-y-8 p-4 md:p-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-wide text-primary">
          Platform administration
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-on-surface md:text-3xl">
          System Settings
        </h1>
        <p className="mt-2 max-w-2xl text-on-surface-variant">
          Manage users, roles, and platform configuration. This area is reserved for
          post-MVP administration workflows (RF-012, UC-071).
        </p>
      </header>

      <Card className="border-dashed">
        <CardHeader className="border-b border-outline-variant">
          <CardTitle className="text-base">Coming in a later sprint</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6 text-sm text-on-surface-variant">
          <p>
            The sidebar link is available for administrators so navigation matches the MVP
            product map. Configuration screens will be implemented when user and role
            management APIs are delivered.
          </p>
          <ul className="grid gap-4 sm:grid-cols-3">
            {PLANNED_MODULES.map((module) => (
              <li
                key={module.title}
                className="rounded-lg border border-outline-variant bg-surface-container-low p-4"
              >
                <module.icon className="mb-2 h-5 w-5 text-primary" aria-hidden />
                <p className="font-medium text-on-surface">{module.title}</p>
                <p className="mt-1 text-xs leading-relaxed">{module.description}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
