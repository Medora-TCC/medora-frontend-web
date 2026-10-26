import { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Card,
  Chip,
  SearchField,
  Skeleton,
  Spinner,
  ToggleButton,
  ToggleButtonGroup,
  useOverlayState,
} from "@heroui/react";

import type {
  FiltroConsulta,
  IConsultaDetailed,
  StatusConsulta,
} from "@medora_web/shared";

import { fetchConsultas, type DoctorAppointmentsApiFilter } from "../../api/services/Appointment";
import { CalendarDays, CircleAlert, RotateCcw } from "lucide-react";
import { ConsultaHourlyGrid } from "./ConsultaHourlyGrid";
import ConsultaModal from "../../components/Consulta/ConsultaModal";
import { ConsultaCard } from "./ConsultaCard";

// ─── Types ────────────────────────────────────────────────────────────────────
type Filtro = "todas" | StatusConsulta | "a_concluir";

// Filtros de status que o backend resolve em qualquer data (o resto filtra só o período carregado)
const filtroNoBackend: Partial<Record<Filtro, DoctorAppointmentsApiFilter>> = {
  esperando_confirmacao: "PendingConfirmation",
  a_concluir: "ToComplete",
};

const filtroDataNoBackend: Record<FiltroConsulta, DoctorAppointmentsApiFilter> = {
  hoje: "Today",
  amanha: "Tomorrow",
  semana: "Week",
  nenhum: "Upcoming",
};

// ─── Status config → Chip color + label ───────────────────────────────────────
const statusCfg: Record<
  StatusConsulta,
  { label: string; color: "accent" | "success" | "default" | "danger" }
> = {
  agendado: { label: "Agendada", color: "accent" },
  esperando_pagamento: { label: "Aguardando Pagamento", color: "accent" },
  esperando_confirmacao: { label: "Aguardando Confirmação", color: "accent" },
  confirmado: { label: "Confirmada", color: "accent" },
  em_atendimento: { label: "Em andamento", color: "success" },
  finalizado: { label: "Concluída", color: "default" },
  cancelado: { label: "Cancelada", color: "danger" },
  ausente: { label: "Ausente", color: "danger" },
};

// ─── Opções de filtro (constantes, fora do componente) ────────────────────────
const filtroOpcoes: { key: Filtro; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "agendado", label: "Agendadas" },
  { key: "esperando_pagamento", label: "Aguard. pagamento" },
  { key: "esperando_confirmacao", label: "Aguard. confirmação" },
  { key: "confirmado", label: "Confirmadas" },
  { key: "a_concluir", label: "A concluir" },
  { key: "em_atendimento", label: "Em andamento" },
  { key: "finalizado", label: "Concluídas" },
  { key: "cancelado", label: "Canceladas" },
  { key: "ausente", label: "Ausentes" },
];

