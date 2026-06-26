import { FormEvent, useCallback, useEffect, useState } from "react";

import { Alert } from "@/components/Alert";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/useAuth";
import { cn } from "@/lib/utils";
import { createAdminUser, listAdminUsers, updateAdminUser } from "@/services/adminUsers";
import type { AdminUser, CreateAdminUserPayload } from "@/types/adminUser";
import { USER_ROLES, type UserRole } from "@/types/roles";
import { getAdminUserErrorMessage } from "@/utils/adminUserErrors";

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  clinician: "Clinician",
  analyst: "Analyst",
  nurse: "Nurse",
};

const EMPTY_CREATE_FORM: CreateAdminUserPayload = {
  email: "",
  password: "",
  first_name: "",
  last_name: "",
  role: "clinician",
};

const selectClassName = cn(
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground",
  "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
);

/** Admin user list, create, deactivate, and role assignment (T-X01, UC-070). */
export function UserManagementPanel() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<CreateAdminUserPayload>(EMPTY_CREATE_FORM);
  const [isCreating, setIsCreating] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listAdminUsers();
      setUsers(response.items);
    } catch (loadError) {
      setUsers([]);
      setError(getAdminUserErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);
    setActionError(null);
    try {
      await createAdminUser(createForm);
      setCreateForm(EMPTY_CREATE_FORM);
      setShowCreateForm(false);
      await loadUsers();
    } catch (createError) {
      setActionError(getAdminUserErrorMessage(createError));
    } finally {
      setIsCreating(false);
    }
  }

  async function handleRoleChange(userId: string, role: UserRole) {
    setPendingUserId(userId);
    setActionError(null);
    try {
      const updated = await updateAdminUser(userId, { role });
      setUsers((current) => current.map((item) => (item.id === userId ? updated : item)));
    } catch (updateError) {
      setActionError(getAdminUserErrorMessage(updateError));
    } finally {
      setPendingUserId(null);
    }
  }

  async function handleToggleActive(user: AdminUser) {
    setPendingUserId(user.id);
    setActionError(null);
    try {
      const updated = await updateAdminUser(user.id, { is_active: !user.is_active });
      setUsers((current) => current.map((item) => (item.id === user.id ? updated : item)));
    } catch (updateError) {
      setActionError(getAdminUserErrorMessage(updateError));
    } finally {
      setPendingUserId(null);
    }
  }

  return (
    <Card className="shadow-level-1">
      <CardHeader className="flex flex-col gap-4 border-b border-outline-variant sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base">User management</CardTitle>
          <p className="mt-1 text-sm text-on-surface-variant">
            Create accounts, deactivate users, and assign roles.
          </p>
        </div>
        <Button
          type="button"
          variant={showCreateForm ? "outline" : "default"}
          onClick={() => setShowCreateForm((value) => !value)}
        >
          {showCreateForm ? "Cancel" : "Add user"}
        </Button>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {error ? <Alert variant="error">{error}</Alert> : null}
        {actionError ? <Alert variant="error">{actionError}</Alert> : null}

        {showCreateForm ? (
          <form
            onSubmit={handleCreateUser}
            className="grid gap-4 rounded-lg border border-outline-variant bg-surface-container-low p-4 md:grid-cols-2"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-first-name">First name</Label>
              <Input
                id="create-first-name"
                value={createForm.first_name}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, first_name: event.target.value }))
                }
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-last-name">Last name</Label>
              <Input
                id="create-last-name"
                value={createForm.last_name}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, last_name: event.target.value }))
                }
                required
              />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                type="email"
                value={createForm.email}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, email: event.target.value }))
                }
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-password">Temporary password</Label>
              <Input
                id="create-password"
                type="password"
                minLength={8}
                value={createForm.password}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, password: event.target.value }))
                }
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-role">Role</Label>
              <select
                id="create-role"
                className={selectClassName}
                value={createForm.role}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    role: event.target.value as UserRole,
                  }))
                }
              >
                {USER_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creating user…" : "Create user"}
              </Button>
            </div>
          </form>
        ) : null}

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner label="Loading users" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-sm text-on-surface-variant">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isSelf = user.id === currentUser?.id;
                  const isPending = pendingUserId === user.id;

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-outline-variant/70 transition-colors hover:bg-surface-container-low"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-on-surface">
                        {user.first_name} {user.last_name}
                        {isSelf ? (
                          <span className="ml-2 text-xs font-normal text-on-surface-variant">
                            (you)
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-sm text-on-surface-variant">{user.email}</td>
                      <td className="px-4 py-3">
                        <select
                          className={selectClassName}
                          value={user.role}
                          disabled={isPending}
                          aria-label={`Role for ${user.email}`}
                          onChange={(event) =>
                            void handleRoleChange(user.id, event.target.value as UserRole)
                          }
                        >
                          {USER_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {ROLE_LABELS[role]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-md px-2 py-0.5 text-xs font-semibold",
                            user.is_active
                              ? "bg-risk-low/15 text-risk-low"
                              : "bg-surface-container-high text-on-surface-variant",
                          )}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isSelf || isPending}
                          onClick={() => void handleToggleActive(user)}
                        >
                          {user.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
