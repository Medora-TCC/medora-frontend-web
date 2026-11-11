import { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Card,
  Dropdown,
  Label,
  SearchField,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  useOverlayState,
} from "@heroui/react";
import { CalendarDays, ChevronDown, CircleAlert, ListFilter, RotateCcw } from "lucide-react";

import type {
  FiltroConsulta,
  IConsultaDetailed,
  StatusConsulta,
} from "@medora_web/shared";

import { fetchConsultas, type DoctorAppointmentsApiFilter } from "../../api/services/Appointment";
import ConsultaModal from "../../components/Consulta/ConsultaModal";
import { ConsultaCard } from "./ConsultaCard";

// ─── Tipos e constantes ───────────────────────────────────────────────────────

// "a_concluir" não é um status real do backend: é um filtro derivado
// (consulta aberta + horário já passado) aplicado aqui no front.
type Filtro = "todas" | "a_concluir" | StatusConsulta;

const filtroDataNoBackend: Record<FiltroConsulta, DoctorAppointmentsApiFilter> = {
  hoje: "Today",
  amanha: "Tomorrow",
  semana: "Week",
  nenhum: "None",
};

const statusLabel: Record<StatusConsulta, string> = {
  agendado: "Agendada",
  esperando_pagamento: "Aguardando Pagamento",
  esperando_confirmacao: "Aguardando Confirmação",
  confirmado: "Confirmada",
  em_atendimento: "Em andamento",
  finalizado: "Concluída",
  cancelado: "Cancelada",
  ausente: "Ausente",
};

const filtroOpcoes: { key: Filtro; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "a_concluir", label: "A concluir" },
  { key: "agendado", label: "Agendadas" },
  { key: "esperando_pagamento", label: "Aguard. pagamento" },
  { key: "esperando_confirmacao", label: "Aguard. confirmação" },
  { key: "confirmado", label: "Confirmadas" },
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

// Status em que a consulta ainda está aberta. Se o horário já passou e ela continua assim,
// o médico precisa concluí-la (ou registrar falta).
const STATUS_ABERTOS: StatusConsulta[] = ["agendado", "confirmado", "em_atendimento"];