const filtroDataOpcoes: { key: FiltroConsulta; label: string }[] = [
  { key: "hoje", label: "Hoje" },
  { key: "amanha", label: "Amanhã" },
  { key: "semana", label: "Esta Semana" },
];

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <Card className="flex flex-col items-center gap-4 p-4 h-60">
      <Skeleton className="size-10 rounded-full shrink-0" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-3.5 rounded" />
        <Skeleton className="h-3 rounded" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </Card>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ filtro }: { filtro: Filtro }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-surface-secondary text-fg-muted">
        <CalendarDays strokeWidth={1.5} />
      </div>
      <p className="text-sm text-fg-muted">
        {filtro === "todas"
          ? "Nenhuma consulta encontrada"
          : filtro === "a_concluir"
            ? "Nenhuma consulta passada esperando conclusão"
            : `Nenhuma consulta com status "${statusCfg[filtro as StatusConsulta]?.label}"`}
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function ConsultaScreen() {
  const [consultas, setConsultas] = useState<IConsultaDetailed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [filtroData, setFiltroData] = useState<FiltroConsulta>("nenhum");
  const [busca, setBusca] = useState("");
  const [selectedAppointment, setSelectedAppointment] =
    useState<IConsultaDetailed | null>(null);
  const consultaModal = useOverlayState();

  // Evita que uma resposta lenta e antiga sobrescreva uma mais recente
  const requestId = useRef(0);

  const handleCardClick = (id: number) => {
    const appointment = consultas.find((c) => c.id === id) ?? null;
    setSelectedAppointment(appointment);
    consultaModal.open();
  };

  // "Aguard. confirmação" e "A concluir" vão para o backend e valem para qualquer data
  const statusNoBackend = filtroNoBackend[filtro];
  const filtroApi = statusNoBackend ?? filtroDataNoBackend[filtroData];

  async function carregar(filtroAtual: DoctorAppointmentsApiFilter = filtroApi) {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchConsultas(filtroAtual);
      if (id !== requestId.current) return; // chegou uma chamada mais nova
      setConsultas(data);
    } catch (e: unknown) {
      if (id !== requestId.current) return;
      setConsultas([]);
      setError(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }

  // Refaz a chamada sempre que o filtro enviado ao backend muda (inclui a carga inicial)
  useEffect(() => {
    carregar(filtroApi);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroApi]);

  // O filtro de data é feito no backend; aqui só status, busca e ordenação
  const filtradas = useMemo(
    () =>
      consultas
        .filter((c) => filtro === "todas" || filtro === "a_concluir" || c.status === filtro)
        .filter(
          (c) =>
            busca.trim() === "" ||
            c.patientNome.toLowerCase().includes(busca.toLowerCase()),
        )
        .sort(
          (a, b) =>
            new Date(a.startDateTime).getTime() -
            new Date(b.startDateTime).getTime(),
        ),
    [consultas, filtro, busca],
  );

  // Contagens por status (refletem apenas o período carregado)
  const contagens = useMemo(() => {
    const c: Record<string, number> = { todas: consultas.length };
    for (const item of consultas) c[item.status] = (c[item.status] ?? 0) + 1;
    return c;
  }, [consultas]);

  const [view] = useState<"lista" | "grid">("lista");

  return (
    <div className="min-h-screen max-w-screen bg-surface">
      <div className="px-4 py-8 flex flex-col gap-6">
        {/* ── Header ───────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Consultas</h1>
            <p className="text-sm text-fg-muted mt-0.5">
              {loading
                ? "Carregando…"
                : `${consultas.length} consulta${consultas.length !== 1 ? "s" : ""}${
                    statusNoBackend ? " (qualquer data)" : filtroData === "nenhum" ? " nos próximos 30 dias" : ""
                  }`}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onPress={() => carregar()}
            isDisabled={loading}
            aria-label="recarregar consultas"
          >
            {loading ? <Spinner size="sm" /> : <RotateCcw />}
            Atualizar
          </Button>
        </div>

        {/* ── Busca ─────────────────────────────────────── */}
        <SearchField
          aria-label="buscar consulta"
          value={busca}
          onChange={setBusca}
          className="w-full"
        />

        <div className="flex justify-between gap-4">
          {/* ── Filtros Estado ────────────────── */}
          <ToggleButtonGroup
            selectionMode="single"
            selectedKeys={new Set([filtro])}
            onSelectionChange={(keys) => {
              const val = [...keys][0] as Filtro | undefined;
              if (val) setFiltro(val);
            }}
            className="flex flex-wrap gap-2"
          >
            {filtroOpcoes.map(({ key, label }) => (
              <ToggleButton key={key} id={key} size="sm">
                {label}
                {(contagens[key] ?? 0) > 0 && (
                  <Chip size="sm" variant="soft" className="ml-1">
                    {contagens[key]}
                  </Chip>
                )}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {/* ── Filtros Data (aplicados no backend) ────────────────── */}
          <ToggleButtonGroup
            selectionMode="single"
            selectedKeys={new Set([filtroData])}
            isDisabled={!!statusNoBackend}
            onSelectionChange={(keys) => {
              const val = [...keys][0] as FiltroConsulta | undefined;
              setFiltroData(val ?? "nenhum");
            }}
            className="flex flex-wrap gap-2"
          >
            {filtroDataOpcoes.map(({ key, label }) => (
              <ToggleButton key={key} id={key} size="sm">
                {label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>

        {/* ── Erro ──────────────────────────────────────── */}
        {error && (
          <Card className="border-danger-soft-hover bg-danger/5">
            <Card.Content className="flex items-center gap-2 p-3 text-sm text-danger">
              <CircleAlert strokeWidth={1.25} />
              {error}
            </Card.Content>
          </Card>
        )}

        {/* ── Lista ─────────────────────────────────────── */}
        {view === "grid" ? (
          <div className="w-full overflow-x-hidden">
            <ConsultaHourlyGrid consultas={filtradas} onCanceled={() => carregar()} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : error ? null : filtradas.length === 0 ? (
              <div className="col-span-full">
                <EmptyState filtro={filtro} />
              </div>
            ) : (
              filtradas.map((c) => (
                <ConsultaCard
                  key={c.id}
                  consulta={c}
                  onCardClick={() => handleCardClick(c.id)}
                />
              ))
            )}

            <ConsultaModal
              appointment={selectedAppointment}
              isOpen={consultaModal.isOpen}
              onOpenChange={consultaModal.setOpen}
              onChanged={() => carregar()}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ConsultaScreen;