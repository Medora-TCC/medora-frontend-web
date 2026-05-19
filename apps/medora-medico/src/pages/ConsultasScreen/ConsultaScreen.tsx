import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Avatar,
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

import type { ITeleConsulta, StatusConsulta } from "@medora_web/shared";

import { fetchConsultas } from "./Consulta";
import { Calendar, RotateCcw, Video } from "lucide-react";
import { ConsultaHourlyGrid } from "./Consultahourlygrid";
import openConsultaModal from "./ConsultaModal";
import ConsultaModal from "./ConsultaModal";

// ─── Types ────────────────────────────────────────────────────────────────────
type Filtro = "todas" | StatusConsulta;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function initials(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

function formatHorario(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function isHoje(iso: string) {
  const d = new Date(iso);
  const h = new Date();
  return (
    d.getDate() === h.getDate() &&
    d.getMonth() === h.getMonth() &&
    d.getFullYear() === h.getFullYear()
  );
}

function canEnter(c: ITeleConsulta): boolean {
  if (c.status !== "agendado" && c.status !== "em_atendimento") return false;
  const horario = new Date(c.dataHorario).getTime();
  const agora = Date.now();
  return agora >= horario - 15 * 60 * 1000 && agora <= horario + 10 * 60 * 1000;
}

// ─── Status config → Chip color + label ───────────────────────────────────────
const statusCfg: Record<
  StatusConsulta,
  { label: string; color: "accent" | "success" | "default" | "danger" }
> = {
  agendado: { label: "Agendada", color: "accent" },
  em_espera: { label: "Em Espera", color: "accent" },
  em_atendimento: { label: "Em andamento", color: "success" },
  finalizado: { label: "Concluída", color: "default" },
  cancelado: { label: "Cancelada", color: "danger" },
};

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

// ─── Consulta card ────────────────────────────────────────────────────────────
function ConsultaCard({
  consulta,
  onEntrar,
}: {
  consulta: ITeleConsulta;
  onEntrar: (id: string) => void;
}) {
  const cfg = statusCfg[consulta.status];
  const hoje = isHoje(consulta.dataHorario);
  const entrar = canEnter(consulta);

  return (
    <Card
      onClick={() => openConsultaModal(consulta)}
      className={`
        transition-all duration-300 shadow-md h-60
        ${
          entrar
            ? "border border-success/30 bg-success/5 hover:bg-success/10"
            : "hover:bg-surface-secondary"
        }
      `}
    >
      <Card.Content className="flex items-center justify-center flex-col gap-4 p-4">
        {/* Avatar com iniciais */}
        <Avatar size="md" color="accent">
          <Avatar.Fallback>{initials(consulta.pacienteNome)}</Avatar.Fallback>
        </Avatar>

        {/* Info */}
        <div className="flex flex-1  items-center min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium truncate">
              {consulta.pacienteNome}
            </span>

            {hoje && consulta.status === "agendado" && (
              <Chip size="sm" color="warning" variant="soft">
                hoje
              </Chip>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-fg-muted flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar />
              {formatHorario(consulta.dataHorario)}
            </span>
          </div>
        </div>

        {/* Badge status */}
        <Chip
          size="sm"
          color={cfg.color}
          variant="soft"
          className="hidden sm:flex shrink-0"
        >
          {cfg.label}
        </Chip>

        {/* Botão entrar */}
        {entrar ? (
          <Button
            size="sm"
            variant="primary"
            onPress={() => onEntrar(consulta.id)}
            className="shrink-0"
          >
            <Video />
            Entrar
          </Button>
        ) : (
          consulta.status === "agendado" && (
            <Button
              size="sm"
              variant="secondary"
              isDisabled
              className="shrink-0"
            >
              <Video />
              Entrar
            </Button>
          )
        )}
      </Card.Content>
    </Card>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ filtro }: { filtro: Filtro }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-surface-secondary text-fg-muted">
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
        </svg>
      </div>
      <p className="text-sm text-fg-muted">
        {filtro === "todas"
          ? "Nenhuma consulta encontrada"
          : `Nenhuma consulta com status "${statusCfg[filtro as StatusConsulta]?.label}"`}
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function TeleconsultaScreen() {
  const navigate = useNavigate();
  const [consultas, setConsultas] = useState<ITeleConsulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [busca, setBusca] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const state = useOverlayState();
  async function logApiReq() {
    fetch("/api/teleconsultas")
      .then((res) => res.json())
      .then(console.log); // deve logar seus dados mockados
  }

  const handleCardClick = (id: number) => {
    setSelectedId(id);
    state.open();
  };

  async function carregar() {
    setLoading(true);
    logApiReq();
    setError(null);
    try {
      setConsultas(await fetchConsultas());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const filtradas = useMemo(
    () =>
      consultas
        .filter((c) => filtro === "todas" || c.status === filtro)
        .filter(
          (c) =>
            busca.trim() === "" ||
            c.pacienteNome.toLowerCase().includes(busca.toLowerCase()),
        )
        .sort(
          (a, b) =>
            new Date(a.dataHorario).getTime() -
            new Date(b.dataHorario).getTime(),
        ),
    [consultas, filtro, busca],
  );

  // Contagens por status para os badges dos filtros
  const contagens = useMemo(() => {
    const c: Record<string, number> = { todas: consultas.length };
    for (const item of consultas) c[item.status] = (c[item.status] ?? 0) + 1;
    return c;
  }, [consultas]);

  const [view, setView] = useState<"lista" | "grid">("lista");

  const filtroOpcoes: { key: Filtro; label: string }[] = [
    { key: "todas", label: "Todas" },
    { key: "agendado", label: "Agendadas" },
    { key: "em_atendimento", label: "Em andamento" },
    { key: "finalizado", label: "Concluídas" },
    { key: "cancelado", label: "Canceladas" },
  ];

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
                : `${consultas.length} consulta${consultas.length !== 1 ? "s" : ""} no total`}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onPress={carregar}
            isDisabled={loading}
            aria-label="recarregar consultas"
          >
            {loading ? <Spinner size="sm" /> : <RotateCcw />}
            Atualizar
          </Button>

          <ToggleButtonGroup
            selectionMode="single"
            selectedKeys={new Set([view])}
            onSelectionChange={(k) => setView([...k][0] as "lista" | "grid")}
          >
            <ToggleButton id="lista" size="sm">
              Lista
            </ToggleButton>
            <ToggleButton id="grid" size="sm">
              Grid
            </ToggleButton>
          </ToggleButtonGroup>
        </div>

        {/* ── Busca ─────────────────────────────────────── */}
        <SearchField
          aria-label="buscar consulta"
          value={busca}
          onChange={setBusca}
          className="w-full"
        />

        {/* ── Filtros (ToggleButtonGroup) ────────────────── */}
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

        {/* ── Erro ──────────────────────────────────────── */}
        {error && (
          <Card className="border-danger-soft-hover bg-danger/5">
            <Card.Content className="flex items-center gap-2 p-3 text-sm text-danger">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </Card.Content>
          </Card>
        )}

        {/* ── Lista ─────────────────────────────────────── */}

        {view === "grid" ? (
          <div className="w-screen overflow-x-hidden">
            <ConsultaHourlyGrid
              consultas={filtradas}
              onEntrar={(id) => navigate(`/consulta/${id}`)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : filtradas.length === 0 ? (
              <EmptyState filtro={filtro} />
            ) : (
              filtradas.map((c) => (
                <ConsultaCard
                  key={c.id}
                  consulta={c}
                  onEntrar={(id) => navigate(`/consulta/${id}`)}
                />
              ))
            )}
            {
              <ConsultaModal
                id={selectedId}
                isOpen={state.isOpen}
                onOpenChange={state.setOpen}
              />
            }
          </div>
        )}
      </div>
    </div>
  );
}

export default TeleconsultaScreen;
