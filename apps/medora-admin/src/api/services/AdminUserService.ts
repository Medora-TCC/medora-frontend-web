import { api } from "../client";
import { Endpoints } from "../endpoints";
import type { AdminUserFilter, AdminUserPage } from "../dtos/users";

export async function searchUsers(filter: AdminUserFilter): Promise<AdminUserPage> {
  const params = Object.fromEntries(
    Object.entries(filter).filter(([, value]) => value !== undefined && value !== ""),
  );
  const { data } = await api.get<AdminUserPage>(Endpoints.ADMIN_USERS, { params });
  return data;
}

export async function setUserActive(id: string, isActive: boolean): Promise<void> {
  await api.patch(Endpoints.ADMIN_USER_STATUS(id), { isActive });
}

export async function revokeUserSessions(id: string): Promise<void> {
  await api.post(Endpoints.ADMIN_USER_REVOKE_SESSIONS(id));
}