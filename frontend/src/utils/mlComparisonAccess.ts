import type { User } from "@/types/auth";

/** Analyst and admin may view offline ML comparison (UC-084, RF-077). */
export function canAccessMlComparison(user: Pick<User, "role"> | null): boolean {
  return user?.role === "analyst" || user?.role === "admin";
}
