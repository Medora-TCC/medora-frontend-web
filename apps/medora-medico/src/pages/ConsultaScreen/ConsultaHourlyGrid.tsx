import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Avatar, Button, Chip, useOverlayState } from "@heroui/react";
import { Video } from "lucide-react";
import type { IConsultaDetailed, StatusConsulta } from "@medora_web/shared";
import ConsultaModal from "./ConsultaModal";
import { canEnter, enterConsulta, PatientInitials } from "./ConsultaHelpers";
import { useNavigate } from "react-router";

const navigate = useNavigate();

// ─── Configurações de status ──────────────────────────────────────────────────

const STATUS_CHIP_CFG: Record<
  StatusConsulta,
  { label: string; color: "accent" | "success" | "default" | "danger" | "warning" }
> = {
  agendado:       { label: "Agendada",     color: "accent"   },
  em_espera:      { label: "Em Espera",    color: "warning"  },
  em_atendimento: { label: "Em andamento", color: "success"  },
  finalizado:     { label: "Concluída",    color: "default"  },
  cancelado:      { label: "Cancelada",    color: "danger"   },
};

const STATUS_BLOCK_CFG: Record<
  StatusConsulta,
  { bg: string; border: string; text: string; muted: string }
> = {
  agendado:       { bg: "bg-accent/10",         border: "border-accent/30",   text: "text-accent-fg",  muted: "text-accent/70"  },
  em_espera:      { bg: "bg-warning/10",        border: "border-warning/30",  text: "text-warning-fg", muted: "text-warning/70" },
  em_atendimento: { bg: "bg-success/10",        border: "border-success/30",  text: "text-success-fg", muted: "text-success/70" },
  finalizado:     { bg: "bg-surface-secondary", border: "border-border",      text: "text-fg",         muted: "text-fg-muted"   },
  cancelado:      { bg: "bg-danger/5",          border: "border-danger/20",   text: "text-danger",     muted: "text-danger/60"  },
};

// ─── Constantes de layout ─────────────────────────────────────────────────────

/** Altura (px) de cada linha de hora */
const ROW_H = 56;
/** Largura (px) mínima por coluna de dia — usada apenas como fallback antes da medição */
const MIN_COL_W = 80;
/** Largura (px) da coluna de labels de hora */
const LABEL_W = 44;
/** Duração padrão em minutos quando não informada na consulta */
const DEFAULT_DURATION_MIN = 30;
/** Dias da semana em pt-BR */
const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

// ─── Helpers de posicionamento ────────────────────────────────────────────────

