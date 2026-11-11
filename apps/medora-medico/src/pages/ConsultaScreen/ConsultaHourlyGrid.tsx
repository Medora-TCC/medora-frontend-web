import { useEffect, useMemo, useState } from "react";
import { Avatar, Button, Chip, useOverlayState } from "@heroui/react";
import { ChevronLeft, ChevronRight, Video } from "lucide-react";
import type { IConsultaDetailed, StatusConsulta } from "@medora_web/shared";
import { canEnter, enterConsulta, isTeleConsulta, PatientInitials } from "./ConsultaHelpers";
import { useNavigate } from "react-router";
import ConsultaModal from "../../components/Consulta/ConsultaModal";

// ─── Configuração de status ───────────────────────────────────────────────────

// CLAUDE [Refactor]: antes eram DOIS mapas (STATUS_CHIP_CFG e STATUS_BLOCK_CFG) com as mesmas 8
// chaves, que precisavam ser editados juntos. Agora é um mapa só: adicionar/alterar um status
// é mexer em um lugar. O tipo `Record<StatusConsulta, ...>` faz o TypeScript reclamar se algum
// status ficar sem configuração.
type ChipColor = "accent" | "success" | "default" | "danger" | "warning";
interface StatusStyle {
  label: string;
  chip: ChipColor;
  bg: string;
  border: string;
  text: string;
  muted: string;
}

const STATUS_CFG: Record<StatusConsulta, StatusStyle> = {
  agendado:              { label: "Agendada",               chip: "accent",  bg: "bg-accent/10",         border: "border-accent/30",  text: "text-accent-fg",  muted: "text-accent/70"  },
  esperando_pagamento:   { label: "Aguardando pagamento",   chip: "warning", bg: "bg-warning/10",        border: "border-warning/30", text: "text-warning-fg", muted: "text-warning/70" },
  esperando_confirmacao: { label: "Aguardando confirmação", chip: "warning", bg: "bg-warning/10",        border: "border-warning/30", text: "text-warning-fg", muted: "text-warning/70" },
  confirmado:            { label: "Confirmada",             chip: "accent",  bg: "bg-accent/10",         border: "border-accent/30",  text: "text-accent-fg",  muted: "text-accent/70"  },
  em_atendimento:        { label: "Em andamento",           chip: "success", bg: "bg-success/10",        border: "border-success/30", text: "text-success-fg", muted: "text-success/70" },
  finalizado:            { label: "Concluída",              chip: "default", bg: "bg-surface-secondary", border: "border-border",     text: "text-fg",         muted: "text-fg-muted"   },
  cancelado:             { label: "Cancelada",              chip: "danger",  bg: "bg-danger/5",          border: "border-danger/20",  text: "text-danger",     muted: "text-danger/60"  },
  ausente:               { label: "Ausente",                chip: "danger",  bg: "bg-danger/5",          border: "border-danger/20",  text: "text-danger",     muted: "text-danger/60"  },
};

// ─── Constantes de layout ─────────────────────────────────────────────────────

/** Altura (px) de cada linha de hora */
const ROW_H = 56;
/** Largura (px) da coluna de labels de hora */
const LABEL_W = 44;
/** Largura (px) mínima por coluna de dia; abaixo disso a grade ganha scroll horizontal */
const MIN_COL_W = 80;
/** Altura (px) mínima de um card, para o nome sempre ser legível */
const MIN_CARD_H = 44;
/** Duração padrão em minutos quando a consulta não informa */
const DEFAULT_DURATION_MIN = 30;
/** Dias da semana, indexados como Date#getDay() (0 = Dom) */
const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

// CLAUDE [Bug: sobreposição visual]: o card tem altura mínima de 44px (~48 min), mas a detecção
// de sobreposição usava só a duração REAL. Uma consulta de 30 min às 9:00 e outra às 9:30 eram
// tratadas como "sem conflito", porém o card de 44px da primeira invadia o da segunda. Agora a
// detecção usa a duração VISUAL (mínimo `MIN_CARD_MIN`), então o que se sobrepõe na tela divide coluna.
const MIN_CARD_MIN = Math.ceil((MIN_CARD_H / ROW_H) * 60);

