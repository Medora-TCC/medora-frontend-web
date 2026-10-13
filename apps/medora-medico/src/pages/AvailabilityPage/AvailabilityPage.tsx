import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, toast, ToastProvider, Button } from '@heroui/react';
import {
  Clock,
  CheckCircle2,
  Pencil,
  Trash2,
  Plus,
  Calendar,
  AlertCircle,
  Ban,
  Power,
} from 'lucide-react';
import { type DailyAvailabilitySlotDTO } from '@medora_web/shared';
import AvailabilityService, { DEFAULT_TIME_ZONE } from '../../api/services/Availability';
import { errorMessage } from '../../api/errors';
import {
  DeactivateShiftModal,
  EditShiftModal,
  ExtraHoursModal,
  type ShiftSummary,
} from '../../modals/AvailabilityModals/ShiftModals';
import { ModeSelect, SelectField, TimeInput } from './AvailabilityFields';
import {
  DURATION_OPTIONS,
  MODE_CONFIG,
  type SlotMode,
  minutesOf,
  toDateStr,
  tomorrowStr,
} from './availabilityConfig';


interface DayShift {
  id: string;
  start: string;
  end: string;
  mode: SlotMode;
}

interface WeekDay {
  label: string;
  value: number;
}


const WEEK_DAYS: WeekDay[] = [
  { label: 'Segunda',  value: 1 },
  { label: 'Terça',    value: 2 },
  { label: 'Quarta',   value: 3 },
  { label: 'Quinta',   value: 4 },
  { label: 'Sexta',    value: 5 },
  { label: 'Sábado',   value: 6 },
  { label: 'Domingo',  value: 0 },
];

const REPEAT_OPTIONS = [
  { label: '1 semana',  value: '1'  },
  { label: '2 semanas', value: '2'  },
  { label: '4 semanas', value: '4'  },
  { label: '6 semanas', value: '6'  },
  { label: '8 semanas', value: '8'  },
];

const uid = () => Math.random().toString(36).slice(2, 9);

const DAYS_AHEAD = 7;

const STATUS_CFG: Record<DailyAvailabilitySlotDTO['status'], { label: string; chip: string; action?: string }> = {
  Available: {
    label: 'Livre',
    chip: 'border-border bg-surface text-text-primary hover:border-danger hover:bg-danger-subtle',
    action: 'Bloquear',
  },
  Booked: {
    label: 'Consulta',
    chip: 'border-primary/30 bg-primary/10 text-primary-text cursor-default',
  },
  Blocked: {
    label: 'Bloqueado',
    chip: 'border-danger/30 bg-danger-subtle text-danger-text line-through hover:no-underline',
    action: 'Desbloquear',
  },
};

function groupIntoShifts(slots: DailyAvailabilitySlotDTO[]): { shift: ShiftSummary; slots: DailyAvailabilitySlotDTO[] }[] {
  const groups = new Map<number, DailyAvailabilitySlotDTO[]>();

  for (const slot of slots) {
    groups.set(slot.scheduleId, [...(groups.get(slot.scheduleId) ?? []), slot]);
  }

  return [...groups.values()]
    .map((group) => {
      const ordered = [...group].sort((a, b) => a.startTime.localeCompare(b.startTime));
      const first = ordered[0];
      return {
        shift: {
          scheduleId: first.scheduleId,
          isRecurring: first.isRecurring,
          start: first.startTime,
          end: ordered[ordered.length - 1].endTime,
          duration: minutesOf(first.endTime) - minutesOf(first.startTime),
          type: first.type,
        },
        slots: ordered,
      };
    })
    .sort((a, b) => a.shift.start.localeCompare(b.shift.start));
}

const nextDays = () =>
  Array.from({ length: DAYS_AHEAD }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return toDateStr(d);
  });

const dayChipLabel = (date: string, index: number) => {
  const d = new Date(`${date}T12:00:00`);
  return {
    top: index === 0 ? 'Hoje' : d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
    sub: String(d.getDate()).padStart(2, '0'),
  };
};

type OpenModal =
  | { kind: 'edit'; shift: ShiftSummary }
  | { kind: 'deactivate'; shift: ShiftSummary }
  | { kind: 'extra' }
  | null;


