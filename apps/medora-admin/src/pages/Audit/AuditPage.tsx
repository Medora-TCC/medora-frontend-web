import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { ChevronDown, ChevronUp, Link2, ScrollText, Search, X } from "lucide-react";
import {
  getAuditProcesses,
  searchAuditEntries,
  type AuditEntry,
  type AuditFilter,
  type AuditProcessInfo,
  type AuditResult,
} from "../../api/dtos/audit";
import { OPERATION_LABEL, RESULT_CONFIG } from "../../api/mappers/auditLabels";

const PAGE_SIZE = 25;

interface FilterForm {
  from: string;
  to: string;
  process: string;
  result: "" | AuditResult;
  userId: string;
  resourceType: string;
  resourceId: string;
  traceId: string;
  endpoint: string;
  httpMethod: string;
}

const EMPTY_FORM: FilterForm = {
  from: "", to: "", process: "", result: "", resourceType: "", resourceId: "",
  traceId: "", userId: "", endpoint: "", httpMethod: "",
};

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

function startOfDayUtc(date: string) {
  return new Date(`${date}T00:00:00`).toISOString();
}

function toApiFilter(form: FilterForm, page: number): AuditFilter {
  const nextDay = form.to ? new Date(`${form.to}T00:00:00`) : null;
  nextDay?.setDate(nextDay.getDate() + 1);

  return {
    from: form.from ? startOfDayUtc(form.from) : undefined,
    to: nextDay ? nextDay.toISOString() : undefined,
    process: form.process || undefined,
    result: form.result || undefined,
    resourceType: form.resourceType.trim() || undefined,
    resourceId: form.resourceId.trim() || undefined,
    traceId: form.traceId.trim() || undefined,
    endpoint: form.endpoint.trim() || undefined,
    httpMethod: form.httpMethod || undefined,
    page,
    pageSize: PAGE_SIZE,
  };
}

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });

const inputClassName = "h-9 px-3 rounded-lg border border-divider bg-surface text-sm text-text-primary";

const RESULT_OPTIONS = Object.entries(RESULT_CONFIG) as [AuditResult, { label: string }][];

