import type {
  AdminUser,
  AdminUserListResponse,
  CreateAdminUserPayload,
  UpdateAdminUserPayload,
} from "@/types/adminUser";
import { api } from "./api";

export async function listAdminUsers(): Promise<AdminUserListResponse> {
  const { data } = await api.get<AdminUserListResponse>("/admin/users");
  return {
    items: Array.isArray(data?.items) ? data.items : [],
    total: typeof data?.total === "number" ? data.total : 0,
  };
}

export async function createAdminUser(payload: CreateAdminUserPayload): Promise<AdminUser> {
  const { data } = await api.post<AdminUser>("/admin/users", payload);
  return data;
}

export async function updateAdminUser(
  userId: string,
  payload: UpdateAdminUserPayload,
): Promise<AdminUser> {
  const { data } = await api.patch<AdminUser>(`/admin/users/${userId}`, payload);
  return data;
}
