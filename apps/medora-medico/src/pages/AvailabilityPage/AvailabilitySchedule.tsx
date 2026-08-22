import { useState, useMemo, useEffect } from 'react';
import {
  Settings, ChevronLeft, ChevronRight,
  Video, User, Clock, Trash2, CheckCircle2,
  Loader2, Building2, Monitor, RefreshCw, CalendarDays,
} from 'lucide-react';
import { Card, Button } from '@heroui/react';
import { EditAvailabilityModal } from '../../modals/AvailabilityModals/EditAvailability';
import { type DailyAvailabilitySlotDTO } from '@medora_web/shared';
import AvailabilityService, { DEFAULT_TIME_ZONE } from '../../api/services/Availability';


type SlotType   = 'InPerson' | 'Online' | 'Any';
type SlotStatus = 'Available' | 'Scheduled' | 'Confirmed' | 'Canceled' | 'Completed';

const TYPE_CFG: Record<SlotType, {
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  pill: string;         
  iconBg: string;       
  stripe: string;       
}> = {
  InPerson: {
    label: 'Presencial',
    shortLabel: 'Presencial',
    icon: <Building2 size={15} />,
    pill:    'bg-primary/10 text-primary-text border border-primary/20',
    iconBg:  'bg-primary/10 text-primary-text',
    stripe:  'bg-primary',
  },
  Online: {
    label: 'Telemedicina',
    shortLabel: 'Telemed.',
    icon: <Monitor size={15} />,
    pill:    'bg-violet-100 text-violet-700 border border-violet-200',
    iconBg:  'bg-violet-100 text-violet-600',
    stripe:  'bg-violet-500',
  },
  Any: {
    label: 'Ambos',
    shortLabel: 'Ambos',
    icon: <RefreshCw size={15} />,
    pill:    'bg-teal-50 text-teal-700 border border-teal-200',
    iconBg:  'bg-teal-50 text-teal-600',
    stripe:  'bg-gradient-to-b from-primary via-violet-500 to-teal-500',
  },
};


const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const todayStr = () => toDateStr(new Date());

const slotDurationOf = (slot: DailyAvailabilitySlotDTO) =>
  Math.round((Date.parse(slot.endDateTime) - Date.parse(slot.startDateTime)) / 60_000);

const addMinutes = (time: string, minutes: number) => {
  const [hours, mins] = time.split(':').map(Number);
  const total = hours * 60 + mins + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

const dayLabel = (d: Date): { top: string; sub: string } => {
  const today     = new Date(); today.setHours(0,0,0,0);
  const tomorrow  = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const t = new Date(d); t.setHours(12,0,0,0);

  if (t.toDateString() === today.toDateString())
    return { top: 'Hoje', sub: String(t.getUTCDate()).padStart(2, '0') };
  if (t.toDateString() === tomorrow.toDateString())
    return { top: 'Amanhã', sub: String(t.getUTCDate()).padStart(2, '0') };
  if (t.toDateString() === yesterday.toDateString())
    return { top: 'Ontem', sub: String(t.getUTCDate()).padStart(2, '0') };
  return {
    top: t.toLocaleDateString('pt-BR', { weekday: 'short', timeZone: 'UTC' }).replace('.', ''),
    sub: String(t.getUTCDate()).padStart(2, '0'),
  };
};


function StatusBadge({ status, isPast }: Readonly<{ status: SlotStatus; isPast: boolean }>) {
  if (!isPast) {
    if (status === 'Confirmed')
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded bg-success-subtle text-success-text">
          <CheckCircle2 size={11} /> Confirmada
        </span>
      );
    if (status === 'Canceled')
      return <span className="text-xs font-medium px-2 py-0.5 rounded bg-danger-subtle text-danger-text">Recusada</span>;
  } else {
    if (status === 'Completed')
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded bg-success-subtle text-success-text">
          <CheckCircle2 size={11} /> Realizada
        </span>
      );
    if (status !== 'Available')
      return <span className="text-xs font-medium px-2 py-0.5 rounded bg-danger-subtle text-danger-text">Cancelada</span>;
  }
  return null;
}


