import { useCallback, useEffect, useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { ChevronDown, ChevronUp, Cpu, Link2, Search, ShieldCheck, X } from "lucide-react";
import { getWorkerLog, getWorkerLogFilters, searchWorkerLogs, triggerDoctorVerification } from "../../api/services/WorkerLogService";
import type { WorkerLogDetail, WorkerLogFilter, WorkerLogFilterOptions, WorkerLogItem } from "../../api/dtos/workerLogs";
import { levelConfig } from "../../api/mappers/workerLogLabels";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import { useConfirm } from "../../components/ConfirmDialog/useConfirm";

const PAGE_SIZE = 25;

// tempo para o worker receber o pedido e gravar os primeiros eventos antes de recarregar a lista
const TRIGGER_REFRESH_DELAY_MS = 3000;

interface TriggerMessage {
  type: "error" | "success";
  text: string;
  correlationId?: string;
}

interface FilterForm {
  from: string;
  to: string;
  level: string;
  source: string;
  eventType: string;
  correlationId: string;
  doctorId: string;
  search: string;
}

const EMPTY_FORM: FilterForm = { from: "", to: "", level: "", source: "", eventType: "", correlationId: "", doctorId: "", search: "" };
const EMPTY_OPTIONS: WorkerLogFilterOptions = { sources: [], eventTypes: [], levels: [] };

function toApiFilter(form: FilterForm, page: number): WorkerLogFilter {
  const nextDay = form.to ? new Date(`${form.to}T00:00:00`) : null;
  nextDay?.setDate(nextDay.getDate() + 1);

  return {
    from: form.from ? new Date(`${form.from}T00:00:00`).toISOString() : undefined,
    to: nextDay ? nextDay.toISOString() : undefined,
    level: form.level || undefined,
    source: form.source || undefined,
    eventType: form.eventType || undefined,
    correlationId: form.correlationId.trim() || undefined,
    doctorId: form.doctorId || undefined,
    search: form.search.trim() || undefined,
    page,
    pageSize: PAGE_SIZE,
  };
}

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });

const inputClassName = "h-9 px-3 rounded-lg border border-divider bg-surface text-sm text-text-primary";