export default function AvailabilityPage() {
  const [duration, setDuration] = useState('15');
  const [repeatWeeks, setRepeatWeeks] = useState('4');
  const [shifts, setShifts] = useState<Record<number, DayShift[]>>({});
  const [shiftErrors, setShiftErrors] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const days = nextDays();
  const [selectedDate, setSelectedDate] = useState(days[0]);
  const [daySlots, setDaySlots] = useState<DailyAvailabilitySlotDTO[]>([]);
  const [isLoadingDay, setIsLoadingDay] = useState(true);
  const [busySlotKey, setBusySlotKey] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState<OpenModal>(null);

  const fetchDay = useCallback(async (date: string) => {
    try {
      setIsLoadingDay(true);
      setDaySlots(await AvailabilityService.getDailySchedule(date));
    } catch (err) {
      setDaySlots([]);
      toast.danger(errorMessage(err, 'Erro ao carregar os horários do dia.'));
    } finally {
      setIsLoadingDay(false);
    }
  }, []);

  useEffect(() => { fetchDay(selectedDate); }, [fetchDay, selectedDate]);

  const refreshDay = () => fetchDay(selectedDate);

  const closeModalAndRefresh = () => {
    setOpenModal(null);
    refreshDay();
  };

  const toggleSlotBlock = async (slot: DailyAvailabilitySlotDTO) => {
    if (slot.status === 'Booked') return;

    try {
      setBusySlotKey(slot.slotKey);
      if (slot.status === 'Blocked' && slot.blockId) {
        await AvailabilityService.removeBlock(slot.blockId);
      } else {
        await AvailabilityService.createBlock({
          date: selectedDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
          timeZoneId: DEFAULT_TIME_ZONE,
        });
      }
      await fetchDay(selectedDate);
    } catch (err) {
      toast.danger(errorMessage(err, 'Erro ao atualizar o horário.'));
    } finally {
      setBusySlotKey(null);
    }
  };

  const blockWholeDay = async () => {
    const ordered = [...daySlots].sort((a, b) => a.startTime.localeCompare(b.startTime));
    if (ordered.length === 0) return;

    // Bloquear o dia cancela as consultas marcadas nele; um horário livre não tem consulta pra cancelar.
    const hasBooked = ordered.some((s) => s.status === 'Booked');
    const question = hasBooked
      ? 'Bloquear o dia inteiro? As consultas marcadas neste dia serão canceladas.'
      : 'Bloquear o dia inteiro?';
    if (!window.confirm(question)) return;

    try {
      const { canceledAppointments } = await AvailabilityService.createBlock({
        date: selectedDate,
        startTime: ordered[0].startTime,
        endTime: ordered[ordered.length - 1].endTime,
        timeZoneId: DEFAULT_TIME_ZONE,
      });
      toast.success(
        canceledAppointments > 0
          ? `Dia bloqueado. ${canceledAppointments} consulta(s) cancelada(s).`
          : 'Dia bloqueado.',
      );
      refreshDay();
    } catch (err) {
      toast.danger(errorMessage(err, 'Erro ao bloquear o dia.'));
    }
  };

  const shiftsOfDay = groupIntoShifts(daySlots);


  const addShift = useCallback((dayValue: number) => {
    setShifts((prev) => ({
      ...prev,
      [dayValue]: [
        ...(prev[dayValue] ?? []),
        { id: uid(), start: '08:00', end: '12:00', mode: 'InPerson' as SlotMode },
      ],
    }));
  }, []);

  const removeShift = useCallback((dayValue: number, shiftId: string) => {
    setShifts((prev) => {
      const updated = (prev[dayValue] ?? []).filter((s) => s.id !== shiftId);
      const next = { ...prev };
      if (updated.length === 0) delete next[dayValue];
      else next[dayValue] = updated;
      return next;
    });
    setShiftErrors((prev) => {
      const next = { ...prev };
      delete next[shiftId];
      return next;
    });
  }, []);

  const updateShift = useCallback(<K extends keyof DayShift>(
    dayValue: number,
    shiftId: string,
    field: K,
    value: DayShift[K],
  ) => {
    setShifts((prev) => ({
      ...prev,
      [dayValue]: (prev[dayValue] ?? []).map((s) =>
        s.id === shiftId ? { ...s, [field]: value } : s,
      ),
    }));
    if (field === 'start' || field === 'end') {
      setShiftErrors((prev) => { const next = { ...prev }; delete next[shiftId]; return next; });
    }
  }, []);


  const validate = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    const slotDuration = Number.parseInt(duration);

    Object.entries(shifts).forEach(([, dayShifts]) => {
      dayShifts.forEach((s) => {
        if (s.start >= s.end) {
          errors[s.id] = 'Horário final deve ser maior que o inicial';
          return;
        }
        if ((minutesOf(s.end) - minutesOf(s.start)) % slotDuration !== 0) {
          errors[s.id] = `O turno deve ser múltiplo de ${slotDuration} minutos`;
        }
      });

      const ordered = [...dayShifts]
        .filter((s) => s.start < s.end)
        .sort((a, b) => a.start.localeCompare(b.start));

      ordered.forEach((s, i) => {
        const next = ordered[i + 1];
        if (next && s.end > next.start) {
          errors[next.id] = 'Este turno se sobrepõe a outro no mesmo dia';
        }
      });
    });

    setShiftErrors(errors);
    return Object.keys(errors).length === 0;
  }, [shifts, duration]);

  const handleSave = async () => {
    if (!validate()) {
      toast.warning('Corrija os horários com erro antes de salvar.');
      return;
    }
    if (Object.keys(shifts).length === 0) {
      toast.warning('Adicione pelo menos um turno para salvar.');
      return;
    }
    try {
      setLoading(true);

      const apiShifts = Object.entries(shifts).flatMap(([day, dayShifts]) =>
        dayShifts.map((s) => ({
          weekDay: Number(day),
          startTime: s.start,
          endTime: s.end,
          type: s.mode,
        })),
      );

      const start = new Date();
      const end = new Date(start);
      end.setDate(end.getDate() + Number.parseInt(repeatWeeks) * 7 - 1);

      await AvailabilityService.createRecurringSchedule({
        slotDurationMinutes: Number.parseInt(duration),
        recurrenceStartDate: toDateStr(start),
        recurrenceEndDate: toDateStr(end),
        timeZoneId: DEFAULT_TIME_ZONE,
        shifts: apiShifts,
      });

      toast.success('Grade de horários salva com sucesso!');
      setShifts({});
      refreshDay();
    } catch (err) {
      toast.danger(errorMessage(err, 'Erro ao salvar os horários.'));
    } finally {
      setLoading(false);
    }
  };

  const hasAnyShift = Object.keys(shifts).length > 0;

  return (
    <>
      <ToastProvider />

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        <div>
          <h1 className="text-2xl font-bold text-primary-text">Configurar Horários</h1>
          <p className="text-text-secondary mt-1 text-sm leading-relaxed">
            Defina seus turnos de trabalho. Nossa plataforma gerará automaticamente os horários
            fracionados para agendamento.
          </p>
        </div>

        <Card className="p-5 border border-border bg-surface shadow-none rounded-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Duração Padrão da Consulta"
              icon={<Clock size={13} />}
              value={duration}
              onChange={setDuration}
              options={DURATION_OPTIONS}
            />
            <SelectField
              label="Repetir padrão por"
              icon={<Calendar size={13} />}
              value={repeatWeeks}
              onChange={setRepeatWeeks}
              options={REPEAT_OPTIONS}
            />
          </div>
        </Card>

        <Card className="border border-border bg-surface shadow-none rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-primary-text">Turnos Semanais</h2>
          </div>

          <div className="divide-y divide-border">
            {WEEK_DAYS.map((day) => {
              const dayShifts = shifts[day.value] ?? [];
              const isEmpty = dayShifts.length === 0;

              return (
                <div
                  key={day.value}
                  className="flex items-start gap-4 px-5 py-3.5 hover:bg-surface-alt transition-colors group"
                >
                  <div className="w-20 shrink-0 pt-2">
                    <span className="text-sm font-medium text-text-primary">{day.label}</span>
                  </div>

                  <div className="flex flex-col gap-2.5 flex-1 min-w-0">
                    {isEmpty ? (
                      <span className="text-sm text-text-muted italic pt-1.5">
                        Indisponível neste dia
                      </span>
                    ) : (
                      dayShifts.map((shift) => (
                        <div key={shift.id} className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <TimeInput
                              value={shift.start}
                              onChange={(v) => updateShift(day.value, shift.id, 'start', v)}
                              hasError={!!shiftErrors[shift.id]}
                            />
                            <span className="text-xs text-text-muted">até</span>
                            <TimeInput
                              value={shift.end}
                              onChange={(v) => updateShift(day.value, shift.id, 'end', v)}
                              hasError={!!shiftErrors[shift.id]}
                            />
                            <ModeSelect
                              value={shift.mode}
                              onChange={(v) => updateShift(day.value, shift.id, 'mode', v)}
                            />
                            <button
                              onClick={() => removeShift(day.value, shift.id)}
                              className="p-1.5 rounded-md text-danger hover:bg-danger-subtle transition-colors"
                              aria-label="Remover turno"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                          {shiftErrors[shift.id] && (
                            <span className="flex items-center gap-1 text-xs text-danger">
                              <AlertCircle size={12} />
                              {shiftErrors[shift.id]}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="shrink-0 pt-1.5">
                    <button
                      onClick={() => addShift(day.value)}
                      className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover transition-colors
                        opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <Plus size={14} />
                      Adicionar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-5 py-4 border-t border-border bg-surface-alt flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-xs text-text-muted">
              Os horários serão fracionados automaticamente com base na duração configurada.
            </p>
            <Button
              onClick={handleSave}
              isDisabled={!hasAnyShift || loading}
              className="shrink-0 bg-primary text-white font-semibold rounded-md px-5 h-10 flex items-center gap-2
                hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {!loading && <CheckCircle2 size={16} />}
              Salvar Grade de Horários
            </Button>
          </div>
        </Card>

        <Card className="border border-border bg-surface shadow-none rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-primary-text">Seus horários</h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Clique num horário livre para bloquear, ou num bloqueado para liberar.
              </p>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {days.map((date, index) => {
                const { top, sub } = dayChipLabel(date, index);
                const isActive = date === selectedDate;
                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`flex flex-col items-center justify-center rounded-lg px-2.5 py-1.5 min-w-12 transition-all
                      ${isActive ? 'bg-primary text-white shadow-sm' : 'hover:bg-surface-alt text-text-secondary'}`}
                  >
                    <span className={`text-[10px] font-semibold uppercase tracking-wide ${isActive ? 'text-white' : 'text-text-muted'}`}>{top}</span>
                    <span className="text-base font-bold leading-tight">{sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-5 space-y-5">
            {isLoadingDay ? (
              <p className="text-sm text-text-muted animate-pulse text-center py-6">Carregando horários...</p>
            ) : shiftsOfDay.length === 0 ? (
              <div className="text-center py-6">
                <Calendar size={30} className="mx-auto text-text-muted mb-2 opacity-40" />
                <p className="text-sm font-medium text-text-secondary">Sem horários neste dia</p>
                <p className="text-xs text-text-muted mt-1">Configure turnos semanais acima ou adicione um horário extra.</p>
              </div>
            ) : (
              shiftsOfDay.map(({ shift, slots }) => {
                const mode = MODE_CONFIG[shift.type];
                return (
                  <div key={shift.scheduleId} className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap text-sm">
                        <span className="font-semibold text-text-primary flex items-center gap-1">
                          <Clock size={13} /> {shift.start} às {shift.end}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded ${mode.bgClass} ${mode.colorClass}`}>
                          {mode.icon} {mode.label}
                        </span>
                        <span className="text-xs text-text-muted">
                          {shift.duration} min · {shift.isRecurring ? 'toda semana' : 'só neste dia'}
                        </span>
                      </div>
                      {(shift.isRecurring || selectedDate >= tomorrowStr()) && (
                        <div className="flex gap-1">
                          {shift.isRecurring && (
                            <button
                              onClick={() => setOpenModal({ kind: 'edit', shift })}
                              className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md text-primary hover:bg-primary/10 transition-colors"
                            >
                              <Pencil size={13} /> Alterar
                            </button>
                          )}
                          <button
                            onClick={() => setOpenModal({ kind: 'deactivate', shift })}
                            className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md text-danger hover:bg-danger-subtle transition-colors"
                          >
                            <Power size={13} /> Desativar
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2">
                      {slots.map((slot) => {
                        const cfg = STATUS_CFG[slot.status];
                        const isBusy = busySlotKey === slot.slotKey;
                        return (
                          <button
                            key={slot.slotKey}
                            onClick={() => toggleSlotBlock(slot)}
                            disabled={slot.status === 'Booked' || isBusy}
                            title={cfg.action ? `${cfg.action} ${slot.startTime}` : 'Consulta marcada — veja na Agenda'}
                            className={`flex flex-col items-center py-1.5 rounded-lg border text-sm font-semibold tabular-nums transition-colors disabled:opacity-60 ${cfg.chip}`}
                          >
                            {slot.startTime}
                            <span className="text-[10px] font-medium no-underline">{isBusy ? '...' : cfg.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="px-5 py-4 border-t border-border bg-surface-alt flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <button
              onClick={() => navigate('/medico/agenda')}
              className="text-sm font-medium text-primary hover:text-primary-hover underline underline-offset-2 transition-colors"
            >
              Ver consultas na Agenda →
            </button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onPress={() => setOpenModal({ kind: 'extra' })}
                className="flex items-center gap-1.5 text-sm rounded-md"
              >
                <Plus size={14} /> Horário extra
              </Button>
              <Button
                variant="outline"
                onPress={blockWholeDay}
                isDisabled={daySlots.length === 0}
                className="flex items-center gap-1.5 text-sm rounded-md text-danger border-danger/40"
              >
                <Ban size={14} /> Bloquear dia
              </Button>
            </div>
          </div>
        </Card>

      </div>

      {openModal?.kind === 'edit' && (
        <EditShiftModal
          shift={openModal.shift}
          date={selectedDate}
          onClose={() => setOpenModal(null)}
          onSaved={closeModalAndRefresh}
        />
      )}
      {openModal?.kind === 'deactivate' && (
        <DeactivateShiftModal
          shift={openModal.shift}
          date={selectedDate}
          onClose={() => setOpenModal(null)}
          onSaved={closeModalAndRefresh}
        />
      )}
      {openModal?.kind === 'extra' && (
        <ExtraHoursModal
          date={selectedDate}
          onClose={() => setOpenModal(null)}
          onSaved={closeModalAndRefresh}
        />
      )}
    </>
  );
}