export function AvailabilityHistorical() {
  const [selectedDate, setSelectedDate]     = useState<Date>(new Date());
  const [slots, setSlots]                   = useState<DailyAvailabilitySlotDTO[]>([]);
  const [isLoading, setIsLoading]           = useState(false);
  const [activeSlotKey, setActiveSlotKey]   = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const timelineDays = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(selectedDate);
      d.setDate(selectedDate.getDate() + i - 2);
      return d;
    });
  }, [selectedDate]);

  useEffect(() => {
    let active = true;
    setSlots([]);
    setActiveSlotKey(null);

    const fetch = async () => {
      setIsLoading(true);
      try {
        const dateStr = toDateStr(selectedDate);
        const res = await AvailabilityService.getDailySchedule(dateStr);
        if (active) {
          setSlots(res);
          if (res.length > 0) setActiveSlotKey(res[0].slotKey);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    fetch();
    return () => { active = false; };
  }, [selectedDate]);

  const handleBlockSlot = async (slot: DailyAvailabilitySlotDTO) => {
    try {
      await AvailabilityService.createBlock({
        date: toDateStr(selectedDate),
        startTime: slot.time,
        endTime: addMinutes(slot.time, slotDurationOf(slot)),
        timeZoneId: DEFAULT_TIME_ZONE,
      });
      setSlots(prev => {
        const next = prev.filter(s => s.slotKey !== slot.slotKey);
        if (activeSlotKey === slot.slotKey) setActiveSlotKey(next[0]?.slotKey ?? null);
        return next;
      });
    } catch (err) { console.error(err); }
  };

  const navigate = (delta: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d);
  };

  const isPast         = toDateStr(selectedDate) < todayStr();
  const activeSlot     = slots.find(s => s.slotKey === activeSlotKey) ?? null;
  const activeIsBooked = activeSlot ? activeSlot.status !== 'Available' : false;
  const activeType     = (activeSlot?.type ?? 'InPerson') as SlotType;
  const activeCfg      = TYPE_CFG[activeType];

  return (
    <>
      <div className="flex flex-col h-screen overflow-hidden bg-surface">

        <header className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-border bg-surface">
          <div>
            <h1 className="text-lg font-bold text-primary-text leading-tight">Minha Agenda</h1>
            <p className="text-xs text-text-secondary mt-0.5">
              {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <Button isIconOnly variant="ghost" size="sm" className="text-text-secondary" onClick={() => navigate(-1)}>
              <ChevronLeft size={18} />
            </Button>

            {timelineDays.map((date, idx) => {
              const isActive = idx === 2;
              const { top, sub } = dayLabel(date);
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center justify-center rounded-lg px-2.5 py-1.5 min-w-12 transition-all
                    ${isActive
                      ? 'bg-primary text-primary-text shadow-sm'
                      : 'hover:bg-surface-raised text-text-secondary'}`}
                >
                  <span className={`text-[10px] font-semibold uppercase tracking-wide ${isActive ? 'text-primary-text' : 'text-text-muted'}`}>{top}</span>
                  <span className={`text-base font-bold leading-tight ${isActive ? 'text-primary-text' : 'text-text-primary'}`}>{sub}</span>
                </button>
              );
            })}

            <Button isIconOnly variant="ghost" size="sm" className="text-text-secondary" onClick={() => navigate(1)}>
              <ChevronRight size={18} />
            </Button>

            <input
              type="date"
              className="ml-1 h-8 px-2 text-xs border border-border rounded-lg bg-surface text-text-primary outline-none focus:border-primary-hover transition-colors"
              value={toDateStr(selectedDate)}
              onChange={(e) => e.target.value && setSelectedDate(new Date(e.target.value + 'T12:00:00Z'))}
            />
          </div>

          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-1.5 text-text-secondary border-border rounded-md font-medium"
            onClick={() => (window.location.href = 'disponibilidade') }
          >
            <Settings size={15} />
            Configurar Horários
          </Button>
        </header>

        <div className="flex flex-1 overflow-hidden">

          <aside className="w-56 shrink-0 border-r border-border flex flex-col overflow-hidden bg-surface-alt">
            <div className="px-4 py-2.5 border-b border-border flex items-center gap-1.5">
              <Clock size={13} className="text-text-muted" />
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                {slots.length} horários
              </span>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <Loader2 size={24} className="animate-spin text-primary opacity-60" />
                  <span className="text-xs text-text-muted">Carregando...</span>
                </div>
              ) : slots.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 px-4 text-center">
                  <Clock size={28} className="text-text-muted opacity-30" />
                  <p className="text-sm font-medium text-text-secondary">Nenhum horário</p>
                  <p className="text-xs text-text-muted">Configure a disponibilidade deste dia.</p>
                </div>
              ) : (
                <ul className="py-1">
                  {slots.map((slot) => {
                    const isActive  = slot.slotKey === activeSlotKey;
                    const isBooked  = slot.status !== 'Available';
                    const cfg       = TYPE_CFG[(slot.type ?? 'InPerson') as SlotType];

                    return (
                      <li key={slot.slotKey}>
                        <button
                          onClick={() => setActiveSlotKey(slot.slotKey)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-l-2
                            ${isActive
                              ? 'bg-surface border-l-primary'
                              : 'border-l-transparent hover:bg-surface'}`}
                        >
                          <span className={`text-sm font-bold tabular-nums shrink-0 ${isActive ? 'text-primary-text' : 'text-text-primary'}`}>
                            {slot.time}
                          </span>

                          <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.stripe}`} />

                          <span className={`text-xs truncate ${isBooked ? 'text-text-primary font-medium' : 'text-text-muted'}`}>
                            {isBooked ? (slot.patientName ?? 'Paciente') : 'Livre'}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="px-4 py-3 border-t border-border space-y-1.5">
              {(Object.entries(TYPE_CFG) as [SlotType, typeof TYPE_CFG[SlotType]][]).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${v.stripe}`} />
                  <span className="text-[11px] text-text-muted">{v.label}</span>
                </div>
              ))}
            </div>
          </aside>

          <main className="flex-1 overflow-y-auto p-6">
            {!activeSlot ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-3">
                <CalendarDays size={40} className="text-text-muted opacity-30" />
                <p className="text-base font-medium text-text-secondary">
                  {isLoading ? 'Carregando agenda...' : 'Selecione um horário à esquerda'}
                </p>
              </div>
            ) : (
              <div className="max-w-lg mx-auto space-y-5">

                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${activeCfg.pill}`}>
                      <Clock size={14} />
                      {activeSlot.time}
                    </div>

                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${activeCfg.pill}`}>
                      {activeCfg.icon}
                      {activeCfg.label}
                    </div>
                  </div>

                  {!isPast && !activeIsBooked && (
                    <Button
                      isIconOnly variant="ghost" size="sm"
                      className="text-danger hover:bg-danger-subtle"
                      aria-label="Bloquear horário"
                      onPress={() => handleBlockSlot(activeSlot)}
                    >
                      <Trash2 size={15} />
                    </Button>
                  )}
                </div>

                {activeIsBooked ? (
                  <Card className="border border-border bg-surface shadow-none rounded-xl overflow-hidden">
                    <div className={`h-1 w-full ${activeCfg.stripe}`} />

                    <div className="p-5 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${activeCfg.iconBg}`}>
                          {activeType === 'InPerson' ? <User size={22} /> : <Video size={22} />}
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary">{activeSlot.patientName ?? 'Paciente'}</p>
                          <div className={`inline-flex items-center gap-1 text-xs font-medium mt-0.5 ${activeCfg.pill} px-2 py-0.5 rounded`}>
                            {activeCfg.icon}
                            {activeCfg.label}
                          </div>
                        </div>
                        <div className="ml-auto">
                          <StatusBadge status={activeSlot.status as SlotStatus} isPast={isPast} />
                        </div>
                      </div>
                    </div>

                    {!isPast && activeSlot.status === 'Scheduled' && (
                      <div className="px-5 py-3 border-t border-border">
                        <p className="text-xs text-text-muted">
                          Confirmar ou recusar consultas ainda não está disponível.
                        </p>
                      </div>
                    )}
                  </Card>
                ) : (
                  <Card className="border border-dashed border-border bg-surface-alt shadow-none rounded-xl p-5">
                    <p className="text-sm text-text-secondary">
                      {isPast ? 'Nenhum agendamento realizado neste horário.' : 'Horário livre para agendamentos.'}
                    </p>
                  </Card>
                )}

              </div>
            )}
          </main>

        </div>
      </div>

      <EditAvailabilityModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        dayData={null}
        editType="single"
      />
    </>
  );
}