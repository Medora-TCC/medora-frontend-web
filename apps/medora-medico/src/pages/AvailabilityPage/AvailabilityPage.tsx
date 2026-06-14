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
import AvailabilityService from '../../api/services/Availability';
import { EditAvailabilityModal } from '../../modals/AvailabilityModals/EditAvailability';


export type SlotMode = 'presential' | 'telemedicine' | 'hybrid';

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
  presential:   {
    label: 'Presencial',
    icon: <Building2 size={13} />,
    colorClass: 'text-primary-text',
    bgClass: 'bg-primary-subtle',
    borderClass: 'border-primary/30',
  },
  telemedicine: {
    label: 'Telemedicina',
    icon: <Monitor size={13} />,
    colorClass: 'text-warning-text',
    bgClass: 'bg-warning-subtle',
    borderClass: 'border-warning/30',
  },
  hybrid: {
    label: 'Ambos',
    icon: <RefreshCw size={13} />,
    colorClass: 'text-success-text',
    bgClass: 'bg-success-subtle',
    borderClass: 'border-success/30',
  },
};


const uid = () => Math.random().toString(36).slice(2, 9);


function SelectField({
  label,
  icon,
  value,
  onChange,
  options,
}: {
  label: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
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
}: {
  value: SlotMode;
  onChange: (v: SlotMode) => void;
}) {
  const cfg = MODE_CONFIG[value];
  return (
    <div className={`relative flex items-center border rounded-lg h-9 px-2.5 pr-7 text-xs font-medium cursor-pointer transition-colors ${cfg.bgClass} ${cfg.borderClass} ${cfg.colorClass}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SlotMode)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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
}: {
  value: string;
  onChange: (v: string) => void;
  hasError?: boolean;
}) {
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
  const [visibleHistory, setVisibleHistory] = useState<any[]>([]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDayData, setEditingDayData] = useState<any>(null);

  const doctorId = '1';
  const token = '';


  const fetchAvailabilityHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const start = new Date().toISOString().split('T')[0];
      const end = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const response = await AvailabilityService.GetAllAvailabilityByRangeDateAndDoctorId(
        doctorId, start, end, token,
      );
console.log(response);

      if (Array.isArray(response)) {
        const grouped: Record<string, any> = {};
        response.forEach((slot: any) => {
          if (!slot.startDateTime) return;
          const key = slot.startDateTime.split('T')[0];
          if (!grouped[key]) {
            grouped[key] = { id: slot.id, date: key, start: slot.time, end: slot.time, duration: 15, slots: 0, isSeries: false };
          }
          grouped[key].slots += 1;
          if (slot.time < grouped[key].start) grouped[key].start = slot.time;
          const timeEnd = "23:59"
          if (timeEnd > grouped[key].end) grouped[key].end = timeEnd;
        });
        console.log("teste" , Object.values(grouped).sort((a: any, b: any) => a.date.localeCompare(b.date)));
        setVisibleHistory(
          Object.values(grouped).sort((a: any, b: any) => a.date.localeCompare(b.date)),
        );
      } else {
        setVisibleHistory([]);
      }
    } catch {
      toast.danger('Erro ao carregar os horários cadastrados.');
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
        { id: uid(), start: '08:00', end: '12:00', mode: 'presential' as SlotMode },
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
    let valid = true;
    Object.values(shifts).flat().forEach((s) => {
      if (s.start >= s.end) {
        errors[s.id] = 'Horário final deve ser maior que o inicial';
        valid = false;
      }
    });
    setShiftErrors(errors);
    return valid;
  }, [shifts]);

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
      const weekDayEntries = Object.entries(shifts).map(([day, dayShifts]) => ({
        weekDay: Number(day),
        shifts: dayShifts.map((s) => ({ start: s.start, end: s.end, mode: s.mode })),
      }));
      await AvailabilityService.CreateDailyAvailability(
        { doctorId, duration: parseInt(duration), repeatWeeks: parseInt(repeatWeeks), weekDays: weekDayEntries },
        token,
      );
      toast.success('Grade de horários salva com sucesso!');
      setShifts({});
      fetchAvailabilityHistory();
    } catch {
      toast.danger('Erro ao salvar os horários.');
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
                        {item.isSeries && (
                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                            Série
                          </span>
                        )}
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
                      aria-label="Excluir agenda"
                      onClick={async () => {
                        try {
                          await AvailabilityService.DeleteAvailabilityById(item.id, token);
                          toast.success('Agenda excluída com sucesso!');
                          fetchAvailabilityHistory();
                        } catch {
                          toast.danger('Erro ao excluir agenda.');
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
