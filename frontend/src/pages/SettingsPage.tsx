import { useMemo, useState } from "react";

import { AppearancePanel } from "@/components/settings/AppearancePanel";
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

type SettingsSection = "appearance" | "users" | "roles" | "system" | "audit" | "models";

const ADMIN_SECTIONS: Array<{ id: Exclude<SettingsSection, "appearance" | "models">; label: string }> =
  [
    { id: "users", label: "User management" },
    { id: "roles", label: "Role policies" },
    { id: "system", label: "System configuration" },
    { id: "audit", label: "Audit" },
  ];

function getDefaultSection(): SettingsSection {
  return "appearance";
}

function getVisibleSections(
  user: ReturnType<typeof useAuth>["user"],
): Array<{ id: SettingsSection; label: string }> {
  const isAdmin = canAccessModule(user, "settings");
  const canViewModels = canAccessMlComparison(user);

  const sections: Array<{ id: SettingsSection; label: string }> = [
    { id: "appearance", label: "Appearance" },
  ];

  if (isAdmin) {
    sections.push(...ADMIN_SECTIONS);
  }

  if (canViewModels) {
    sections.push({ id: "models", label: "Models" });
  }

  return [...sections].sort((a, b) => a.label.localeCompare(b.label));
}

function getPageCopy(user: ReturnType<typeof useAuth>["user"], isAdmin: boolean) {
  if (isAdmin) {
    return {
      eyebrow: "Platform administration",
      title: "System Settings",
      description:
        "Manage users, role access policies, platform configuration, audit logs, ML model comparison, and appearance.",
    };
  }

  if (canAccessMlComparison(user)) {
    return {
      eyebrow: "ML governance",
      title: "System Settings",
      description: "Review offline training metrics, production model details, and appearance.",
    };
  }

  return {
    eyebrow: "Preferences",
    title: "Settings",
    description: "Customize how MedScope AI looks on your device.",
  };
}

/** Settings — appearance for all roles; admin and ML sections per RBAC (T-X01, T-X03-05, T-X07). */
export function SettingsPage() {
  const { user } = useAuth();
  const visibleSections = useMemo(() => getVisibleSections(user), [user]);
  const [activeSection, setActiveSection] = useState<SettingsSection>(getDefaultSection);

  const resolvedSection = visibleSections.some((section) => section.id === activeSection)
    ? activeSection
    : (visibleSections[0]?.id ?? "appearance");

  const isAdmin = canAccessModule(user, "settings");
  const pageCopy = getPageCopy(user, isAdmin);

  return (
    <PageShell>
      <PageHeader
        icon={getRouteIcon("/settings")}
        eyebrow={pageCopy.eyebrow}
        title={pageCopy.title}
        description={pageCopy.description}
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
          {resolvedSection === "appearance" ? <AppearancePanel /> : null}
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
