import { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Card,
  Chip,
  Dropdown,
  Label,
  SearchField,
  Skeleton,
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
// CLAUDE [Task 3 + Task 4 + Task 5]: novos ícones: List/LayoutGrid (toggle de visualização),
// ListFilter/ChevronDown (gatilho do dropdown de status). `Spinner` foi removido dos imports
// porque o botão Atualizar agora gira o próprio ícone (Task 5).
import {
  CalendarDays,
  ChevronDown,
  CircleAlert,
  LayoutGrid,
  List,
  ListFilter,
  RotateCcw,
} from "lucide-react";
import { ConsultaHourlyGrid } from "./ConsultaHourlyGrid";
// CLAUDE [Card]: o import do TipoConsultaTag saiu daqui. O badge de tipo agora é renderizado
// dentro do próprio ConsultaCard, então a tela não precisa mais conhecer esse componente.
import ConsultaModal from "../../components/Consulta/ConsultaModal";
import { ConsultaCard } from "./ConsultaCard";

// ─── Types ────────────────────────────────────────────────────────────────────
type Filtro = "todas" | StatusConsulta | "a_concluir";


const filtroDataNoBackend: Record<FiltroConsulta, DoctorAppointmentsApiFilter> = {
  hoje: "Today",
  amanha: "Tomorrow",
  semana: "Week",
  nenhum: "None",
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

// CLAUDE [Task 1 + filtro "A concluir"]: status em que a consulta ainda está aberta. Se o horário
// já passou e ela continua assim, o médico precisa concluí-la (ou marcar falta).
const STATUS_ABERTOS: StatusConsulta[] = ["agendado", "confirmado", "em_atendimento"];

// CLAUDE [Task 1]: regra única de "consulta apagada" (muted): cancelada OU já passada.
// Exceção: `em_atendimento` NUNCA é muted, pois a consulta em andamento já começou (horário
// no passado) mas é justamente a mais importante naquele momento.
function isMuted(c: IConsultaDetailed, now: number) {
  if (c.status === "cancelado") return true;
  if (c.status === "em_atendimento") return false;
  return new Date(c.startDateTime).getTime() < now;
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    // CLAUDE [Quadrado]: o skeleton voltou a ser vertical e quadrado (`md:aspect-square`), igual ao
    // card novo, para a lista não "pular" de tamanho quando os dados chegam.
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

  // CLAUDE [Task 3]: antes era `const [view] = useState(...)` SEM setter, ou seja, o modo grid
  // nunca podia ser ativado pela interface. Agora o setter existe e é ligado ao toggle de ícones.
  const [view, setView] = useState<"lista" | "grid">("lista");

  // CLAUDE [Task 1]: "agora" como estado (atualizado a cada 1 min) em vez de chamar Date.now()
  // direto no render/useMemo. Assim a ordenação e o estilo muted se atualizam sozinhos quando uma
  // consulta passa do horário, sem recarregar a página, e evitamos chamar função impura no render
  // (mesmo motivo do comentário do hasStarted no ConsultaModal).
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  // Evita que uma resposta lenta e antiga sobrescreva uma mais recente
  const requestId = useRef(0);

  const handleCardClick = (id: number) => {
    const appointment = consultas.find((c) => c.id === id) ?? null;
    setSelectedAppointment(appointment);
    consultaModal.open();
  };

  const filtroApi = filtroDataNoBackend[filtroData];

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
        // CLAUDE [filtro "A concluir"]: antes "a_concluir" caía na mesma condição de "todas" e
        // mostrava TUDO, ou seja, o filtro não filtrava nada. Agora mostra só consultas ainda
        // abertas cujo horário já passou (as que o médico precisa concluir ou marcar falta).
        .filter((c) => {
          if (filtro === "todas") return true;
          if (filtro === "a_concluir")
            return (
              STATUS_ABERTOS.includes(c.status as StatusConsulta) &&
              new Date(c.startDateTime).getTime() < now
            );
          return c.status === filtro;
        })
        .filter(
          (c) =>
            busca.trim() === "" ||
            c.patientNome.toLowerCase().includes(busca.toLowerCase()),
        )
        // CLAUDE [Task 1]: ordenação "mais próxima primeiro". Antes era só por data crescente
        // (passado antigo no topo, consultas de hoje lá embaixo). Agora:
        //   1) consultas ativas/futuras vêm primeiro, da mais próxima para a mais distante;
        //   2) consultas "muted" (passadas/canceladas) vão para o fim, da mais recente para a mais
        //      antiga (a que passou há pouco fica no topo desse bloco).
        .sort((a, b) => {
          const ma = isMuted(a, now);
          const mb = isMuted(b, now);
          if (ma !== mb) return ma ? 1 : -1;
          const ta = new Date(a.startDateTime).getTime();
          const tb = new Date(b.startDateTime).getTime();
          return ma ? tb - ta : ta - tb;
        }),
    [consultas, filtro, busca, now],
  );

  // Contagens por status (refletem apenas o período carregado)
  const contagens = useMemo(() => {
    const c: Record<string, number> = { todas: consultas.length };
    for (const item of consultas) c[item.status] = (c[item.status] ?? 0) + 1;
    // CLAUDE [filtro "A concluir"]: "a_concluir" não é um status real, então não era contado e o
    // número nunca aparecia. Agora calculamos com a mesma regra do filtro acima.
    c.a_concluir = consultas.filter(
      (i) =>
        STATUS_ABERTOS.includes(i.status as StatusConsulta) &&
        new Date(i.startDateTime).getTime() < now,
    ).length;
    return c;
  }, [consultas, now]);

  // CLAUDE [Task 4]: dados do item selecionado para exibir no botão do dropdown.
  const filtroAtual = filtroOpcoes.find((o) => o.key === filtro) ?? filtroOpcoes[0];

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
                : `${consultas.length} consulta${consultas.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* CLAUDE [Task 3]: toggle lista/grid por ÍCONES (List e LayoutGrid) em vez de texto.
                `isIconOnly` deixa o botão quadrado e compacto; `aria-label` mantém a acessibilidade
                já que não há texto visível. `selectedKeys` controlado pelo state `view`. O guard
                `if (val)` impede ficar sem nenhuma opção selecionada (sempre há uma view ativa). */}
            <ToggleButtonGroup
              selectionMode="single"
              selectedKeys={new Set([view])}
              onSelectionChange={(keys) => {
                const val = [...keys][0] as "lista" | "grid" | undefined;
                if (val) setView(val);
              }}
              aria-label="modo de visualização"
            >
              <ToggleButton id="lista" size="sm" isIconOnly aria-label="Visualizar em lista">
                <List className="size-4" />
              </ToggleButton>
              <ToggleButton id="grid" size="sm" isIconOnly aria-label="Visualizar em grade por horário">
                <LayoutGrid className="size-4" />
              </ToggleButton>
            </ToggleButtonGroup>

            {/* CLAUDE [Task 5]: o botão "Atualizar" era outline com texto + Spinner trocando o
                ícone, ou seja, grande e chamativo para uma ação secundária. Agora é só um ícone
                (`isIconOnly`) com variante `ghost` (sem borda/fundo), do mesmo tamanho dos
                botões do toggle. O estado de carregamento virou `animate-spin` no próprio
                ícone (sem trocar de componente, então o botão não "pula" de largura). O texto
                "Atualizar" foi para `aria-label` e `title` (tooltip nativo). */}
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

        {/* ── Busca ─────────────────────────────────────── */}
        <SearchField
          aria-label="buscar consulta"
          value={busca}
          onChange={setBusca}
          className="w-full"
        />

        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* ── Filtro de Estado ────────────────── */}
          {/* CLAUDE [Task 4]: os 10 ToggleButtons de status (que quebravam em várias linhas)
              viraram UM Dropdown de seleção única. O gatilho mostra o filtro ativo + contagem, e
              cada item mostra sua contagem à direita com um check no selecionado
              (`Dropdown.ItemIndicator`). Mantive o mesmo state `filtro` e a mesma lista
              `filtroOpcoes`, então toda a lógica de filtragem continua igual. O guard `"all"`
              existe porque o tipo de seleção do react-aria pode ser "all" | Set, e aqui só
              queremos um item. OBS: se a sua versão do HeroUI v3 tiver nomes de subcomponentes
              diferentes do Dropdown, ajuste só esse bloco. */}
          <Dropdown>
            <Button variant="outline" size="sm" aria-label="Filtrar por status">
              <ListFilter className="size-4" />
              {filtroAtual.label}
              {(contagens[filtroAtual.key] ?? 0) > 0 && (
                <Chip size="sm" variant="soft">
                  {contagens[filtroAtual.key]}
                </Chip>
              )}
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
                    <span className="ml-auto pl-3 text-xs text-fg-muted">
                      {contagens[key] ?? 0}
                    </span>
                    <Dropdown.ItemIndicator />
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>

          {/* ── Filtros Data (aplicados no backend) ────────────────── */}
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
            {/* CLAUDE [Refactor]: prop renomeada de `onCanceled` para `onChanged` (ver ConsultaHourlyGrid). */}
            <ConsultaHourlyGrid consultas={filtradas} onChanged={() => carregar()} />
          </div>
        ) : (
          // CLAUDE [Quadrado]: grade de volta a 4 colunas a partir de `md` (como era originalmente),
          // para os cards quadrados. Em telas menores: 1 coluna no celular e 2 em `sm`, para não
          // espremer o quadrado.
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
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
              // CLAUDE [Card]: removi o <div> wrapper + badge sobreposto que eu tinha criado na
              // rodada anterior. Agora a tela usa o ConsultaCard diretamente e só repassa `muted`
              // (calculado aqui com `isMuted`, que usa o "agora" atualizado a cada minuto).
              // O visual muted, o tipo e o status são responsabilidade do card.
              filtradas.map((c) => (
                <ConsultaCard
                  key={c.id}
                  consulta={c}
                  muted={isMuted(c, now)}
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