export default function AuditPage() {
  const [form, setForm] = useState<FilterForm>(EMPTY_FORM);
  const [applied, setApplied] = useState<FilterForm>(EMPTY_FORM);
  const [page, setPage] = useState(1);
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [processes, setProcesses] = useState<AuditProcessInfo[]>([]);

  useEffect(() => {
    getAuditProcesses().then(setProcesses).catch(() => setProcesses([]));
  }, []);

  const processLabels = useMemo(
    () => new Map(processes.map((p) => [p.code, p.label])),
    [processes],
  );

  const labelOf = useCallback(
    (code: string | null) => (code ? processLabels.get(code) ?? code : null),
    [processLabels],
  );

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await searchAuditEntries(toApiFilter(applied, page));
      setEntries(data.items);
      setTotal(data.total);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Erro ao carregar a auditoria.");
    } finally {
      setIsLoading(false);
    }
  }, [applied, page]);

  useEffect(() => {
    load();
  }, [load]);

  const setField = <K extends keyof FilterForm>(key: K, value: FilterForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const applyFilters = (next: FilterForm = form) => {
    setForm(next);
    setApplied(next);
    setPage(1);
    setExpandedId(null);
  };

  const quickFilter = (patch: Partial<FilterForm>) => applyFilters({ ...EMPTY_FORM, ...patch });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = Object.values(applied).some(Boolean);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <main className="py-4 px-6 space-y-5 max-w-7xl mx-auto w-full">
        <header>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <ScrollText className="text-primary-color" />
            Auditoria
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Quem fez o quê, quando, de onde e com qual resultado. Cada consulta nesta tela também é registrada.
          </p>
        </header>

        <div className="flex flex-wrap gap-2">
          <QuickButton onPress={() => quickFilter({ result: "Denied" })}>Acessos negados</QuickButton>
          <QuickButton onPress={() => quickFilter({ result: "Failure" })}>Falhas</QuickButton>
          <QuickButton onPress={() => quickFilter({ process: "DataChange" })}>Alterações de dados</QuickButton>
          <QuickButton onPress={() => quickFilter({ process: "Login" })}>Logins</QuickButton>
          {hasFilters && (
            <QuickButton onPress={() => applyFilters(EMPTY_FORM)}>
              <X size={13} /> Limpar filtros
            </QuickButton>
          )}
        </div>

        <form
          className="bg-surface-alt rounded-xl border border-divider p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            applyFilters();
          }}
        >
          <Labeled label="De">
            <input type="date" value={form.from} onChange={(e) => setField("from", e.target.value)} className={inputClassName} />
          </Labeled>
          <Labeled label="Até">
            <input type="date" value={form.to} min={form.from || undefined} onChange={(e) => setField("to", e.target.value)} className={inputClassName} />
          </Labeled>
          <Labeled label="Evento">
            <select value={form.process} onChange={(e) => setField("process", e.target.value)} className={inputClassName}>
              <option value="">Todos</option>
              {processes.map((p) => (
                <option key={p.code} value={p.code}>{p.label}</option>
              ))}
            </select>
          </Labeled>
          <Labeled label="Resultado">
            <select value={form.result} onChange={(e) => setField("result", e.target.value as FilterForm["result"])} className={inputClassName}>
              <option value="">Todos</option>
              {RESULT_OPTIONS.map(([value, config]) => (
                <option key={value} value={value}>{config.label}</option>
              ))}
            </select>
          </Labeled>
          <Labeled label="Endpoint (contém)">
              <input
                value={form.endpoint}
                onChange={(e) => setField("endpoint", e.target.value)}
                placeholder="Ex: educations"
                className={inputClassName}
              />
            </Labeled>
            <Labeled label="Método">
              <select value={form.httpMethod} onChange={(e) => setField("httpMethod", e.target.value)} className={inputClassName}>
                <option value="">Todos</option>
                {HTTP_METHODS.map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </Labeled>
          <Labeled label="Tipo do recurso">
            <input value={form.resourceType} onChange={(e) => setField("resourceType", e.target.value)} placeholder="Ex: MedicalRecord" className={inputClassName} />
          </Labeled>
          <Labeled label="ID do recurso">
            <input value={form.resourceId} onChange={(e) => setField("resourceId", e.target.value)} placeholder="Ex: 42" className={inputClassName} />
          </Labeled>
          <Labeled label="Requisição (TraceId)">
            <input value={form.traceId} onChange={(e) => setField("traceId", e.target.value)} className={inputClassName} />
          </Labeled>
          <div className="flex items-end">
            <Button type="submit" size="sm" className="bg-primary-color text-text-inverse font-semibold w-full h-9">
              <Search size={14} /> Aplicar filtros
            </Button>
          </div>
        </form>

        <section className="bg-surface-alt rounded-xl border border-divider overflow-hidden">
          {isLoading ? (
            <div className="py-16 flex justify-center"><Spinner /></div>
          ) : errorMessage ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <p className="text-sm text-danger-text">{errorMessage}</p>
              <Button size="sm" variant="outline" onPress={load}>Tentar novamente</Button>
            </div>
          ) : entries.length === 0 ? (
            <p className="py-16 text-center text-sm text-text-muted">Nenhum registro encontrado para esses filtros.</p>
          ) : (
            <div className="divide-y divide-divider">
              {entries.map((entry) => (
                <AuditRow
                  key={entry.id}
                  entry={entry}
                  labelOf={labelOf}
                  expanded={expandedId === entry.id}
                  onToggle={() => setExpandedId((current) => (current === entry.id ? null : entry.id))}
                  onFilter={quickFilter}
                />
              ))}
            </div>
          )}

          <div className="px-4 py-3 border-t border-divider flex items-center justify-between">
            <span className="text-sm text-text-muted">
              {total} {total === 1 ? "registro" : "registros"} · página {page} de {totalPages}
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" isDisabled={page <= 1 || isLoading} onPress={() => setPage((p) => p - 1)}>Anterior</Button>
              <Button size="sm" variant="outline" isDisabled={page >= totalPages || isLoading} onPress={() => setPage((p) => p + 1)}>Próxima</Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
const WRITE_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

