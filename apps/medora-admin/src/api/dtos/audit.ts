// ⚠️ importa o cliente HTTP do mesmo jeito que o payouts.ts faz
import { api } from "../client"; 

export type AuditResult = "Success" | "Failure" | "Denied";

export interface AuditEntry {
  id: number;
  occurredAtUtc: string;
  userId: string | null;
  userEmail: string | null;
  role: string | null;
  ipAddress: string | null;
  httpMethod: string | null;
  endpoint: string | null;
  process: string | null;
  resourceType: string | null;
  resourceId: string | null;
  result: AuditResult;
  statusCode: number | null;
  durationMs: number | null;
  errorCode: string | null;
  exceptionType: string | null;
  traceId: string | null;
  metadataJson: string | null;
}

export interface AuditPage {
  items: AuditEntry[];
  total: number;
}

export interface AuditFilter {
  from?: string;
  to?: string;
  process?: string;
  result?: AuditResult;
  resourceType?: string;
  resourceId?: string;
  traceId?: string;
  endpoint?: string;
  httpMethod?: string;
  page: number;
  pageSize: number;
}

export async function searchAuditEntries(filter: AuditFilter): Promise<AuditPage> {
  const params = Object.fromEntries(
    Object.entries(filter).filter(([, value]) => value !== undefined && value !== ""),
  );
  const { data } = await api.get<AuditPage>("/admin/audit-entries", { params });
  return data;
}

export interface AuditProcessInfo {
  code: string;
  label: string;
}

export async function getAuditProcesses(): Promise<AuditProcessInfo[]> {
  const { data } = await api.get<AuditProcessInfo[]>("/admin/audit-entries/processes");
  return data;
}