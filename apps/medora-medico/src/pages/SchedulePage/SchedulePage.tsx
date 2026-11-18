import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Button,
  Card,
  Skeleton,
  ToastProvider,
  ToggleButton,
  ToggleButtonGroup,
  toast,
  useOverlayState,
} from '@heroui/react';
import { CalendarDays, CircleAlert, RotateCcw, Settings } from 'lucide-react';
import type { DailyAvailabilitySlotDTO } from '@medora_web/shared';
import AppointmentsService, { type DoctorAppointment } from '../../api/services/Appointments';
import AvailabilityService, { DEFAULT_TIME_ZONE } from '../../api/services/Availability';
import { errorMessage } from '../../api/errors';
import { ScheduleModal } from './ScheduleModal';
import { AwaitingConfirmationPanel, NextAppointment, ScheduleSummary } from './ScheduleSidebar';
import { ScheduleTimeline } from './ScheduleTimeline';
import {
  DEFAULT_SCHEDULE_PERIOD,
  SCHEDULE_PERIODS,
  buildDays,
  computeStats,
  datesForPeriod,
  filterPending,
  findNextAppointment,
  isSchedulePeriod,
  plural,
  type BlockedEntry,
  type FreeEntry,
  type SchedulePeriod,
} from './scheduleModel';

const SCHEDULE_PAGE_SIZE = 100;

const AWAITING_PAGE_SIZE = 100;

const byStart = (a: DoctorAppointment, b: DoctorAppointment): number =>
  new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime();

function ScheduleSkeleton() {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <aside className="flex flex-col gap-4 lg:order-last">
        <Card className="flex flex-col gap-3 p-4">
          <Skeleton className="h-3 w-28 rounded" />
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3.5 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
          </div>
          <Skeleton className="h-8 rounded-lg" />
        </Card>
        <Card className="flex flex-col gap-3 p-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-5 rounded" />
          ))}
        </Card>
      </aside>

      <Card className="flex flex-col gap-0 p-0">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-ring px-4 py-2.5 last:border-b-0">
            <Skeleton className="h-5 w-12 rounded" />
            <Skeleton className="h-7 w-1 rounded-full" />
            <Skeleton className="h-4 flex-1 rounded" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </Card>
    </div>
  );
}

function EmptyState({ period, onlyPending }: { period: SchedulePeriod; onlyPending: boolean }) {
  const quando = period === 'Today' ? 'hoje' : period === 'Tomorrow' ? 'amanhã' : 'nesta semana';
  const mensagem = onlyPending
    ? `Nenhuma pendência ${quando}`
    : `Nenhuma consulta nem horário disponível ${quando}`;

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-surface-secondary text-fg-muted">
        <CalendarDays strokeWidth={1.5} />
      </div>
      <p className="text-sm text-fg-muted">{mensagem}</p>
    </div>
  );
}