export default function WorkerLogs() {
  const [form, setForm] = useState<FilterForm>(EMPTY_FORM);
  const [applied, setApplied] = useState<FilterForm>(EMPTY_FORM);
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState<WorkerLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [options, setOptions] = useState<WorkerLogFilterOptions>(EMPTY_OPTIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerMessage, setTriggerMessage] = useState<TriggerMessage | null>(null);
  const { confirm, dialogProps } = useConfirm();

  useEffect(() => {
    getWorkerLogFilters().then(setOptions).catch(() => setOptions(EMPTY_OPTIONS));
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await searchWorkerLogs(toApiFilter(applied, page));
      setLogs(data.items);
      setTotal(data.total);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Erro ao carregar os logs.");
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

  const verifyPendingDoctors = async () => {
    const confirmed = await confirm({
      title: "Verificar médicos pendentes agora?",
      description:
        "O worker vai enviar para a fila de verificação no CFM os cadastros novos ainda não verificados e os médicos com verificação vencida ou pendente, sem esperar o agendamento de hora em hora.",
      confirmLabel: "Verificar agora",
      tone: "primary",
    });
    if (!confirmed) return;

    setIsTriggering(true);
    setTriggerMessage(null);
    try {
      const response = await triggerDoctorVerification();
      // o worker grava a correlação sem hífens (Guid "N")
      const correlationId = response.requestId.replaceAll("-", "");
      setTriggerMessage({
        type: "success",
        text: "Verificação solicitada ao worker. Os eventos aparecem nesta lista em instantes.",
        correlationId,
      });
      setTimeout(load, TRIGGER_REFRESH_DELAY_MS);
    } catch (error) {
      setTriggerMessage({ type: "error", text: error instanceof Error ? error.message : "Não foi possível solicitar a verificação." });
    } finally {
      setIsTriggering(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = Object.values(applied).some(Boolean);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <ConfirmDialog {...dialogProps} />
      <main className="py-4 px-6 space-y-5 max-w-7xl mx-auto w-full">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <Cpu className="text-primary-color" />
              Logs do Worker
            </h1>
            <p className="text-sm text-text-muted mt-1">Eventos das tarefas executadas em segundo plano.</p>
          </div>
          <Button
            size="sm"
            className="bg-primary-color text-text-inverse font-semibold"
            isDisabled={isTriggering}
            onPress={verifyPendingDoctors}
          >
            {isTriggering ? <Spinner size="sm" /> : <ShieldCheck size={14} />} Verificar médicos pendentes
          </Button>
        </header>

        {triggerMessage && (
          <div className={`px-4 py-3 rounded-lg text-sm flex flex-wrap items-center justify-between gap-2 ${triggerMessage.type === "error" ? "bg-danger-subtle text-danger-text" : "bg-success-subtle text-success-text"}`}>
            <span>{triggerMessage.text}</span>
            {triggerMessage.correlationId && (
              <button
                type="button"
                onClick={() => quickFilter({ correlationId: triggerMessage.correlationId! })}
                className="inline-flex items-center gap-1 font-semibold hover:underline"
              >
                <Link2 size={13} /> Ver eventos deste disparo
              </button>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {options.levels.map((level) => (
            <QuickButton key={level} onPress={() => quickFilter({ level })}>
              {levelConfig(level).label}
            </QuickButton>
          ))}
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
          <div className="sm:col-span-2">
            <Labeled label="Buscar">
              <input
                value={form.search}
                onChange={(e) => setField("search", e.target.value)}
                placeholder="Evento, origem, mensagem de erro ou ID de correlação"
                className={`${inputClassName} w-full`}
              />
            </Labeled>
          </div>
          <Labeled label="De">
            <input type="date" value={form.from} onChange={(e) => setField("from", e.target.value)} className={inputClassName} />
          </Labeled>
          <Labeled label="Até">
            <input type="date" value={form.to} min={form.from || undefined} onChange={(e) => setField("to", e.target.value)} className={inputClassName} />
          </Labeled>
          <Labeled label="Nível">
            <select value={form.level} onChange={(e) => setField("level", e.target.value)} className={inputClassName}>
              <option value="">Todos</option>
              {options.levels.map((level) => <option key={level} value={level}>{levelConfig(level).label}</option>)}
            </select>
          </Labeled>
          <Labeled label="Origem">
            <select value={form.source} onChange={(e) => setField("source", e.target.value)} className={inputClassName}>
              <option value="">Todas</option>
              {options.sources.map((source) => <option key={source} value={source}>{source}</option>)}
            </select>
          </Labeled>
          <Labeled label="Evento">
            <select value={form.eventType} onChange={(e) => setField("eventType", e.target.value)} className={inputClassName}>
              <option value="">Todos</option>
              {options.eventTypes.map((eventType) => <option key={eventType} value={eventType}>{eventType}</option>)}
            </select>
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
          ) : logs.length === 0 ? (
            <p className="py-16 text-center text-sm text-text-muted">Nenhum evento encontrado para esses filtros.</p>
          ) : (
            <div className="divide-y divide-divider">
              {logs.map((log) => (
                <LogRow
                  key={log.id}
                  log={log}
                  expanded={expandedId === log.id}
                  onToggle={() => setExpandedId((current) => (current === log.id ? null : log.id))}
                  onFilter={quickFilter}
                />
              ))}
            </div>
          )}

          <div className="px-4 py-3 border-t border-divider flex items-center justify-between">
            <span className="text-sm text-text-muted">
              {total} {total === 1 ? "evento" : "eventos"} · página {page} de {totalPages}
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

function LogRow({ log, expanded, onToggle, onFilter }: {
  log: WorkerLogItem;
  expanded: boolean;
  onToggle: () => void;
  onFilter: (patch: Partial<FilterForm>) => void;
}) {
  const level = levelConfig(log.level);
  const Icon = level.icon;

  return (
    <div>
      <button type="button" onClick={onToggle} className="w-full text-left px-4 py-3 flex items-center gap-4 hover:bg-surface/50 transition-colors">
        <div className="flex items-center justify-center bg-surface border border-divider rounded-lg h-10 w-10 shrink-0">
          <Icon size={20} className={level.iconClassName} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text-primary truncate">{log.eventType}</p>
          <p className="text-xs text-text-muted truncate">
            {formatDateTime(log.createdAt)} · {log.source}
            {log.doctorName && ` · ${log.doctorName}`}
            {log.durationMs !== null && ` · ${log.durationMs} ms`}
            {log.retryCount ? ` · tentativa ${log.retryCount}` : ""}
          </p>
          {log.errorMessage && <p className="text-xs text-danger-text truncate mt-0.5">{log.errorMessage}</p>}
        </div>
        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-bold ${level.className}`}>{level.label}</span>
        {expanded ? <ChevronUp size={16} className="text-text-muted shrink-0" /> : <ChevronDown size={16} className="text-text-muted shrink-0" />}
      </button>

      {expanded && <LogDetail id={log.id} onFilter={onFilter} />}
    </div>
  );
}

function LogDetail({ id, onFilter }: { id: number; onFilter: (patch: Partial<FilterForm>) => void }) {
  const [detail, setDetail] = useState<WorkerLogDetail | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let ignore = false;
    getWorkerLog(id)
      .then((data) => { if (!ignore) setDetail(data); })
      .catch((error) => { if (!ignore) setErrorMessage(error instanceof Error ? error.message : "Erro ao carregar o evento."); });
    return () => { ignore = true; };
  }, [id]);

  if (errorMessage) return <p className="px-4 pb-4 pl-18 text-xs text-danger-text">{errorMessage}</p>;
  if (!detail) return <div className="px-4 pb-4 flex justify-center"><Spinner size="sm" /></div>;

  return (
    <div className="px-4 pb-4 pl-18 space-y-3">
      <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-xs">
        <Detail label="Correlação" value={detail.correlationId} />
        <Detail label="Tipo do erro" value={detail.errorType} />
        <Detail label="Médico" value={detail.doctorName ?? detail.doctorId} />
      </dl>

      {detail.errorMessage && (
        <div className="rounded-lg border border-danger-subtle bg-danger-subtle/40 p-3 text-xs text-danger-text whitespace-pre-wrap">
          {detail.errorMessage}
        </div>
      )}

      {detail.stackTrace && (
        <details className="text-xs">
          <summary className="cursor-pointer font-semibold text-text-secondary">Stack trace</summary>
          <pre className="mt-2 max-h-80 overflow-auto rounded-lg border border-divider bg-surface p-3 text-text-secondary">
            {detail.stackTrace}
          </pre>
        </details>
      )}

      {detail.properties && (
        <details className="text-xs">
          <summary className="cursor-pointer font-semibold text-text-secondary">Propriedades</summary>
          <pre className="mt-2 max-h-80 overflow-auto rounded-lg border border-divider bg-surface p-3 text-text-secondary">
            {formatJson(detail.properties)}
          </pre>
        </details>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {detail.correlationId && (
          <RowAction onPress={() => onFilter({ correlationId: detail.correlationId! })}>
            Ver eventos desta correlação
          </RowAction>
        )}
        {detail.doctorId && (
          <RowAction onPress={() => onFilter({ doctorId: detail.doctorId! })}>
            Ver eventos deste médico
          </RowAction>
        )}
        <RowAction onPress={() => onFilter({ eventType: detail.eventType })}>
          Ver eventos deste tipo
        </RowAction>
      </div>
    </div>
  );
}

function formatJson(json: string) {
  try {
    return JSON.stringify(JSON.parse(json), null, 2);
  } catch {
    return json;
  }
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

function RowAction({ onPress, children }: { onPress: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onPress} className="inline-flex items-center gap-1 text-xs font-semibold text-primary-color hover:underline">
      <Link2 size={12} /> {children}
    </button>
  );
}

function QuickButton({ onPress, children }: { onPress: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onPress} className="inline-flex items-center gap-1 px-3 h-8 rounded-full border border-divider bg-surface-alt text-xs font-semibold text-text-secondary hover:text-text-primary">
      {children}
    </button>
  );
}