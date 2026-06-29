import { useState } from "react";

import { AuditLogsPanel } from "@/components/settings/AuditLogsPanel";
import { RolePoliciesPanel } from "@/components/settings/RolePoliciesPanel";
import { SystemConfigurationPanel } from "@/components/settings/SystemConfigurationPanel";
import { UserManagementPanel } from "@/components/settings/UserManagementPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { getRouteIcon } from "@/config/navigation";
import { cn } from "@/lib/utils";

type SettingsSection = "users" | "roles" | "system" | "audit";

const SETTINGS_SECTIONS: Array<{ id: SettingsSection; label: string }> = [
  { id: "users", label: "User management" },
  { id: "roles", label: "Role policies" },
  { id: "system", label: "System configuration" },
  { id: "audit", label: "Audit" },
];

/** Admin settings — users, role policies, and platform configuration (T-X01, T-X02). */
export function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("users");

  return (
    <PageShell>
      <PageHeader
        icon={getRouteIcon("/settings")}
        eyebrow="Platform administration"
        title="System Settings"
        description="Manage users, role access policies, platform configuration, and audit logs."
      />

      <div className="grid gap-6 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <nav
            className="space-y-1 rounded-xl border border-outline-variant bg-surface-container-lowest p-2"
            aria-label="Settings sections"
          >
            {SETTINGS_SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition",
                  activeSection === section.id
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
          {activeSection === "users" ? <UserManagementPanel /> : null}
          {activeSection === "roles" ? <RolePoliciesPanel /> : null}
          {activeSection === "system" ? <SystemConfigurationPanel /> : null}
          {activeSection === "audit" ? <AuditLogsPanel /> : null}
        </div>
      </div>
    </PageShell>
  );
}
