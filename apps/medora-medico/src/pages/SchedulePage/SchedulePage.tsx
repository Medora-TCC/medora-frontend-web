import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Button,
  Card,
  Dropdown,
  Label,
  Skeleton,
  ToastProvider,
  ToggleButton,
  ToggleButtonGroup,
  useOverlayState,
} from '@heroui/react';
import { CalendarDays, ChevronDown, CircleAlert, ListFilter, RotateCcw, Settings } from 'lucide-react';
import AppointmentsService, {
  type DoctorAppointment,
  type DoctorAppointmentsFilter,
} from '../../api/services/Appointments';
import { errorMessage } from '../../api/errors';
import { ScheduleCard } from './ScheduleCard';
import { ScheduleModal } from './ScheduleModal';
import {
  DEFAULT_PERIOD,
  PAGE_SIZE,
  PERIOD_OPTIONS,
  STATUS_CFG,
  STATUS_FILTER_OPTIONS,
  isMuted,
  isPeriodKey,
  isStatusFilterKey,
  type StatusFilterKey,
} from './ScheduleConfig';

// ─── Estado dos filtros (tudo o que vai para o backend vive junto) ────────────
// Manter período, status e página no mesmo objeto garante UMA requisição por mudança:
// trocar um filtro e voltar para a página 1 é um único setState.
interface AgendaQuery {
  period: DoctorAppointmentsFilter;
  status: StatusFilterKey;
  page: number;
}

const INITIAL_QUERY: AgendaQuery = { period: DEFAULT_PERIOD, status: 'all', page: 1 };

// ─── Skeleton ─────────────────────────────────────────────────────────────────
// Mesmo formato do AppointmentCard (vertical e quadrado) para a lista não "pular" ao carregar.
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
function EmptyState({ status }: { status: StatusFilterKey }) {
  const mensagem =
    status === 'all'
      ? 'Nenhuma consulta encontrada'
      : `Nenhuma consulta com status "${STATUS_CFG[status].label}"`;

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
export function SchedulePage() {
  const navigate = useNavigate();

  const [query, setQuery] = useState<AgendaQuery>(INITIAL_QUERY);
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const appointmentModal = useOverlayState();

  // "Agora" como estado (atualizado a cada minuto) em vez de Date.now() no render:
  // o visual muted e os rótulos Hoje/Amanhã se atualizam sozinhos.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  // Uma única fonte de recarga: período, status, página ou reloadKey.
  // O cleanup aborta a requisição anterior e descarta respostas antigas.
  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await AppointmentsService.getDoctorAppointments(
          {
            filter: query.period,
            status: query.status === 'all' ? undefined : query.status,
            page: query.page,
            pageSize: PAGE_SIZE,
          },
          controller.signal,
        );
        if (!active) return;

        // a página atual deixou de existir (ex.: a última consulta dela foi cancelada)
        const lastPage = Math.max(1, Math.ceil(res.totalCount / PAGE_SIZE));
        if (res.items.length === 0 && query.page > lastPage) {
          setQuery((q) => ({ ...q, page: lastPage }));
          return;
        }

        setAppointments(res.items);
        setTotalCount(res.totalCount);
      } catch (err) {
        if (!active) return;
        setAppointments([]);
        setTotalCount(0);
        setError(errorMessage(err, 'Erro ao carregar as consultas.'));
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [query, reloadKey]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const statusAtual = STATUS_FILTER_OPTIONS.find((o) => o.key === query.status) ?? STATUS_FILTER_OPTIONS[0];
  // derivado da lista atual: após recarregar, o modal sempre mostra a versão mais nova
  const selectedAppointment = appointments.find((a) => a.appointmentId === selectedId) ?? null;

  const changePeriod = (period: DoctorAppointmentsFilter) =>
    setQuery((q) => (q.period === period ? q : { ...q, period, page: 1 }));

  const changeStatus = (status: StatusFilterKey) =>
    setQuery((q) => (q.status === status ? q : { ...q, status, page: 1 }));

  const goToPage = (page: number) =>
    setQuery((q) => (q.page === page ? q : { ...q, page }));

  const handleCardClick = (id: number) => {
    setSelectedId(id);
    appointmentModal.open();
  };

  const handleChanged = () => {
    appointmentModal.close();
    setReloadKey((k) => k + 1);
  };

  return (
    <>
      <ToastProvider />

      <div className="min-h-screen max-w-screen bg-surface">
        <div className="px-4 py-8 flex flex-col gap-6">
          {/* ── Cabeçalho ─────────────────────────────────── */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Minha Agenda</h1>
              <p className="text-sm text-fg-muted mt-0.5">
                {loading
                  ? 'Carregando…'
                  : `${totalCount} consulta${totalCount !== 1 ? 's' : ''}`}
              </p>
            </div>

            <Button size="sm" variant="outline" onPress={() => navigate('/medico/disponibilidade')}>
              <Settings className="size-4" />
              Configurar Horários
            </Button>
          </div>

          {/* ── Filtros ───────────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Status (filtrado no backend) */}
            <Dropdown>
              <Button variant="outline" size="sm" aria-label="Filtrar por status">
                <ListFilter className="size-4" />
                {statusAtual.label}
                <ChevronDown className="size-4" />
              </Button>
              <Dropdown.Popover>
                <Dropdown.Menu
                  selectionMode="single"
                  selectedKeys={new Set([query.status])}
                  onSelectionChange={(keys) => {
                    if (keys === 'all') return;
                    const val = [...keys][0];
                    if (isStatusFilterKey(val)) changeStatus(val);
                  }}
                >
                  {STATUS_FILTER_OPTIONS.map(({ key, label }) => (
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
                disallowEmptySelection
                selectedKeys={new Set([query.period])}
                onSelectionChange={(keys) => {
                  const val = [...keys][0];
                  changePeriod(isPeriodKey(val) ? val : DEFAULT_PERIOD);
                }}
                className="flex flex-wrap gap-2"
              >
                {PERIOD_OPTIONS.map(({ key, label }) => (
                  <ToggleButton key={key} id={key} size="sm">
                    {label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              <Button
                variant="ghost"
                size="sm"
                isIconOnly
                onPress={() => setReloadKey((k) => k + 1)}
                isDisabled={loading}
                aria-label="Atualizar consultas"
              >
                <span title="Atualizar consultas" className="inline-flex">
                  <RotateCcw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
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
            ) : error ? null : appointments.length === 0 ? (
              <div className="col-span-full">
                <EmptyState status={query.status} />
              </div>
            ) : (
              appointments.map((a) => (
                <ScheduleCard
                  key={a.appointmentId}
                  appointment={a}
                  now={now}
                  muted={isMuted(a, now)}
                  onCardClick={handleCardClick}
                />
              ))
            )}
          </div>

          {/* ── Paginação (server-side) ───────────────────── */}
          {!error && totalPages > 1 && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-fg-muted">
                Página {query.page} de {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  isDisabled={loading || query.page <= 1}
                  onPress={() => goToPage(query.page - 1)}
                >
                  Anterior
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  isDisabled={loading || query.page >= totalPages}
                  onPress={() => goToPage(query.page + 1)}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </div>

        <ScheduleModal
          appointment={selectedAppointment}
          isOpen={appointmentModal.isOpen}
          onOpenChange={appointmentModal.setOpen}
          onChanged={handleChanged}
        />
      </div>
    </>
  );
}

export default SchedulePage;