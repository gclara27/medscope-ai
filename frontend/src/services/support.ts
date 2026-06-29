import { api } from "@/services/api";
import type { SupportContact } from "@/types/support";

export async function getSupportContact(): Promise<SupportContact> {
  const { data } = await api.get<SupportContact>("/support/contact");
  return data;
}
