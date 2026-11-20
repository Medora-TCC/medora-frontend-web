import { api } from "../client";
import { Endpoints } from "../endpoints";
import type { CredentialsOverview } from "../dtos/dashboard";

export async function getCredentialsOverview(): Promise<CredentialsOverview> {
  const { data } = await api.get<CredentialsOverview>(Endpoints.ADMIN_DASHBOARD_CREDENTIALS);
  return data;
}