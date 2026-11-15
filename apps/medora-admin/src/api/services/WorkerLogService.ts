import { api } from "../client";
import { Endpoints } from "../endpoints";
import type { WorkerLogDetail, WorkerLogFilter, WorkerLogFilterOptions, WorkerLogPage } from "../dtos/workerLogs";

export async function searchWorkerLogs(filter: WorkerLogFilter): Promise<WorkerLogPage> {
  const params = Object.fromEntries(
    Object.entries(filter).filter(([, value]) => value !== undefined && value !== ""),
  );
  const { data } = await api.get<WorkerLogPage>(Endpoints.WORKER_LOGS, { params });
  return data;
}

export async function getWorkerLog(id: number): Promise<WorkerLogDetail> {
  const { data } = await api.get<WorkerLogDetail>(Endpoints.WORKER_LOG(id));
  return data;
}

export async function getWorkerLogFilters(): Promise<WorkerLogFilterOptions> {
  const { data } = await api.get<WorkerLogFilterOptions>(Endpoints.WORKER_LOG_FILTERS);
  return data;
}