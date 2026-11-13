import { api } from "../client";
import { Endpoints } from "../endpoints";
import type { AuditFilter, AuditPage, AuditProcessInfo } from "../dtos/audit";

export async function searchAuditEntries(filter: AuditFilter): Promise<AuditPage> {
  const params = Object.fromEntries(
    Object.entries(filter).filter(([, value]) => value !== undefined && value !== ""),
  );
  const { data } = await api.get<AuditPage>(Endpoints.AUDIT_ENTRIES, { params });
  return data;
}

export async function getAuditProcesses(): Promise<AuditProcessInfo[]> {
  const { data } = await api.get<AuditProcessInfo[]>(Endpoints.AUDIT_PROCESSES);
  return data;
}