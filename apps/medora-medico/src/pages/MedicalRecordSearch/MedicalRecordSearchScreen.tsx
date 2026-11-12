import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Pagination, type DateRange } from "@heroui/react";
import axios from "axios";
import { CircleAlert, FileSearch } from "lucide-react";


import { maskCpf, onlyDigits } from "./MedicalRecordHelper";
import { searchMedicalRecords, type MedicalRecordStatusFilter } from "../../api/services/MedicalRecordSearch";
import { MedicalRecordFilters } from "./MedicalRecordFilters";
import { MedicalRecordRow, MedicalRecordRowSkeleton } from "./MedicalRecodRow";
import type { MedicalRecordListDTO } from "../../api/dtos/MedicalRecord/MedicalRecordListDTO";

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 450;

// Fonte única da verdade da requisição: qualquer mudança aqui dispara UMA busca.
interface Query {
  nome: string;
  cpf: string; // somente dígitos
  status: MedicalRecordStatusFilter;
  dateRange: DateRange | null;
  page: number;
}

const INITIAL_QUERY: Query = {
  nome: "",
  cpf: "",
  status: "all",
  dateRange: null,
  page: 1,
};

// ─── Paginação: janela de páginas com reticências ─────────────────────────────
function getPageItems(page: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: (number | "ellipsis")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) items.push("ellipsis");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total - 1) items.push("ellipsis");
  items.push(total);
  return items;
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({
  hasActiveFilters,
  onClear,
}: {
  hasActiveFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-surface-secondary text-fg-muted">
        <FileSearch strokeWidth={1.5} />
      </div>
      <p className="text-sm text-fg-muted">Nenhum prontuário encontrado</p>
      {hasActiveFilters && (
        <Button size="sm" variant="outline" onPress={onClear}>
          Limpar filtros
        </Button>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function MedicalRecordSearchScreen() {
  // Valores digitados (atualizam a cada tecla)
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState(""); // já com máscara

  // Parâmetros efetivamente enviados ao backend
  const [query, setQuery] = useState<Query>(INITIAL_QUERY);

  const [items, setItems] = useState<MedicalRecordListDTO[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Aplica nome/CPF na query; só muda o estado (e a página) se algo realmente mudou.
  const commitSearch = useCallback((n: string, c: string) => {
    const name = n.trim();
    const digits = onlyDigits(c);
    setQuery((q) =>
      q.nome === name && q.cpf === digits ? q : { ...q, nome: name, cpf: digits, page: 1 },
    );
  }, []);

  // Debounce da digitação
  useEffect(() => {
    const timer = setTimeout(() => commitSearch(nome, cpf), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [nome, cpf, commitSearch]);

  // Busca no servidor; cancela a requisição anterior quando a query muda
  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    searchMedicalRecords(
      {
        page: query.page,
        pageSize: PAGE_SIZE,
        name: query.nome || undefined,
        cpf: query.cpf || undefined,
        status: query.status,
        dateFrom: query.dateRange?.start.toString(),
        dateTo: query.dateRange?.end.toString(),
      },
      controller.signal,
    )
      .then((res) => {
        setItems(res.items);
        setTotalCount(res.totalCount);
      })
      .catch((e: unknown) => {
        if (axios.isCancel(e) || controller.signal.aborted) return;
        console.error(e);
        setItems([]);
        setTotalCount(0);
        setError("Não foi possível carregar os prontuários.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [query, attempt]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const hasActiveFilters =
    nome !== "" || cpf !== "" || query.status !== "all" || query.dateRange !== null;

  const handleClear = () => {
    setNome("");
    setCpf("");
    setQuery({ ...INITIAL_QUERY });
  };

  const pageItems = useMemo(() => getPageItems(query.page, totalPages), [query.page, totalPages]);
  const firstItem = totalCount === 0 ? 0 : (query.page - 1) * PAGE_SIZE + 1;
  const lastItem = Math.min(query.page * PAGE_SIZE, totalCount);

  return (
    <div className="min-h-screen max-w-screen bg-surface">
      <div className="flex flex-col gap-6 px-4 py-8">
        {/* ── Header ───────────────────────────────────── */}
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Prontuários</h1>
          <p className="mt-0.5 text-sm text-fg-muted">
            {isLoading
              ? "Carregando…"
              : `${totalCount} prontuário${totalCount !== 1 ? "s" : ""} encontrado${totalCount !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* ── Busca + filtros ──────────────────────────── */}
        <MedicalRecordFilters
          nome={nome}
          cpf={cpf}
          status={query.status}
          dateRange={query.dateRange}
          hasActiveFilters={hasActiveFilters}
          isLoading={isLoading}
          onNomeChange={setNome}
          onCpfChange={(v) => setCpf(maskCpf(v))}
          onStatusChange={(status) => setQuery((q) => ({ ...q, status, page: 1 }))}
          onDateRangeChange={(dateRange) => setQuery((q) => ({ ...q, dateRange, page: 1 }))}
          onSearch={() => commitSearch(nome, cpf)}
          onClear={handleClear}
        />

        {/* ── Erro ──────────────────────────────────────── */}
        {error && (
          <Card className="border-danger-soft-hover bg-danger/5">
            <Card.Content className="flex items-center justify-between gap-2 p-3 text-sm text-danger">
              <span className="flex items-center gap-2" role="alert">
                <CircleAlert strokeWidth={1.25} />
                {error}
              </span>
              <Button size="sm" variant="secondary" onPress={() => setAttempt((n) => n + 1)}>
                Tentar de novo
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* ── Lista ─────────────────────────────────────── */}
        <div className="flex flex-col gap-2">
          {isLoading ? (
            Array.from({ length: 5 }, (_, i) => <MedicalRecordRowSkeleton key={i} />)
          ) : error ? null : items.length === 0 ? (
            <EmptyState hasActiveFilters={hasActiveFilters} onClear={handleClear} />
          ) : (
            items.map((item) => <MedicalRecordRow key={item.medicalRecord.id} item={item} />)
          )}
        </div>

        {/* ── Paginação (server-side) ───────────────────── */}
        {!error && totalCount > 0 && (
          <Pagination className="w-full">
            <Pagination.Summary>
              {firstItem}–{lastItem} de {totalCount} resultados
            </Pagination.Summary>
            <Pagination.Content>
              <Pagination.Item>
                <Pagination.Previous
                  isDisabled={isLoading || query.page === 1}
                  onPress={() => setQuery((q) => ({ ...q, page: Math.max(1, q.page - 1) }))}
                >
                  <Pagination.PreviousIcon />
                  Anterior
                </Pagination.Previous>
              </Pagination.Item>

              {pageItems.map((p, i) =>
                p === "ellipsis" ? (
                  <Pagination.Item key={`ellipsis-${i}`}>
                    <Pagination.Ellipsis />
                  </Pagination.Item>
                ) : (
                  <Pagination.Item key={p}>
                    <Pagination.Link
                      isActive={p === query.page}
                      onPress={() => setQuery((q) => ({ ...q, page: p }))}
                    >
                      {p}
                    </Pagination.Link>
                  </Pagination.Item>
                ),
              )}

              <Pagination.Item>
                <Pagination.Next
                  isDisabled={isLoading || query.page === totalPages}
                  onPress={() =>
                    setQuery((q) => ({ ...q, page: Math.min(totalPages, q.page + 1) }))
                  }
                >
                  Próxima
                  <Pagination.NextIcon />
                </Pagination.Next>
              </Pagination.Item>
            </Pagination.Content>
          </Pagination>
        )}
      </div>
    </div>
  );
}

export default MedicalRecordSearchScreen;