// CLAUDE [Refactor]: formatadores criados uma vez no módulo, em vez de chamar
// `toLocaleTimeString("pt-BR", {...})` a cada render de cada card (cria um Intl novo toda vez).
const TIME_FMT = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });
const DAY_FMT = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

// ─── Helpers de data ──────────────────────────────────────────────────────────

const minutesOfDay = (d: Date) => d.getHours() * 60 + d.getMinutes();

function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** Domingo da semana de `d`, às 00:00 */
const startOfWeek = (d: Date) => addDays(startOfDay(d), -d.getDay());

/** Diferença em dias de calendário (a − b). O `round` absorve horário de verão (dias de 23h/25h). */
const diffDays = (a: Date, b: Date) =>
  Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / 86_400_000);

// CLAUDE [Refactor: sem `any`]: antes era `(c as any).duracao` em 3 lugares, o que desliga a
// checagem de tipos e aceitava qualquer lixo (string, 0, negativo). Agora há UM helper tipado que
// só aceita número > 0 e cai no padrão caso contrário. Se o backend passar a tipar `duracao` em
// IConsultaDetailed, basta apagar o `ConsultaComDuracao` e o cast.
type ConsultaComDuracao = IConsultaDetailed & { duracao?: number };

function getDuration(c: IConsultaDetailed, fallback: number): number {
  const d = (c as ConsultaComDuracao).duracao;
  return typeof d === "number" && d > 0 ? d : fallback;
}

// ─── Layout de sobreposição ───────────────────────────────────────────────────

interface Slot {
  consulta: IConsultaDetailed;
  /** Índice da coluna de dia dentro da grade (0 = primeiro dia exibido) */
  dayIdx: number;
  startMin: number;
  endMin: number;
  /** Fim usado só para detectar conflito visual (respeita a altura mínima do card) */
  visualEndMin: number;
}

interface PositionedSlot extends Slot {
  /** Sub-coluna dentro do cluster de sobreposição */
  col: number;
  /** Total de sub-colunas do cluster a que este slot pertence */
  totalCols: number;
}

/**
 * Distribui as consultas em sub-colunas quando se sobrepõem.
 *
 * CLAUDE [Bug: dias misturados]: a versão antiga ordenava TODAS as consultas só pelo horário
 * (minutos do dia), ignorando o dia. Uma consulta de segunda às 10:00 e outra de quarta às 10:00
 * eram tratadas como conflito e ambas encolhiam pela metade, sem motivo. Agora a detecção roda
 * separadamente para cada dia.
 *
 * CLAUDE [Bug: totalCols global]: antes `totalCols` era o número máximo de colunas de TODO o dia/grade,
 * então uma única sobreposição às 9h deixava todos os outros cards do dia estreitos. Agora o
 * agrupamento é por "cluster" (conjunto encadeado de consultas que se tocam), e cada cluster
 * calcula as próprias colunas: só quem realmente conflita fica estreito.
 */
function layoutSlots(slots: Slot[]): PositionedSlot[] {
  const byDay = new Map<number, Slot[]>();
  for (const s of slots) {
    const list = byDay.get(s.dayIdx);
    if (list) list.push(s);
    else byDay.set(s.dayIdx, [s]);
  }

  const out: PositionedSlot[] = [];

  for (const daySlots of byDay.values()) {
    daySlots.sort((a, b) => a.startMin - b.startMin || a.visualEndMin - b.visualEndMin);

    let cluster: { slot: Slot; col: number }[] = [];
    let colEnds: number[] = []; // fim (visual) da última consulta de cada sub-coluna
    let clusterEnd = -Infinity;

    const flush = () => {
      for (const { slot, col } of cluster) out.push({ ...slot, col, totalCols: colEnds.length });
      cluster = [];
      colEnds = [];
      clusterEnd = -Infinity;
    };

    for (const slot of daySlots) {
      // começou depois que o cluster anterior terminou: fecha o cluster e abre outro
      if (slot.startMin >= clusterEnd) flush();

      let col = colEnds.findIndex((end) => end <= slot.startMin);
      if (col === -1) {
        col = colEnds.length;
        colEnds.push(slot.visualEndMin);
      } else {
        colEnds[col] = slot.visualEndMin;
      }

      cluster.push({ slot, col });
      clusterEnd = Math.max(clusterEnd, slot.visualEndMin);
    }
    flush();
  }

  return out;
}

