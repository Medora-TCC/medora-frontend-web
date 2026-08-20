import { useEffect, useMemo, useState } from "react";
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

import type { IConsultaDetailed, StatusConsulta } from "@medora_web/shared";

import { fetchConsultas } from "./Consulta";
import { CalendarDays, CircleAlert, RotateCcw } from "lucide-react";
import { ConsultaHourlyGrid } from "./ConsultaHourlyGrid";
import ConsultaModal from "../../components/Consulta/ConsultaModal";
import { ConsultaCard } from "./ConsultaCard";

// ─── Types ────────────────────────────────────────────────────────────────────
type Filtro = "todas" | StatusConsulta;
type FiltroData = "hoje" | "amanha" | "semana" | "nenhum";

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


// ─── Consulta card componentizar ────────────────────────────────────────────────────────────

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ filtro }: { filtro: Filtro }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-surface-secondary text-fg-muted">
        <CalendarDays strokeWidth={1.50} />
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
export function ConsultaScreen() {
  const [consultas, setConsultas] = useState<IConsultaDetailed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [filtroData, setFiltroData] = useState<FiltroData>("nenhum");
  const [busca, setBusca] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const consultaModal = useOverlayState();

  async function logApiReq() {
    fetch("/api/teleconsultas")
      .then((res) => res.json())
      .then(console.log); // REMINDER deve logar seus dados mockados
  }

  const handleCardClick = (id: string) => {
    setSelectedId(id);
    consultaModal.open();
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
            c.patientNome.toLowerCase().includes(busca.toLowerCase()),
        )
        .filter((c) => {
          if (filtroData === "nenhum") return true;

          const data = new Date(c.startDateTime);
          const hoje = new Date();

          if (filtroData === "hoje") {
            return data.toDateString() === hoje.toDateString();
          }

          if (filtroData === "amanha") {
            const amanha = new Date(hoje);
            amanha.setDate(hoje.getDate() + 1);
            return data.toDateString() === amanha.toDateString();
          }

          if (filtroData === "semana") {
            const inicioSemana = new Date(hoje);
            inicioSemana.setDate(hoje.getDate() - hoje.getDay());
            inicioSemana.setHours(0, 0, 0, 0);
            return data >= inicioSemana;
          }

          return true;
        })
        .sort(
          (a, b) =>
            new Date(a.startDateTime).getTime() -
            new Date(b.startDateTime).getTime(),
        ),
    [consultas, filtro, busca, filtroData],
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

  const filtroDataOpcoes: { key: FiltroData; label: string }[] = [
    { key: "hoje", label: "Hoje" },
    { key: "amanha", label: "Amanhã" },
    { key: "semana", label: "Esta Semana" },
    { key: "nenhum", label: "Nenhum" }
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

          {/* <ToggleButtonGroup
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
          </ToggleButtonGroup> */}
        </div>

        {/* ── Busca ─────────────────────────────────────── */}
        <SearchField
          aria-label="buscar consulta"
          value={busca}
          onChange={setBusca}
          className="w-full"
        />
      <div className="flex justify-between">
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

        {/* ── Filtros Data ────────────────── */}
        <ToggleButtonGroup
          selectionMode="single"
          selectedKeys={new Set([filtroData])}
          onSelectionChange={(keys) => {
            const val = [...keys][0] as FiltroData | undefined;
            setFiltroData(val ?? "nenhum");
          }}
          className="flex flex-wrap gap-2"
        >
          {filtroDataOpcoes
            .filter(({ key }) => key !== "nenhum")
            .map(({ key, label }) => (
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
      </div>

        {/* ── Erro ──────────────────────────────────────── */}
        {error && (
          <Card className="border-danger-soft-hover bg-danger/5">
            <Card.Content className="flex items-center gap-2 p-3 text-sm text-danger">
              <CircleAlert strokeWidth={1.25} />
              {error} 
              {/* REMINDER não está esvaizando as consutlas quando dá erro.*/}
            </Card.Content>
          </Card>
        )}

        {/* ── Lista ─────────────────────────────────────── */}

        {view === "grid" ? (
          <div className="w-full overflow-x-hidden">
            <ConsultaHourlyGrid
              consultas={filtradas}
            />
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
            ) : filtradas.length === 0 ? (
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
            {
              <ConsultaModal
                id={selectedId}
                isOpen={consultaModal.isOpen}
                onOpenChange={consultaModal.setOpen}
              />
            }
          </div>
        )}
      </div>
    </div>
  );
}

export default ConsultaScreen;
