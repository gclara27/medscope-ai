/** Audit log API types — RF-075, RBE-016, T-X06. */

export interface AuditLogUserSummary {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

export interface AuditLogListItem {
  id: string;
  user_id: string | null;
  action_type: string;
  entity_type: string | null;
  entity_id: string | null;
  action_details: Record<string, unknown> | null;
  created_at: string;
  user: AuditLogUserSummary | null;
}

export interface AuditLogListResponse {
  items: AuditLogListItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface AuditLogListParams {
  date_from?: string;
  date_to?: string;
  action_type?: string;
  user_id?: string;
  page?: number;
  page_size?: number;
}