// ─── Sub-componente: card de consulta ─────────────────────────────────────────

interface GridCardProps {
  slot: PositionedSlot;
  top: number;
  height: number;
  leftPct: number;
  widthPct: number;
  /** "agora" em ms, vindo do pai (evita Date.now() no render) */
  now: number;
  onOpen: (id: number) => void;
  onEnter: (id: number) => void;
}

function GridCard({ slot, top, height, leftPct, widthPct, now, onOpen, onEnter }: GridCardProps) {
  const c = slot.consulta;
  const cfg = STATUS_CFG[c.status];
  const start = new Date(c.startDateTime);

  // CLAUDE [Bug: botão em consulta presencial]: antes `canEnter(c)` decidia sozinho e o botão podia
  // aparecer em consulta presencial. Agora exige também `isTeleConsulta`, igual ao ConsultaCard.
  const entrar = isTeleConsulta(c) && canEnter(c);

  // CLAUDE [Task 1 na grade]: mesmo critério de "muted" da lista (cancelada ou já passada, exceto
  // em andamento), para as duas visualizações se comportarem igual. Se dá para entrar agora,
  // nunca apaga, mesmo que o horário de início já tenha passado.
  const muted = !entrar && (c.status === "cancelado" || (c.status !== "em_atendimento" && start.getTime() < now));

  const duration = slot.endMin - slot.startMin;
  const showTime = height >= 52;
  const showStatus = height >= 76;
  const hora = TIME_FMT.format(start);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Consulta de ${c.patientNome} às ${hora}, ${cfg.label}`}
      className={[
        "absolute rounded-md border overflow-hidden select-none cursor-pointer",
        "transition-all duration-150 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        cfg.bg,
        cfg.border,
        entrar ? "ring-1 ring-success/50 shadow-sm" : "",
        muted ? "opacity-50 grayscale hover:opacity-100 hover:grayscale-0" : "hover:opacity-90",
      ].join(" ")}
      // CLAUDE [Refactor: posição em %]: antes a posição horizontal era em pixels, calculada com a
      // largura medida por ResizeObserver. Agora é porcentagem da própria área, então o navegador
      // faz o redimensionamento sozinho (sem JS medindo, sem estado `areaW`, sem re-render a cada resize).
      // O `+1`/`-2` de offset substitui o antigo `height - 4` solto, deixando uma folga simétrica.
      style={{
        top: top + 1,
        height: height - 2,
        left: `calc(${leftPct}% + 2px)`,
        width: `calc(${widthPct}% - 4px)`,
      }}
      onClick={() => onOpen(c.id)}
      // CLAUDE [Acessibilidade]: antes só Enter abria, e a checagem não filtrava o alvo: apertar
      // Enter no botão "Iniciar" de dentro também abria o modal. Agora aceita Enter e Espaço e só
      // reage quando o foco está no próprio card.
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(c.id);
        }
      }}
    >
      <div className="flex h-full flex-col gap-0.5 overflow-hidden px-1.5 py-1">
        <div className="flex min-w-0 items-center gap-1">
          <Avatar color="accent" className="size-4 shrink-0">
            <Avatar.Fallback className="text-[8px]">{PatientInitials(c.patientNome)}</Avatar.Fallback>
          </Avatar>
          <span className={`truncate text-[10px] font-medium leading-tight ${cfg.text}`} title={c.patientNome}>
            {c.patientNome}
          </span>

          {/* CLAUDE [Bug: botão sumia / abria modal]: (1) antes o botão só aparecia em cards com
              ≥76px de altura, então consultas de 30 min (a duração padrão!) NUNCA mostravam como
              entrar. Agora é um botão só de ícone na linha do nome, visível em qualquer altura.
              (2) o handler antigo chamava `e.continuePropagation()`, que faz o clique SUBIR para o
              card e abrir o modal junto com a navegação. Agora o clique é contido no wrapper
              (stopPropagation) e só entra na sala. */}
          {entrar && (
            <span className="ml-auto shrink-0" onClick={(e) => e.stopPropagation()}>
              <Button
                size="sm"
                variant="primary"
                isIconOnly
                aria-label={`Entrar na consulta de ${c.patientNome}`}
                className="size-4 min-w-0"
                onPress={() => onEnter(c.id)}
              >
                <Video className="size-2.5" />
              </Button>
            </span>
          )}
        </div>

        {showTime && (
          <span className={`text-[9px] leading-tight ${cfg.muted}`}>
            {hora} · {duration} min
          </span>
        )}

        {showStatus && (
          <div className="mt-auto flex flex-wrap items-center gap-1">
            <Chip size="sm" color={cfg.chip} variant="soft" className="h-4 px-1 text-[9px]">
              {cfg.label}
            </Chip>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface ConsultaHourlyGridProps {
  consultas: IConsultaDetailed[];
  /** Primeira hora exibida (deve vir das configurações do médico) */
  startHour?: number;
  /** Última hora exibida: a linha dessa hora é incluída (18 mostra até 18:59) */
  endHour?: number;
  /** Primeiro dia da semana exibido (0 = Dom, 1 = Seg …) */
  startDay?: number;
  /** Último dia da semana exibido */
  endDay?: number;
  /** Duração padrão em minutos quando a consulta não informa */
  defaultDuration?: number;
  // CLAUDE [Refactor]: `onCanceled` virou `onChanged`. O modal agora também confirma, recusa,
  // conclui e registra falta, então "canceled" já não descrevia quando isso dispara. O nome
  // novo é o mesmo que o ConsultaModal usa. (O ConsultaScreen foi atualizado.)
  /** Chamado depois que o modal altera uma consulta (cancelar, concluir, confirmar...) */
  onChanged: () => void;
}

export function ConsultaHourlyGrid({
  consultas,
  startHour = 8,
  endHour = 18,
  startDay = 1,
  endDay = 5,
  defaultDuration = DEFAULT_DURATION_MIN,
  onChanged,
}: ConsultaHourlyGridProps) {
  const navigate = useNavigate();
  const consultaModal = useOverlayState();
  const [selected, setSelected] = useState<IConsultaDetailed | null>(null);

  // CLAUDE [Bug: Date no render]: antes `new Date()` era chamado direto no corpo do componente, então a
  // linha de "agora" só andava quando algo re-renderizasse por outro motivo (e é uma chamada
  // impura durante o render). Agora "agora" é estado atualizado a cada 30s: a linha anda
  // sozinha e o `canEnter`/muted dos cards se reavaliam.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  // CLAUDE [Bug: semanas misturadas]: a grade posicionava cada consulta só por `getDay()`
  // (dia da semana). Com o filtro "nenhum" a tela traz consultas de VÁRIAS semanas, e as de
  // 3 semanas diferentes caíam empilhadas na mesma coluna "Seg". Agora a grade mostra UMA semana
  // por vez, com navegação (anterior / hoje / próxima), e cada consulta é posicionada pela data real.
  const [weekOffset, setWeekOffset] = useState(0);

  // CLAUDE [Refactor: normalização]: props 0–6 fora de ordem (ex.: startDay=5, endDay=1)
  // gerariam `numDays` negativo e quebrariam o layout. Agora são limitadas e ordenadas.
  const firstDay = Math.min(Math.max(Math.min(startDay, endDay), 0), 6);
  const lastDay = Math.min(Math.max(Math.max(startDay, endDay), 0), 6);
  const numDays = lastDay - firstDay + 1;

  const gridStartMin = startHour * 60;
  const gridEndMin = (endHour + 1) * 60;
  const hours = useMemo(
    () => Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i),
    [startHour, endHour],
  );
  const totalH = hours.length * ROW_H;
  const minToPx = (min: number) => ((min - gridStartMin) / 60) * ROW_H;

  // Domingo da semana exibida. Guardado como número para as dependências dos memos não
  // mudarem a cada tick de `now` (um `Date` novo a cada render invalidaria todo memo).
  const weekStartMs = addDays(startOfWeek(new Date(now)), weekOffset * 7).getTime();

  const days = useMemo(() => {
    const weekStart = new Date(weekStartMs);
    return Array.from({ length: numDays }, (_, i) => ({
      weekday: WEEK_DAYS[firstDay + i],
      date: addDays(weekStart, firstDay + i),
    }));
  }, [weekStartMs, firstDay, numDays]);

  const { slots, outOfPeriod, outOfHours } = useMemo(() => {
    const weekStart = new Date(weekStartMs);
    const raw: Slot[] = [];
    let outOfPeriod = 0;
    let outOfHours = 0;

    for (const c of consultas) {
      const start = new Date(c.startDateTime);

      const dayIdx = diffDays(start, weekStart) - firstDay;
      if (dayIdx < 0 || dayIdx >= numDays) {
        outOfPeriod++;
        continue;
      }

      const startMin = minutesOfDay(start);
      // CLAUDE [Bug: filtro de hora]: o filtro antigo usava `getHours() <= endHour`, coerente com a linha
      // de endHour, mas consultas fora do intervalo sumiam sem aviso. Agora elas são contadas e
      // o rodapé informa quantas ficaram de fora (e por quê).
      if (startMin < gridStartMin || startMin >= gridEndMin) {
        outOfHours++;
        continue;
      }

      const endMin = startMin + getDuration(c, defaultDuration);
      raw.push({
        consulta: c,
        dayIdx,
        startMin,
        endMin,
        visualEndMin: Math.max(endMin, startMin + MIN_CARD_MIN),
      });
    }

    return { slots: layoutSlots(raw), outOfPeriod, outOfHours };
  }, [consultas, weekStartMs, firstDay, numDays, gridStartMin, gridEndMin, defaultDuration]);

  // ── Linha de "agora" ───────────────────────────────────────────────────────

  // CLAUDE [Bug: linha de agora]: a linha vermelha cruzava TODAS as colunas, mesmo quando "hoje"
  // nem estava na semana exibida (ex.: navegando para a semana que vem). Agora só aparece na
  // coluna de hoje, e só se hoje estiver na semana/horário visíveis; o cabeçalho de hoje também
  // ganha destaque.
  const nowDate = new Date(now);
  const todayIdx = diffDays(nowDate, new Date(weekStartMs)) - firstDay;
  const nowMin = minutesOfDay(nowDate);
  const showNow = todayIdx >= 0 && todayIdx < numDays && nowMin >= gridStartMin && nowMin < gridEndMin;

  const columns = `repeat(${numDays}, minmax(0, 1fr))`;

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleOpen = (id: number) => {
    setSelected(consultas.find((c) => c.id === id) ?? null);
    consultaModal.open();
  };

  // CLAUDE [Refactor]: `useNavigate` era chamado dentro de CADA card (um hook por consulta). Agora
  // é chamado uma vez aqui e o card só recebe `onEnter`.
  const handleEnter = (id: number) => enterConsulta(id, navigate);

  const rangeLabel = `${DAY_FMT.format(days[0].date)} – ${DAY_FMT.format(days[days.length - 1].date)}`;

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-xl border border-border bg-surface">
      {/* ── Navegação de semana ─────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" isIconOnly aria-label="Semana anterior" onPress={() => setWeekOffset((w) => w - 1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button size="sm" variant="ghost" isIconOnly aria-label="Próxima semana" onPress={() => setWeekOffset((w) => w + 1)}>
            <ChevronRight className="size-4" />
          </Button>
          <Button size="sm" variant="outline" isDisabled={weekOffset === 0} onPress={() => setWeekOffset(0)}>
            Hoje
          </Button>
        </div>
        <span className="text-sm font-medium tabular-nums">{rangeLabel}</span>
      </div>

      {/* CLAUDE [Bug: scroll]: o comentário antigo dizia "garante scroll horizontal em telas
          estreitas", mas o wrapper tinha `overflow-x-hidden`, ou seja, cortava as colunas em vez de
          rolar. Agora é `overflow-auto`. Também ganhou `max-h-[70vh]`: antes dependia de `h-full`
          do pai, que a tela não define, então o scroll vertical e o header sticky nunca funcionavam. */}
      <div className="max-h-[70vh] overflow-auto">
        <div style={{ minWidth: LABEL_W + numDays * MIN_COL_W }}>
          {/* ── Header de dias ─────────────────────────────────────── */}
          <div className="sticky top-0 z-20 flex border-b border-border bg-surface">
            <div className="shrink-0 border-r border-border" style={{ width: LABEL_W }} />
            <div className="grid flex-1" style={{ gridTemplateColumns: columns }}>
              {days.map(({ weekday, date }, i) => (
                <div
                  key={weekday}
                  className={`flex h-9 flex-col items-center justify-center border-r border-border last:border-r-0 ${
                    i === todayIdx ? "bg-accent/10 text-accent" : "text-fg-muted"
                  }`}
                >
                  <span className="text-[11px] font-medium leading-none">{weekday}</span>
                  <span className="mt-0.5 text-[10px] leading-none tabular-nums opacity-70">
                    {DAY_FMT.format(date)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Corpo ──────────────────────────────────────────────── */}
          <div className="flex">
            <div className="shrink-0 border-r border-border" style={{ width: LABEL_W }}>
              {hours.map((h) => (
                <div
                  key={h}
                  className="flex items-start justify-end border-b border-border/40 pr-1.5 pt-0.5 text-[10px] text-fg-subtle"
                  style={{ height: ROW_H }}
                >
                  {String(h).padStart(2, "0")}h
                </div>
              ))}
            </div>

            <div className="relative flex-1" style={{ height: totalH }}>
              {/* Colunas de fundo (zebra + destaque de hoje) */}
              <div className="pointer-events-none absolute inset-0 grid" style={{ gridTemplateColumns: columns }}>
                {days.map(({ weekday }, i) => (
                  <div
                    key={weekday}
                    className={`border-r border-border/40 last:border-r-0 ${
                      i === todayIdx ? "bg-accent/5" : i % 2 === 1 ? "bg-surface-secondary/40" : ""
                    }`}
                  />
                ))}
              </div>

              {/* Linhas horizontais por hora */}
              <div className="pointer-events-none absolute inset-0">
                {hours.map((h, i) => (
                  <div key={h} className="absolute w-full border-b border-border/30" style={{ top: (i + 1) * ROW_H }} />
                ))}
              </div>

              {/* Linha de "agora" (só na coluna de hoje) */}
              {showNow && (
                <div
                  className="pointer-events-none absolute z-10"
                  style={{
                    top: minToPx(nowMin),
                    left: `${(todayIdx / numDays) * 100}%`,
                    width: `${100 / numDays}%`,
                  }}
                >
                  <div className="h-px w-full bg-danger/70" />
                  <div className="absolute -top-1 left-0 size-2 rounded-full bg-danger" />
                </div>
              )}

              {/* Cards */}
              {slots.map((slot) => {
                const top = minToPx(slot.startMin);
                // altura real da consulta, com mínimo legível, sem vazar para fora da grade
                const height = Math.min(
                  Math.max(((slot.endMin - slot.startMin) / 60) * ROW_H, MIN_CARD_H),
                  totalH - top,
                );
                const colFrac = 1 / (numDays * slot.totalCols);

                return (
                  <GridCard
                    key={slot.consulta.id}
                    slot={slot}
                    top={top}
                    height={height}
                    leftPct={(slot.dayIdx / numDays + slot.col * colFrac) * 100}
                    widthPct={colFrac * 100}
                    now={now}
                    onOpen={handleOpen}
                    onEnter={handleEnter}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CLAUDE [Feedback ao usuário]: consultas que a grade não consegue mostrar (outra semana,
          dia não exibido ou fora do horário) antes simplesmente sumiam, o que parecia "perdi
          consultas". Agora o rodapé avisa quantas são e por quê. */}
      {(outOfPeriod > 0 || outOfHours > 0) && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border bg-surface-secondary/40 px-3 py-2 text-xs text-fg-muted">
          {outOfPeriod > 0 && (
            <span>
              {outOfPeriod} consulta{outOfPeriod > 1 ? "s" : ""} em outra semana ou dia não exibido
            </span>
          )}
          {outOfHours > 0 && (
            <span>
              {outOfHours} consulta{outOfHours > 1 ? "s" : ""} fora do horário exibido (
              {String(startHour).padStart(2, "0")}h–{String(endHour).padStart(2, "0")}h)
            </span>
          )}
        </div>
      )}

      <ConsultaModal
        appointment={selected}
        isOpen={consultaModal.isOpen}
        onOpenChange={consultaModal.setOpen}
        onChanged={onChanged}
      />
    </div>
  );
}