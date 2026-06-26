import type { UserRole } from "@/types/roles";

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface AdminUserListResponse {
  items: AdminUser[];
  total: number;
}

export interface CreateAdminUserPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
}

export interface UpdateAdminUserPayload {
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  is_active?: boolean;
}
