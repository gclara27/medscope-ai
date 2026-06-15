export type UserRole = "admin" | "clinician" | "analyst" | "nurse";

export const USER_ROLES: UserRole[] = [
  "admin",
  "clinician",
  "analyst",
  "nurse",
];

export function isUserRole(value: string): value is UserRole {
  return USER_ROLES.includes(value as UserRole);
}
