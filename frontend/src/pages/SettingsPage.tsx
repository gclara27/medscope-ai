import { useMemo, useState } from "react";

import { AuditLogsPanel } from "@/components/settings/AuditLogsPanel";
import { ModelComparisonPanel } from "@/components/settings/ModelComparisonPanel";
import { RolePoliciesPanel } from "@/components/settings/RolePoliciesPanel";
import { SystemConfigurationPanel } from "@/components/settings/SystemConfigurationPanel";
import { UserManagementPanel } from "@/components/settings/UserManagementPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { getRouteIcon } from "@/config/navigation";
import { useAuth } from "@/context/useAuth";
import { cn } from "@/lib/utils";
import { canAccessMlComparison } from "@/utils/mlComparisonAccess";
import { canAccessModule } from "@/utils/permissions";

type SettingsSection = "users" | "roles" | "system" | "audit" | "models";

const SETTINGS_SECTIONS: Array<{ id: SettingsSection; label: string }> = [
  { id: "users", label: "User management" },
  { id: "roles", label: "Role policies" },
  { id: "system", label: "System configuration" },
  { id: "audit", label: "Audit" },
  { id: "models", label: "Models" },
];

function getVisibleSections(
  user: ReturnType<typeof useAuth>["user"],
): Array<(typeof SETTINGS_SECTIONS)[number]> {
  const isAdmin = canAccessModule(user, "settings");
  const canViewModels = canAccessMlComparison(user);

  return SETTINGS_SECTIONS.filter((section) => {
    if (section.id === "models") {
      return canViewModels;
    }
    return isAdmin;
  });
}

/** Admin settings — users, role policies, platform configuration, audit, and ML models (T-X01, T-X07). */
export function SettingsPage() {
  const { user } = useAuth();
  const visibleSections = useMemo(() => getVisibleSections(user), [user]);
  const [activeSection, setActiveSection] = useState<SettingsSection>(
    () => visibleSections[0]?.id ?? "models",
  );

  const resolvedSection = visibleSections.some((section) => section.id === activeSection)
    ? activeSection
    : (visibleSections[0]?.id ?? "models");

  const isAdmin = canAccessModule(user, "settings");

  return (
    <PageShell>
      <PageHeader
        icon={getRouteIcon("/settings")}
        eyebrow={isAdmin ? "Platform administration" : "ML governance"}
        title="System Settings"
        description={
          isAdmin
            ? "Manage users, role access policies, platform configuration, audit logs, and ML model comparison."
            : "Review offline training metrics and the production inference model."
        }
      />

      <div className="grid gap-6 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <nav
            className="space-y-1 rounded-xl border border-outline-variant bg-surface-container-lowest p-2"
            aria-label="Settings sections"
          >
            {visibleSections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition",
                  resolvedSection === section.id
                    ? "bg-primary text-on-primary"
                    : "text-on-surface-variant hover:bg-surface-container-low",
                )}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="lg:col-span-3">
          {resolvedSection === "users" ? <UserManagementPanel /> : null}
          {resolvedSection === "roles" ? <RolePoliciesPanel /> : null}
          {resolvedSection === "system" ? <SystemConfigurationPanel /> : null}
          {resolvedSection === "audit" ? <AuditLogsPanel /> : null}
          {resolvedSection === "models" ? <ModelComparisonPanel /> : null}
        </div>
      </div>
    </PageShell>
  );
}
