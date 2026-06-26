import { useCallback, useEffect, useState } from "react";

import { Alert } from "@/components/Alert";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/useAuth";
import { listRolePolicies, updateRolePolicy } from "@/services/adminSettings";
import type { RolePolicy } from "@/types/adminSettings";
import type { PermissionModule } from "@/types/permissions";
import { PERMISSION_LABELS } from "@/types/permissions";
import { getAdminSettingsErrorMessage } from "@/utils/adminSettingsErrors";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  clinician: "Clinician",
  analyst: "Analyst",
  nurse: "Nurse",
};

/** Admin matrix for role module permissions (T-X02, RF-071). */
export function RolePoliciesPanel() {
  const { refreshSession } = useAuth();
  const [roles, setRoles] = useState<RolePolicy[]>([]);
  const [modules, setModules] = useState<PermissionModule[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Record<PermissionModule, boolean>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingRoleId, setPendingRoleId] = useState<string | null>(null);

  const loadPolicies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listRolePolicies();
      setRoles(response.items);
      setModules(response.modules);
      setDrafts(
        Object.fromEntries(
          response.items.map((role) => [role.id, { ...role.permissions }]),
        ),
      );
    } catch (loadError) {
      setRoles([]);
      setError(getAdminSettingsErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPolicies();
  }, [loadPolicies]);

  function togglePermission(roleId: string, module: PermissionModule, enabled: boolean) {
    setDrafts((current) => ({
      ...current,
      [roleId]: {
        ...current[roleId],
        [module]: enabled,
      },
    }));
  }

  async function saveRole(role: RolePolicy) {
    setPendingRoleId(role.id);
    setActionError(null);
    try {
      const updated = await updateRolePolicy(role.id, {
        permissions: drafts[role.id] ?? role.permissions,
      });
      setRoles((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setDrafts((current) => ({
        ...current,
        [updated.id]: { ...updated.permissions },
      }));
      await refreshSession();
    } catch (saveError) {
      setActionError(getAdminSettingsErrorMessage(saveError));
    } finally {
      setPendingRoleId(null);
    }
  }

  if (isLoading) {
    return (
      <Card className="shadow-level-1">
        <CardContent className="flex justify-center p-10">
          <Spinner label="Loading role policies" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-level-1">
      <CardHeader className="border-b border-outline-variant">
        <CardTitle className="text-base">Role policies</CardTitle>
        <p className="text-sm text-on-surface-variant">
          Control which clinical modules each role can access. Administrator permissions are
          locked.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {error ? <Alert variant="error">{error}</Alert> : null}
        {actionError ? <Alert variant="error">{actionError}</Alert> : null}

        <div className="overflow-x-auto rounded-lg border border-outline-variant">
          <table className="min-w-full text-sm">
            <thead className="bg-surface-container-low text-left text-on-surface-variant">
              <tr>
                <th className="px-4 py-3 font-medium">Role</th>
                {modules.map((module) => (
                  <th key={module} className="px-3 py-3 font-medium">
                    {PERMISSION_LABELS[module]}
                  </th>
                ))}
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => {
                const draft = drafts[role.id] ?? role.permissions;
                const isDirty = modules.some(
                  (module) => draft[module] !== role.permissions[module],
                );

                return (
                  <tr key={role.id} className="border-t border-outline-variant">
                    <td className="px-4 py-3">
                      <p className="font-medium text-on-surface">
                        {ROLE_LABELS[role.name] ?? role.name}
                      </p>
                      {role.description ? (
                        <p className="text-xs text-on-surface-variant">{role.description}</p>
                      ) : null}
                    </td>
                    {modules.map((module) => (
                      <td key={module} className="px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-primary"
                          checked={draft[module]}
                          disabled={role.is_locked}
                          aria-label={`${ROLE_LABELS[role.name] ?? role.name} ${PERMISSION_LABELS[module]}`}
                          onChange={(event) =>
                            togglePermission(role.id, module, event.target.checked)
                          }
                        />
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={role.is_locked || !isDirty || pendingRoleId === role.id}
                        onClick={() => void saveRole(role)}
                      >
                        {pendingRoleId === role.id ? "Saving…" : "Save"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
