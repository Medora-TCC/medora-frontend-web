import { useState, useCallback, useEffect } from 'react';
import { Card, toast, ToastProvider, Button } from '@heroui/react';
import {
  Clock,
  CheckCircle2,
  Pencil,
  Trash2,
  Plus,
  Monitor,
  Building2,
  RefreshCw,
  Calendar,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import { type DailyAvailabilitySlotDTO } from '@medora_web/shared';
import AvailabilityService, { DEFAULT_TIME_ZONE } from '../../api/services/Availability';
import { errorMessage } from '../../api/errors';
import { EditAvailabilityModal } from '../../modals/AvailabilityModals/EditAvailability';


export type SlotMode = 'InPerson' | 'Online' | 'Any';

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

const DURATION_OPTIONS = [
  { label: '15 minutos', value: '15' },
  { label: '20 minutos', value: '20' },
  { label: '30 minutos', value: '30' },
  { label: '45 minutos', value: '45' },
  { label: '60 minutos', value: '60' },
];

const REPEAT_OPTIONS = [
  { label: '1 semana',  value: '1'  },
  { label: '2 semanas', value: '2'  },
  { label: '4 semanas', value: '4'  },
  { label: '6 semanas', value: '6'  },
  { label: '8 semanas', value: '8'  },
];

const MODE_CONFIG: Record<SlotMode, {
  label: string;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}> = {
  InPerson:   {
    label: 'Presencial',
    icon: <Building2 size={13} />,
    colorClass: 'text-primary-text',
    bgClass: 'bg-primary-subtle',
    borderClass: 'border-primary/30',
  },
  Online: {
    label: 'Telemedicina',
    icon: <Monitor size={13} />,
    colorClass: 'text-violet-700',
    bgClass: 'bg-violet-100',
    borderClass: 'border-violet-300',
  },
  Any: {
    label: 'Ambos',
    icon: <RefreshCw size={13} />,
    colorClass: 'text-success-text',
    bgClass: 'bg-success-subtle',
    borderClass: 'border-success/30',
  },
};


const uid = () => Math.random().toString(36).slice(2, 9);

const HISTORY_DAYS = 5;

interface HistoryDay {
  id: string;
  date: string;
  scheduleId: number;
  start: string;
  end: string;
  duration: number;
  slots: number;
}

const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const minutesOf = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

function toHistoryDay(date: string, slots: DailyAvailabilitySlotDTO[]): HistoryDay[] {
  if (!Array.isArray(slots) || slots.length === 0) return [];

  const ordered = [...slots].sort((a, b) => a.startDateTime.localeCompare(b.startDateTime));
  const first = ordered[0];
  const last = ordered[ordered.length - 1];
  const end = last.endDateTime.slice(11, 16);

  return [{
    id: date,
    date,
    scheduleId: first.scheduleId,
    start: first.time,
    end,
    duration: minutesOf(first.endDateTime.slice(11, 16)) - minutesOf(first.time),
    slots: ordered.length
  }];
}


function SelectField({
  label,
  icon,
  value,
  onChange,
  options,
}: Readonly<{
  label: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-text-secondary flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      <div className="relative flex items-center border border-border rounded-lg bg-surface h-10 focus-within:border-primary-hover transition-colors">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full px-3 pr-8 bg-transparent outline-none text-sm text-text-primary cursor-pointer appearance-none"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-surface text-text-primary">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 pointer-events-none text-text-muted" />
      </div>
    </div>
  );
}

function ModeSelect({
  value,
  onChange,
}: Readonly<{
  value: SlotMode;
  onChange: (v: SlotMode) => void;
}>) {
  const cfg = MODE_CONFIG[value];
  return (
    <div className={`relative flex items-center border rounded-lg h-9 px-2.5 pr-7 text-xs font-medium cursor-pointer transition-colors ${cfg.bgClass} ${cfg.borderClass} ${cfg.colorClass}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SlotMode)}
        className="absolute inset-0 w-full h-full opacity-0 text-text-primary cursor-pointer bg-surface"
      >
        {(Object.keys(MODE_CONFIG) as SlotMode[]).map((k) => (
          <option key={k} value={k}>{MODE_CONFIG[k].label}</option>
        ))}
      </select>
      <span className="flex items-center gap-1.5 pointer-events-none whitespace-nowrap">
        {cfg.icon}
        {cfg.label}
      </span>
      <ChevronDown size={11} className="absolute right-2 pointer-events-none opacity-50" />
    </div>
  );
}

function TimeInput({
  value,
  onChange,
  hasError,
}: Readonly<{
  value: string;
  onChange: (v: string) => void;
  hasError?: boolean;
}>) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-9 px-2.5 rounded-lg border text-sm text-text-primary bg-surface outline-none transition-colors
        focus:border-primary-hover
        ${hasError ? 'border-danger bg-danger-subtle' : 'border-border'}`}
    />
  );
}


export default function AvailabilityPage() {
  const [duration, setDuration] = useState('15');
  const [repeatWeeks, setRepeatWeeks] = useState('4');
  const [shifts, setShifts] = useState<Record<number, DayShift[]>>({});
  const [shiftErrors, setShiftErrors] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [visibleHistory, setVisibleHistory] = useState<HistoryDay[]>([]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDayData, setEditingDayData] = useState<HistoryDay | null>(null);

  const fetchAvailabilityHistory = async () => {
    try {
      setIsLoadingHistory(true);

      const dates = Array.from({ length: HISTORY_DAYS }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return toDateStr(d);
      });

      const days = await Promise.all(
        dates.map((date) => AvailabilityService.getDailySchedule(date)),
      );

      setVisibleHistory(
        days.flatMap((slots, i) => toHistoryDay(dates[i], slots)),
      );
    } catch (err) {
      toast.danger(errorMessage(err, 'Erro ao carregar os horários cadastrados.'));
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => { fetchAvailabilityHistory(); }, []);


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
      fetchAvailabilityHistory();
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

        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-primary-text">Próximos 5 dias configurados</h2>
            <p className="text-sm text-text-secondary mt-0.5">
              Resumo das suas próximas agendas cadastradas.
            </p>
          </div>

          {isLoadingHistory ? (
            <div className="text-center py-10 rounded-xl border border-border bg-surface-alt">
              <p className="text-sm text-text-muted animate-pulse">Carregando agendas...</p>
            </div>
          ) : visibleHistory.length === 0 ? (
            <div className="text-center py-10 rounded-xl border border-dashed border-border bg-surface-alt">
              <Calendar size={30} className="mx-auto text-text-muted mb-2 opacity-40" />
              <p className="text-sm font-medium text-text-secondary">Nenhuma agenda encontrada</p>
              <p className="text-xs text-text-muted mt-1">Configure novos turnos acima e salve.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {visibleHistory.map((item) => (
                <Card
                  key={item.id}
                  className="p-4 border border-border bg-surface shadow-none rounded-xl relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-0.5 h-full bg-primary opacity-70" />

                  <div className="pl-3 flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-primary-text flex items-center gap-1.5 flex-wrap">
                        {new Date(item.date).toLocaleDateString('pt-BR', {
                          timeZone: 'UTC',
                          weekday: 'short',
                          day: '2-digit',
                          month: 'short',
                        })}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-text-secondary">
                        <Clock size={12} />
                        {item.start} às {item.end}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary whitespace-nowrap">
                        {item.duration} min
                      </span>
                      <span className="text-xs text-text-muted">{item.slots} vagas</span>
                    </div>
                  </div>

                  <div className="pl-3 mt-3 pt-3 border-t border-border flex justify-end gap-1">
                    <button
                      className="p-1.5 rounded-md text-primary hover:bg-primary/10 transition-colors"
                      aria-label="Editar agenda"
                      onClick={() => { setEditingDayData(item); setIsEditModalOpen(true); }}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="p-1.5 rounded-md text-danger hover:bg-danger-subtle transition-colors"
                      aria-label="Bloquear agenda do dia"
                      onClick={async () => {
                        try {
                          const { canceledAppointments } = await AvailabilityService.createBlock({
                            date: item.date,
                            startTime: item.start,
                            endTime: item.end,
                            timeZoneId: DEFAULT_TIME_ZONE,
                          });
                          toast.success(
                            canceledAppointments > 0
                              ? `Agenda bloqueada. ${canceledAppointments} consulta(s) cancelada(s).`
                              : 'Agenda bloqueada com sucesso!',
                          );
                          fetchAvailabilityHistory();
                        } catch (err) {
                          toast.danger(errorMessage(err, 'Erro ao bloquear a agenda.'));
                        }
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-center pt-2">
            <button
              onClick={() => (window.location.href = 'agenda')}
              className="text-sm font-medium text-primary hover:text-primary-hover underline underline-offset-2 transition-colors"
            >
              Ver agenda completa e editar horários →
            </button>
          </div>
        </div>

      </div>

      <EditAvailabilityModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        dayData={editingDayData}
        editType="single"
      />
    </>
  );
}