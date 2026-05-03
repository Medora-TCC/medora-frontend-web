import { useMemo } from "react";
import { Avatar, Button, Chip } from "@heroui/react";
import { Video } from "lucide-react";
import type { IConsulta, StatusConsulta } from "@medora_web/shared";

// ─── Re-usa helpers e config do projeto ────────────────────────────────────────

function initials(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

function canEnter(c: IConsulta): boolean {
  if (c.status !== "agendado" && c.status !== "em_atendimento") return false;
  const horario = new Date(c.dataHorario).getTime();
  const agora = Date.now();
  return agora >= horario - 15 * 60 * 1000 && agora <= horario + 10 * 60 * 1000;
}

const statusCfg: Record<
  StatusConsulta,
  { label: string; color: "accent" | "success" | "default" | "danger" | "warning" }
> = {
  agendado:       { label: "Agendada",     color: "accent"  },
  em_espera:      { label: "Em Espera",    color: "warning" },
  em_atendimento: { label: "Em andamento", color: "success" },
  finalizado:     { label: "Concluída",    color: "default" },
  cancelado:      { label: "Cancelada",    color: "danger"  },
};

// Mapeamento de status → classes Tailwind para os blocos no grid
const statusBlock: Record<
  StatusConsulta,
  { bg: string; border: string; text: string; muted: string }
> = {
  agendado:       { bg: "bg-accent/10",   border: "border-accent/30",   text: "text-accent-fg",   muted: "text-accent/70"   },
  em_espera:      { bg: "bg-warning/10",  border: "border-warning/30",  text: "text-warning-fg",  muted: "text-warning/70"  },
  em_atendimento: { bg: "bg-success/10",  border: "border-success/30",  text: "text-success-fg",  muted: "text-success/70"  },
  finalizado:     { bg: "bg-surface-secondary", border: "border-border", text: "text-fg",         muted: "text-fg-muted"    },
  cancelado:      { bg: "bg-danger/5",    border: "border-danger/20",   text: "text-danger",      muted: "text-danger/60"   },
};

// ─── Constantes de layout ──────────────────────────────────────────────────────

const ROW_H   = 64;  // px por hora
const COL_W   = 140; // px por hora
const LABEL_W = 52;  // px da coluna de labels

// ─── Helpers de posicionamento ────────────────────────────────────────────────

function toMin(iso: string) {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

function toPx(minutes: number, startHour: number) {
  return ((minutes - startHour * 60) / 60) * ROW_H;
}

// Duração padrão assumida quando não há campo `duracao` (30 min)
const DEFAULT_DURATION_MIN = 30;

/**
 * Detecta sobreposições e retorna col / totalCols por consulta.
 * Cada "faixa" de tempo sobreposta forma um grupo; dentro do grupo
 * as consultas são distribuídas em colunas paralelas.
 */
function detectOverlaps(
  consultas: IConsulta[],
  durationMin: number,
): Record<string, { col: number; totalCols: number }> {
  const sorted = [...consultas].sort(
    (a, b) => toMin(a.dataHorario) - toMin(b.dataHorario),
  );

  const cols: number[] = []; // cada item guarda o endMin da última consulta na coluna
  const result: Record<string, { col: number; totalCols: number }> = {};

  for (const c of sorted) {
    const startM = toMin(c.dataHorario);
    const endM   = startM + ((c as any).duracao ?? durationMin);
    let placed = false;

    for (let i = 0; i < cols.length; i++) {
      if (cols[i] <= startM) {
        cols[i] = endM;
        result[c.id] = { col: i, totalCols: 0 };
        placed = true;
        break;
      }
    }

    if (!placed) {
      cols.push(endM);
      result[c.id] = { col: cols.length - 1, totalCols: 0 };
    }
  }

  const total = cols.length;
  for (const id in result) result[id].totalCols = total;
  return result;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ConsultaHourlyGridProps {
  consultas: IConsulta[];
  /** Hora inicial do grid (padrão 7) */
  startHour?: number;
  /** Hora final do grid (padrão 20) */
  endHour?: number;
  /** Duração padrão em minutos quando não informada na consulta (padrão 30) */
  defaultDuration?: number;
  onEntrar: (id: string) => void;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ConsultaHourlyGrid({
  consultas,
  startHour = 7,
  endHour = 20,
  defaultDuration = DEFAULT_DURATION_MIN,
  onEntrar,
}: ConsultaHourlyGridProps) {
  const hours = useMemo(
    () => Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i),
    [startHour, endHour],
  );

  const totalH = hours.length * ROW_H;
  const totalW = hours.length * COL_W;

  // Filtra consultas que estão dentro do range de horas visível
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

  // Linha de "agora"
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const startMin = startHour * 60;
  const endMin   = endHour * 60;
  const showNow  = nowMin >= startMin && nowMin <= endMin;
  const nowLeft  = ((nowMin - startMin) / 60) * COL_W;

  return (
    <div className="w-screen overflow-x-auto rounded-xl border border-border bg-surface">
      <div style={{ minWidth: LABEL_W + totalW }}>

        {/* ── Header de horas ─────────────────────────────── */}
        <div className="flex border-b border-border sticky top-0 z-20 bg-surface">
          {/* canto vazio */}
          <div
            className="shrink-0 border-r border-border"
            style={{ width: LABEL_W }}
          />
          {hours.map((h) => (
            <div
              key={h}
              className="shrink-0 flex items-center justify-center text-xs text-fg-muted border-r border-border last:border-r-0"
              style={{ width: COL_W, height: 36 }}
            >
              {String(h).padStart(2, "0")}:00
            </div>
          ))}
        </div>

        {/* ── Corpo ───────────────────────────────────────── */}
        <div className="flex">

          {/* Labels de hora (eixo Y) */}
          <div
            className="shrink-0 border-r border-border"
            style={{ width: LABEL_W }}
          >
            {hours.map((h) => (
              <div
                key={h}
                className="flex items-start justify-end pr-2 pt-1 text-[11px] text-fg-subtle border-b border-border/50"
                style={{ height: ROW_H }}
              >
                {String(h).padStart(2, "0")}h
              </div>
            ))}
          </div>

          {/* Área de eventos */}
          <div className="relative" style={{ width: totalW, height: totalH }}>

            {/* Grade de fundo zebrada */}
            <div className="absolute inset-0 flex pointer-events-none">
              {hours.map((_, i) => (
                <div
                  key={i}
                  className={`shrink-0 border-r border-border/40 ${
                    i % 2 === 1 ? "bg-surface-secondary/40" : ""
                  }`}
                  style={{ width: COL_W, height: totalH }}
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
                className="absolute top-0 bottom-0 z-10 pointer-events-none"
                style={{ left: nowLeft }}
              >
                <div className="absolute inset-y-0 w-px bg-danger/70" />
                <div className="absolute -top-1 -left-0.75 size-2 rounded-full bg-danger" />
              </div>
            )}

            {/* Eventos REMINDER: COMPONENTIZAR*/}
            {visible.map((c) => {
              const startM    = toMin(c.dataHorario);
              const duration  = (c as any).duracao ?? defaultDuration;
              const endM      = startM + duration;
              const top       = toPx(startM, startHour);
              const height    = Math.max(toPx(endM, startHour) - top, 70);
              const cfg       = statusBlock[c.status];
              const chipCfg   = statusCfg[c.status];
              const { col, totalCols } = layout[c.id];
              const colW      = (totalW - 4) / totalCols;
              const left      = ((startM - startMin) / 60) * COL_W + col * colW + 2;
              const entrar    = canEnter(c);
              const tall      = height >= 48;

              return (
                <div
                  key={c.id}
                  className={`
                    absolute rounded-lg border overflow-hidden
                    transition-opacity hover:opacity-90
                    ${cfg.bg} ${cfg.border}
                    ${entrar ? "ring-1 ring-success/50 shadow-sm" : ""}
                  `}
                  style={{
                    top:    top,
                    left,
                    width:  colW - 4,
                    height: height - 6,
                  }}
                >
                  <div className="flex flex-col h-full px-2 py-1 gap-0.5 overflow-hidden">

                    {/* Nome do paciente */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Avatar color="accent" className="shrink-0">
                        <Avatar.Fallback className="text-[9px]">
                          {initials(c.pacienteNome)}
                        </Avatar.Fallback>
                      </Avatar>
                      <span
                        className={`text-[11px] font-medium truncate leading-tight ${cfg.text}`}
                      >
                        {c.pacienteNome}
                      </span>
                    </div>

                    {/* Horário (só se houver espaço) */}
                    {tall && (
                      <span className={`text-[10px] leading-tight ${cfg.muted}`}>
                        {new Date(c.dataHorario).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {" · "}
                        {duration} min
                      </span>
                    )}

                    {/* Badge status + botão (só se bem alto) */}
                    {tall && (
                      <div className="flex items-center gap-1 mt-auto flex-wrap">
                        <Chip size="sm" color={chipCfg.color} variant="soft">
                          {chipCfg.label}
                        </Chip>

                        {entrar && (
                          <Button
                            size="sm"
                            variant="primary"
                            className="h-5 px-1.5 text-[10px] ml-auto"
                            onPress={() => onEntrar(c.id)}
                          >
                            <Video className="size-3" />
                            Entrar
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}