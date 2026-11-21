export interface WorkerLogItem {
  id: number;
  createdAt: string;
  source: string;
  eventType: string;
  level: string;
  doctorId: string | null;
  doctorName: string | null;
  correlationId: string | null;
  retryCount: number | null;
  durationMs: number | null;
  errorType: string | null;
  errorMessage: string | null;
}

export interface WorkerLogDetail extends WorkerLogItem {
  stackTrace: string | null;
  properties: string | null;
}

export interface WorkerLogPage {
  items: WorkerLogItem[];
  total: number;
}

// Resposta do disparo manual de um job; requestId vira a correlação dos eventos no log do worker
export interface JobTriggerResponse {
  requestId: string;
  jobNames: string[];
  requestedAt: string;
}

export interface WorkerLogFilterOptions {
  sources: string[];
  eventTypes: string[];
  levels: string[];
}

export interface WorkerLogFilter {
  from?: string;
  to?: string;
  level?: string;
  source?: string;
  eventType?: string;
  doctorId?: string;
  correlationId?: string;
  search?: string;
  page: number;
  pageSize: number;
}