function AuditRow({ entry, labelOf, expanded, onToggle, onFilter }: {
  entry: AuditEntry;
  labelOf: (code: string | null) => string | null;
  expanded: boolean;
  onToggle: () => void;
  onFilter: (patch: Partial<FilterForm>) => void;
}) {
  const result = RESULT_CONFIG[entry.result];
  const title = labelOf(entry.process) ?? `${entry.httpMethod ?? ""} ${entry.endpoint ?? ""}`.trim();
    
  const isDataChange = entry.process === "DataChange";
  const isWrite = entry.httpMethod !== null && WRITE_METHODS.includes(entry.httpMethod);
  const hasEndpoint = entry.endpoint !== null && entry.endpoint !== "(sem rota)";

  return (
    <div>
      <button type="button" onClick={onToggle} className="w-full text-left px-4 py-3 flex items-center gap-4 hover:bg-surface/50 transition-colors">
        <span className="text-xs text-text-muted w-36 shrink-0 font-mono">{formatDateTime(entry.occurredAtUtc)}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text-primary truncate">{title}</p>
          <p className="text-xs text-text-muted truncate">
            {entry.userEmail ?? "Anônimo"}
            {entry.role && ` · ${entry.role}`}
            {entry.resourceType && ` · ${entry.resourceType}${entry.resourceId ? ` #${entry.resourceId}` : ""}`}
          </p>
        </div>
        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-bold ${result.className}`}>
          {result.label}{entry.statusCode ? ` · ${entry.statusCode}` : ""}
        </span>
        {expanded ? <ChevronUp size={16} className="text-text-muted shrink-0" /> : <ChevronDown size={16} className="text-text-muted shrink-0" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 pl-44 space-y-3">
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-xs">
            <Detail label="Requisição" value={entry.httpMethod && entry.endpoint ? `${entry.httpMethod} ${entry.endpoint}` : null} />
            <Detail label="IP" value={entry.ipAddress} />
            <Detail label="Duração" value={entry.durationMs !== null ? `${entry.durationMs} ms` : null} />
            <Detail label="Código do erro" value={entry.errorCode} />
            <Detail label="Exceção" value={entry.exceptionType} />
            <Detail label="ID do usuário" value={entry.userId} />
          </dl>

          <MetadataView json={entry.metadataJson} />

          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {entry.traceId && isWrite && (
              <RowAction onPress={() => onFilter({ traceId: entry.traceId! })}>
                Ver dados alterados nesta requisição
              </RowAction>
            )}
            {entry.traceId && isDataChange && (
              <RowAction onPress={() => onFilter({ traceId: entry.traceId! })}>
                Ver requisição que causou esta alteração
              </RowAction>
            )}
            {hasEndpoint && (
              <RowAction onPress={() => onFilter({ endpoint: entry.endpoint!, httpMethod: entry.httpMethod ?? "" })}>
                Ver chamadas deste endpoint
              </RowAction>
            )}
            {entry.resourceType && entry.resourceId && (
              <RowAction onPress={() => onFilter({ resourceType: entry.resourceType!, resourceId: entry.resourceId! })}>
                Ver histórico deste recurso
              </RowAction>
            )}
            {entry.userId && (
              <RowAction onPress={() => onFilter({ userId: entry.userId! })}>
                Ver ações deste usuário
              </RowAction>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RowAction({ onPress, children }: { onPress: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onPress} className="inline-flex items-center gap-1 text-xs font-semibold text-primary-color hover:underline">
      <Link2 size={12} /> {children}
    </button>
  );
}

function MetadataView({ json }: { json: string | null }) {
  if (!json) return null;

  let parsed: { operation?: string; changes?: { field: string; old?: unknown; new?: unknown }[] } | null = null;
  try {
    parsed = JSON.parse(json);
  } catch {
    parsed = null;
  }

  if (parsed?.changes) {
    return (
      <div className="rounded-lg border border-divider bg-surface p-3 text-xs">
        <p className="font-semibold text-text-primary mb-2">
          {OPERATION_LABEL[parsed.operation ?? ""] ?? parsed.operation}
        </p>
        <ul className="space-y-1">
          {parsed.changes.map((change) => (
            <li key={change.field} className="text-text-secondary">
              <span className="font-mono text-text-primary">{change.field}</span>
              {"old" in change || "new" in change
                ? <>: {String(change.old ?? "—")} → {String(change.new ?? "—")}</>
                : <span className="text-text-muted"> (alterado, valor não registrado)</span>}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <pre className="rounded-lg border border-divider bg-surface p-3 text-xs text-text-secondary overflow-x-auto">
      {JSON.stringify(parsed ?? json, null, 2)}
    </pre>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="min-w-0">
      <dt className="text-text-muted">{label}</dt>
      <dd className="text-text-primary font-mono break-all">{value ?? "—"}</dd>
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-semibold text-text-muted">
      {label}
      {children}
    </label>
  );
}

function QuickButton({ onPress, children }: { onPress: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onPress} className="inline-flex items-center gap-1 px-3 h-8 rounded-full border border-divider bg-surface-alt text-xs font-semibold text-text-secondary hover:text-text-primary">
      {children}
    </button>
  );
}