function toMin(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

function toPx(minutes: number, startHour: number): number {
  return ((minutes - startHour * 60) / 60) * ROW_H;
}

/**
 * Detecta sobreposições e retorna `col` / `totalCols` por consulta.
 * Cada faixa de tempo sobreposta forma um grupo; dentro do grupo
 * as consultas são distribuídas em colunas paralelas.
 */
function detectOverlaps(
  consultas: IConsultaDetailed[],
  durationMin: number,
): Record<string, { col: number; totalCols: number }> {
  const sorted = [...consultas].sort(
    (a, b) => toMin(a.dataHorario) - toMin(b.dataHorario),
  );

  const colEnds: number[] = [];
  const result: Record<string, { col: number; totalCols: number }> = {};

  for (const c of sorted) {
    const startM = toMin(c.dataHorario);
    const endM   = startM + ((c as any).duracao ?? durationMin);
    let placed   = false;

    for (let i = 0; i < colEnds.length; i++) {
      if (colEnds[i] <= startM) {
        colEnds[i]   = endM;
        result[c.id] = { col: i, totalCols: 0 };
        placed        = true;
        break;
      }
    }

    if (!placed) {
      colEnds.push(endM);
      result[c.id] = { col: colEnds.length - 1, totalCols: 0 };
    }
  }

  const total = colEnds.length;
  for (const id in result) result[id].totalCols = total;
  return result;
}

// ─── Sub-componente: Card de consulta ─────────────────────────────────────────

interface ConsultaCardProps {
  consulta: IConsultaDetailed;
  top: number;
  left: number;
  width: number;
  height: number;
  onClick: (id: string) => void;
}

function ConsultaCard({ consulta: c, top, left, width, height, onClick }: ConsultaCardProps) {
  const cfg      = STATUS_BLOCK_CFG[c.status];
  const chipCfg  = STATUS_CHIP_CFG[c.status];
  const entrar   = canEnter(c);
  const duration = (c as any).duracao ?? DEFAULT_DURATION_MIN;

  /** Mostrar horário e duração */
  const isTall  = height >= 52;
  /** Mostrar badge de status e botão */
  const isXTall = height >= 76;

  const dateDay = new Date(c.dataHorario).getDay();

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Consulta de ${c.pacienteNome}`}
      className={[
        "absolute rounded-md border overflow-hidden select-none",
        "transition-all duration-150 hover:opacity-90 hover:shadow-md cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        cfg.bg,
        cfg.border,
        entrar ? "ring-1 ring-success/50 shadow-sm" : "",
      ].join(" ")}
      style={{ top, left, width, height: height - 4 }}
      onClick={() => onClick(c.id)}
      onKeyDown={(e) => e.key === "Enter" && onClick(c.id)}
    >
      <div className="flex flex-col h-full px-1.5 py-1 gap-0.5 overflow-hidden">
        {/* Nome do paciente */}
        <div className="flex items-center gap-1 min-w-0">
          <Avatar color="accent" className="size-4 shrink-0">
            <Avatar.Fallback className="text-[8px]">
              {PatientInitials(c.pacienteNome)}
            </Avatar.Fallback>
          </Avatar>
          <span className={`text-[10px] font-medium truncate leading-tight ${cfg.text}`}>
            {c.pacienteNome}
            {" "}
            <span className="font-normal opacity-60">{WEEK_DAYS[dateDay]}</span>
          </span>
        </div>

        {/* Horário e duração */}
        {isTall && (
          <span className={`text-[9px] leading-tight ${cfg.muted}`}>
            {new Date(c.dataHorario).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" · "}
            {duration} min
          </span>
        )}

        {/* Badge de status + botão de entrar */}
        {isXTall && (
          <div className="flex items-center gap-1 mt-auto flex-wrap">
            <Chip size="sm" color={chipCfg.color} variant="soft" className="text-[9px] h-4 px-1">
              {chipCfg.label}
            </Chip>

            {entrar && (
              <Button
                size="sm"
                variant="primary"
                className="h-4 px-1.5 text-[9px] ml-auto gap-0.5"
                onPress={(e) => {
                  e.continuePropagation?.();
                  enterConsulta(c.id, navigate);
                }}
              >
                <Video className="size-2.5" />
                Iniciar
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Props do componente principal ───────────────────────────────────────────

interface ConsultaHourlyGridProps {
  consultas: IConsultaDetailed[];
  /** Hora inicial do grid — deve vir das configurações do médico */
  startHour?: number;
  /** Hora final do grid — deve vir das configurações do médico */
  endHour?: number;
  /** Dia inicial da semana exibido (0 = Dom, 1 = Seg …) */
  startDay?: number;
  /** Dia final da semana exibido */
  endDay?: number;
  /** Duração padrão em minutos quando não informada na consulta */
  defaultDuration?: number;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ConsultaHourlyGrid({
  consultas,
  startHour     = 8,
  endHour       = 18,
  startDay      = 1,
  endDay        = 5,
  defaultDuration = DEFAULT_DURATION_MIN,
}: ConsultaHourlyGridProps) {
  const consultaModal = useOverlayState();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ── Medição da largura disponível para os dias ─────────────────────────────
  // Usamos um ResizeObserver no container para calcular colW dinamicamente,
  // garantindo que as colunas preencham toda a largura disponível.

  const containerRef    = useRef<HTMLDivElement>(null);
  const [areaW, setAreaW] = useState(0);

  const measureArea = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setAreaW(el.getBoundingClientRect().width - LABEL_W);
  }, []);

  useEffect(() => {
    measureArea();
    const ro = new ResizeObserver(measureArea);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [measureArea]);

  // ── Dados derivados ────────────────────────────────────────────────────────

  const numDays = endDay - startDay + 1;

  /** Largura por coluna de dia: preenche a área disponível, respeitando mínimo */
  const colW = areaW > 0
    ? Math.max(areaW / numDays, MIN_COL_W)
    : MIN_COL_W;

  const totalW = colW * numDays;

  const hours = useMemo(
    () => Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i),
    [startHour, endHour],
  );

  const days = useMemo(
    () => WEEK_DAYS.slice(startDay, endDay + 1),
    [startDay, endDay],
  );

  const totalH = hours.length * ROW_H;

  const visible = useMemo(
    () =>
      consultas.filter((c) => {
        const h = new Date(c.dataHorario).getHours();
        return h >= startHour && h <= endHour;
      }),
    [consultas, startHour, endHour],
  );

  const layout = useMemo(
    () => detectOverlaps(visible, defaultDuration),
    [visible, defaultDuration],
  );

  // ── Linha de "agora" ───────────────────────────────────────────────────────

  const now      = new Date();
  const nowMin   = now.getHours() * 60 + now.getMinutes();
  const startMin = startHour * 60;
  const endMin   = endHour   * 60;
  const showNow  = nowMin >= startMin && nowMin <= endMin;
  const nowTop   = toPx(nowMin, startHour);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleCardClick = (id: string) => {
    setSelectedId(id);
    consultaModal.open();
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className="flex flex-col w-full h-full min-h-0 rounded-xl border border-border bg-surface overflow-hidden"
    >
      {/* Wrapper com scroll apenas vertical (horizontal não deve aparecer pois as colunas preenchem a tela) */}
      <div className="overflow-y-auto overflow-x-hidden flex-1 min-h-0">
        {/* Largura mínima garante scroll horizontal em telas muito estreitas */}
        <div style={{ minWidth: LABEL_W + numDays * MIN_COL_W }}>

          {/* ── Header de dias (eixo X) ──────────────────────────────── */}
          <div className="flex border-b border-border sticky top-0 z-20 bg-surface">
            {/* Canto vazio acima dos labels de hora */}
            <div className="shrink-0 border-r border-border" style={{ width: LABEL_W }} />

            {days.map((day) => (
              <div
                key={day}
                className="flex h-7 items-center justify-center text-[11px] font-medium text-fg-muted border-r border-border last:border-r-0"
                style={{ width: colW }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* ── Corpo ────────────────────────────────────────────────── */}
          <div className="flex">
            {/* Labels de hora (eixo Y) */}
            <div className="shrink-0 border-r border-border" style={{ width: LABEL_W }}>
              {hours.map((h) => (
                <div
                  key={h}
                  className="flex items-start justify-end pr-1.5 pt-0.5 text-[10px] text-fg-subtle border-b border-border/40"
                  style={{ height: ROW_H }}
                >
                  {String(h).padStart(2, "0")}h
                </div>
              ))}
            </div>

            {/* Área de eventos */}
            <div className="relative" style={{ width: totalW, height: totalH }}>

              {/* Grade de fundo zebrada por coluna */}
              <div className="absolute inset-0 flex pointer-events-none">
                {days.map((_, i) => (
                  <div
                    key={i}
                    className={`shrink-0 border-r border-border/40 ${i % 2 === 1 ? "bg-surface-secondary/40" : ""}`}
                    style={{ width: colW, height: totalH }}
                  />
                ))}
              </div>

              {/* Linhas horizontais por hora */}
              <div className="absolute inset-0 pointer-events-none">
                {hours.map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-full border-b border-border/30"
                    style={{ top: (i + 1) * ROW_H }}
                  />
                ))}
              </div>

              {/* Linha de "agora" */}
              {showNow && (
                <div
                  className="absolute left-0 right-0 z-10 pointer-events-none"
                  style={{ top: nowTop }}
                >
                  <div className="w-full h-px bg-danger/70" />
                  <div className="absolute -top-1 left-0 size-2 rounded-full bg-danger" />
                </div>
              )}

              {/* Cards de consulta */}
              {visible.map((c) => {
                const startM   = toMin(c.dataHorario);
                const duration = (c as any).duracao ?? defaultDuration;
                const endM     = startM + duration;
                const top      = toPx(startM, startHour);
                const height   = Math.max(toPx(endM, startHour) - top, 44);
                const { col, totalCols } = layout[c.id];
                const cardColW = colW / Math.max(totalCols, 1);
                const dateDay  = new Date(c.dataHorario).getDay();
                const left     = (dateDay - startDay) * colW + col * cardColW + 2;

                return (
                  <ConsultaCard
                    key={c.id}
                    consulta={c}
                    top={top}
                    left={left}
                    width={cardColW - 4}
                    height={height}
                    onClick={handleCardClick}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de detalhes */}
      <ConsultaModal
        id={selectedId}
        isOpen={consultaModal.isOpen}
        onOpenChange={consultaModal.setOpen}
      />
    </div>
  );
}