export function SchedulePage() {
  const navigate = useNavigate();

  const [period, setPeriod] = useState<SchedulePeriod>(DEFAULT_SCHEDULE_PERIOD);
  const [onlyPending, setOnlyPending] = useState(false);

  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [slotsByDate, setSlotsByDate] = useState<Record<string, DailyAvailabilitySlotDTO[]>>({});
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [awaiting, setAwaiting] = useState<DoctorAppointment[]>([]);
  const [awaitingTotal, setAwaitingTotal] = useState(0);
  const [loadingAwaiting, setLoadingAwaiting] = useState(true);
  const [awaitingError, setAwaitingError] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);
  const [slotsReloadKey, setSlotsReloadKey] = useState(0);

  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const appointmentModal = useOverlayState();

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const load = async () => {
      setLoadingAppointments(true);
      setError(null);
      try {
        const res = await AppointmentsService.getDoctorAppointments(
          { filter: period, page: 1, pageSize: SCHEDULE_PAGE_SIZE },
          controller.signal,
        );
        if (!active) return;
        setAppointments(res.items);
        setTotalCount(res.totalCount);
      } catch (err) {
        if (!active) return;
        setAppointments([]);
        setTotalCount(0);
        setError(errorMessage(err, 'Erro ao carregar as consultas.'));
      } finally {
        if (active) setLoadingAppointments(false);
      }
    };

    load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [period, reloadKey]);

  useEffect(() => {
    let active = true;
    const dates = datesForPeriod(period, new Date());

    const load = async () => {
      setLoadingSlots(true);
      setSlotsError(null);

      const results = await Promise.allSettled(dates.map((date) => AvailabilityService.getDailySchedule(date)));
      if (!active) return;

      const next: Record<string, DailyAvailabilitySlotDTO[]> = {};
      const failures: unknown[] = [];
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') next[dates[index]] = result.value;
        else failures.push(result.reason);
      });

      setSlotsByDate(next);
      setSlotsError(
        failures.length > 0 ? errorMessage(failures[0], 'Não foi possível carregar os horários livres.') : null,
      );
      setLoadingSlots(false);
    };

    load();
    return () => {
      active = false;
    };
  }, [period, reloadKey, slotsReloadKey]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const load = async () => {
      setLoadingAwaiting(true);
      setAwaitingError(null);
      try {
        const res = await AppointmentsService.getDoctorAppointments(
          { filter: 'All', status: 'AwaitingConfirmation', page: 1, pageSize: AWAITING_PAGE_SIZE },
          controller.signal,
        );
        if (!active) return;
        setAwaiting([...res.items].sort(byStart));
        setAwaitingTotal(res.totalCount);
      } catch (err) {
        if (!active) return;
        setAwaiting([]);
        setAwaitingTotal(0);
        setAwaitingError(errorMessage(err, 'Erro ao carregar as confirmações pendentes.'));
      } finally {
        if (active) setLoadingAwaiting(false);
      }
    };

    load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [reloadKey]);

  const loading = loadingAppointments || loadingSlots;
  const refreshing = loading || loadingAwaiting;

  const allDays = useMemo(() => buildDays({ appointments, slotsByDate, now }), [appointments, slotsByDate, now]);
  const days = useMemo(() => (onlyPending ? filterPending(allDays, now) : allDays), [allDays, onlyPending, now]);
  const stats = useMemo(() => computeStats(allDays, now), [allDays, now]);
  const pendingCount = stats.toConfirm + stats.toComplete;

  const nextAppointment = useMemo(
    () => (period === 'Today' ? findNextAppointment(appointments, now) : null),
    [period, appointments, now],
  );
  const selectedAppointment =
    appointments.find((a) => a.appointmentId === selectedId) ??
    awaiting.find((a) => a.appointmentId === selectedId) ??
    null;

  const changePeriod = (next: SchedulePeriod) => {
    if (next === period) return;
    setLoadingAppointments(true);
    setLoadingSlots(true);
    setPeriod(next);
  };

  const handleAppointmentClick = (id: number) => {
    setSelectedId(id);
    appointmentModal.open();
  };

  const handleChanged = () => {
    appointmentModal.close();
    setReloadKey((k) => k + 1);
  };

  const handleBlock = async (entry: FreeEntry) => {
    setBusyKey(entry.key);
    try {
      const { canceledAppointments } = await AvailabilityService.createBlock({
        date: entry.date,
        startTime: entry.startTime,
        endTime: entry.endTime,
        timeZoneId: DEFAULT_TIME_ZONE,
      });
      if (canceledAppointments > 0) {
        toast.warning(`Horários bloqueados. ${canceledAppointments} consulta(s) cancelada(s).`);
        setReloadKey((k) => k + 1);
      } else {
        toast.success('Horários bloqueados.');
        setSlotsReloadKey((k) => k + 1);
      }
    } catch (err) {
      toast.danger(errorMessage(err, 'Erro ao bloquear os horários.'));
    } finally {
      setBusyKey(null);
    }
  };

  const handleUnblock = async (entry: BlockedEntry) => {
    if (entry.blockId === undefined) return;
    setBusyKey(entry.key);
    try {
      await AvailabilityService.removeBlock(entry.blockId);
      toast.success('Horários liberados.');
      setSlotsReloadKey((k) => k + 1);
    } catch (err) {
      toast.danger(errorMessage(err, 'Erro ao liberar os horários.'));
    } finally {
      setBusyKey(null);
    }
  };

  const reloadAll = () => setReloadKey((k) => k + 1);

  const hiddenAppointments = Math.max(0, totalCount - appointments.length);

  return (
    <>
      <ToastProvider />

      <div className="min-h-screen max-w-screen bg-surface">
        <div className="flex flex-col gap-6 px-4 py-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Minha Agenda</h1>
              <p className="mt-0.5 text-sm text-fg-muted">
                {loading
                  ? 'Carregando…'
                  : `${stats.appointments} ${plural(stats.appointments, 'consulta', 'consultas')} · ${stats.freeSlots} ${plural(stats.freeSlots, 'horário livre', 'horários livres')}`}
              </p>
            </div>

            <Button size="sm" variant="outline" onPress={() => navigate('/medico/disponibilidade')}>
              <Settings className="size-4" />
              Configurar Horários
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <ToggleButtonGroup
                selectionMode="single"
                disallowEmptySelection
                selectedKeys={new Set([period])}
                onSelectionChange={(keys) => {
                  const val = [...keys][0];
                  changePeriod(isSchedulePeriod(val) ? val : DEFAULT_SCHEDULE_PERIOD);
                }}
                className="flex flex-wrap gap-2"
              >
                {SCHEDULE_PERIODS.map(({ key, label }) => (
                  <ToggleButton key={key} id={key} size="sm">
                    {label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              <ToggleButton size="sm" isSelected={onlyPending} onChange={setOnlyPending}>
                <CircleAlert className="size-4" />
                Pendências
                {!loading && (
                  <span
                    className={`rounded-full px-1.5 text-xs font-semibold tabular-nums ${
                      pendingCount > 0 ? 'bg-warning-subtle text-warning-text' : 'bg-surface-secondary text-fg-muted'
                    }`}
                  >
                    {pendingCount}
                  </span>
                )}
              </ToggleButton>
            </div>

            <Button
              variant="ghost"
              size="sm"
              isIconOnly
              onPress={reloadAll}
              isDisabled={refreshing}
              aria-label="Atualizar agenda"
            >
              <span title="Atualizar agenda" className="inline-flex">
                <RotateCcw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
              </span>
            </Button>
          </div>

          {error && (
            <Card className="border-danger-soft-hover bg-danger/5">
              <Card.Content className="flex items-center gap-2 p-3 text-sm text-danger">
                <CircleAlert strokeWidth={1.25} />
                {error}
              </Card.Content>
            </Card>
          )}

          {!loading && slotsError && (
            <Card className="border-warning/30 bg-warning-subtle">
              <Card.Content className="flex items-center gap-2 p-3 text-sm text-warning-text">
                <CircleAlert strokeWidth={1.25} />
                {slotsError} As consultas continuam sendo exibidas.
              </Card.Content>
            </Card>
          )}

          {!loading && !error && hiddenAppointments > 0 && (
            <Card className="border-warning/30 bg-warning-subtle">
              <Card.Content className="flex items-center gap-2 p-3 text-sm text-warning-text">
                <CircleAlert strokeWidth={1.25} />
                Exibindo {appointments.length} de {totalCount} consultas. Veja a lista completa na tela de Consultas.
              </Card.Content>
            </Card>
          )}

          {loading ? (
            <ScheduleSkeleton />
          ) : error ? null : (
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
              <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:order-last">
                <AwaitingConfirmationPanel
                  appointments={awaiting}
                  totalCount={awaitingTotal}
                  error={awaitingError}
                  now={now}
                  onOpen={handleAppointmentClick}
                />
                {nextAppointment && (
                  <NextAppointment appointment={nextAppointment} now={now} onOpen={handleAppointmentClick} />
                )}
                <ScheduleSummary stats={stats} />
              </aside>

              <div className="min-w-0">
                {days.length === 0 ? (
                  <EmptyState period={period} onlyPending={onlyPending} />
                ) : (
                  <ScheduleTimeline
                    days={days}
                    now={now}
                    busyKey={busyKey}
                    onAppointmentClick={handleAppointmentClick}
                    onBlock={handleBlock}
                    onUnblock={handleUnblock}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        <ScheduleModal
          appointment={selectedAppointment}
          isOpen={appointmentModal.isOpen}
          onOpenChange={appointmentModal.setOpen}
          onChanged={handleChanged}
          now={now}
        />
      </div>
    </>
  );
}

export default SchedulePage;