// Regra única de "consulta apagada" (muted): cancelada OU já passada (tolerância de 15 min).
// Exceção: `em_atendimento` nunca é muted, pois já começou mas é a mais importante no momento.
function isMuted(c: IConsultaDetailed, now: number) {
  if (c.status === "cancelado") return true;
  if (c.status === "em_atendimento") return false;

  const fifteenMinutesAgo = now - 15 * 60 * 1000;
  return new Date(c.startDateTime).getTime() < fifteenMinutesAgo;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
// Mesmo formato do ConsultaCard (vertical e quadrado) para a lista não "pular" ao carregar.
function SkeletonCard() {
  return (
    <Card className="flex flex-col items-center gap-4 p-4 min-h-56 md:min-h-0 md:aspect-square">
      <Skeleton className="size-10 rounded-full shrink-0" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-3.5 rounded" />
        <Skeleton className="h-3 rounded" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </Card>
  );
}

// ─── Estado vazio ─────────────────────────────────────────────────────────────
function EmptyState({ filtro, temBusca }: { filtro: Filtro; temBusca: boolean }) {
  const mensagem = temBusca
    ? "Nenhuma consulta encontrada para essa busca"
    : filtro === "todas"
      ? "Nenhuma consulta encontrada"
      : filtro === "a_concluir"
        ? "Nenhuma consulta a concluir"
        : `Nenhuma consulta com status "${statusLabel[filtro]}"`;

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-surface-secondary text-fg-muted">
        <CalendarDays strokeWidth={1.5} />
      </div>
      <p className="text-sm text-fg-muted">{mensagem}</p>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────
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

  // "Agora" como estado (atualizado a cada minuto) em vez de Date.now() no render: a ordenação e o
  // visual muted se atualizam sozinhos quando uma consulta passa do horário.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  // Evita que uma resposta lenta e antiga sobrescreva uma mais recente.
  const requestId = useRef(0);

  // Filtros enviados ao backend: período e status. "todas" e "a_concluir" não enviam status
  // ("a_concluir" é refinado no front sobre a lista completa).
  const filtroApi = filtroDataNoBackend[filtroData];
  const statusApi: StatusConsulta | undefined =
    filtro === "todas" || filtro === "a_concluir" ? undefined : filtro;

  async function carregar(
    periodo: DoctorAppointmentsApiFilter = filtroApi,
    status: StatusConsulta | undefined = statusApi,
  ) {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);

    try {
      const data = await fetchConsultas(periodo, status);
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

  // Recarrega sempre que um filtro enviado ao backend muda (período ou status; inclui a carga inicial).
  useEffect(() => {
    carregar(filtroApi, statusApi);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroApi, statusApi]);

  // No front ficam apenas: filtro derivado "a_concluir", busca por nome e ordenação.
  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return (
      consultas
        .filter((c) => {
          if (filtro !== "a_concluir") return true;
          return (
            STATUS_ABERTOS.includes(c.status as StatusConsulta) &&
            new Date(c.startDateTime).getTime() < now
          );
        })
        .filter((c) => termo === "" || c.patientNome.toLowerCase().includes(termo))
        // Ativas/futuras primeiro (da mais próxima para a mais distante); "muted" (passadas e
        // canceladas) por último, da mais recente para a mais antiga.
        .sort((a, b) => {
          const ma = isMuted(a, now);
          const mb = isMuted(b, now);
          if (ma !== mb) return ma ? 1 : -1;
          const ta = new Date(a.startDateTime).getTime();
          const tb = new Date(b.startDateTime).getTime();
          return ma ? tb - ta : ta - tb;
        })
    );
  }, [consultas, filtro, busca, now]);

  const filtroAtual = filtroOpcoes.find((o) => o.key === filtro) ?? filtroOpcoes[0];

  const handleCardClick = (id: number) => {
    setSelectedAppointment(consultas.find((c) => c.id === id) ?? null);
    consultaModal.open();
  };

  return (
    <div className="min-h-screen max-w-screen bg-surface">
      <div className="px-4 py-8 flex flex-col gap-6">
        {/* ── Cabeçalho ─────────────────────────────────── */}
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Consultas</h1>
          <p className="text-sm text-fg-muted mt-0.5">
            {loading
              ? "Carregando…"
              : `${filtradas.length} consulta${filtradas.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* ── Busca ─────────────────────────────────────── */}
        <SearchField
          aria-label="Buscar consulta"
          value={busca}
          onChange={setBusca}
          className="w-full"
        />

        {/* ── Filtros ───────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Status (filtrado no backend, exceto "A concluir") */}
          <Dropdown>
            <Button variant="outline" size="sm" aria-label="Filtrar por status">
              <ListFilter className="size-4" />
              {filtroAtual.label}
              <ChevronDown className="size-4" />
            </Button>
            <Dropdown.Popover>
              <Dropdown.Menu
                selectionMode="single"
                selectedKeys={new Set([filtro])}
                onSelectionChange={(keys) => {
                  if (keys === "all") return;
                  const val = [...keys][0] as Filtro | undefined;
                  if (val) setFiltro(val);
                }}
              >
                {filtroOpcoes.map(({ key, label }) => (
                  <Dropdown.Item key={key} id={key} textValue={label}>
                    <Label>{label}</Label>
                    <Dropdown.ItemIndicator />
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>

          {/* Período (filtrado no backend) + Atualizar */}
          <div className="flex items-center gap-2">
            <ToggleButtonGroup
              selectionMode="single"
              selectedKeys={new Set([filtroData])}
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

            <Button
              variant="ghost"
              size="sm"
              isIconOnly
              onPress={() => carregar()}
              isDisabled={loading}
              aria-label="Atualizar consultas"
            >
              <span title="Atualizar consultas" className="inline-flex">
                <RotateCcw className={`size-4 ${loading ? "animate-spin" : ""}`} />
              </span>
            </Button>
          </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {loading ? (
            Array.from({ length: 4 }, (_, i) => <SkeletonCard key={i} />)
          ) : error ? null : filtradas.length === 0 ? (
            <div className="col-span-full">
              <EmptyState filtro={filtro} temBusca={busca.trim() !== ""} />
            </div>
          ) : (
            filtradas.map((c) => (
              <ConsultaCard
                key={c.id}
                consulta={c}
                muted={isMuted(c, now)}
                onCardClick={() => handleCardClick(c.id)}
              />
            ))
          )}
        </div>
      </div>

      <ConsultaModal
        appointment={selectedAppointment}
        isOpen={consultaModal.isOpen}
        onOpenChange={consultaModal.setOpen}
        onChanged={() => carregar()}
      />
    </div>
  );
}

export default ConsultaScreen;