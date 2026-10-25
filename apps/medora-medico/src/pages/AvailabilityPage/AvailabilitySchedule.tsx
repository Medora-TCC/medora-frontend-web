import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Settings, Video, User, Clock, Loader2, Building2, Monitor, RefreshCw, CalendarDays,
} from 'lucide-react';
import { Card, Button, toast, ToastProvider } from '@heroui/react';
import { ModalConfirmacao, type AvailabilitySlotType } from '@medora_web/shared';
import AppointmentsService, {
  canDoctorCancel,
  type AppointmentStatus,
  type AppointmentStatusChange,
  type DoctorAppointment,
  type DoctorAppointmentsFilter,
} from '../../api/services/Appointments';
import { errorMessage } from '../../api/errors';


const TYPE_CFG: Record<AvailabilitySlotType, {
  label: string;
  icon: React.ReactNode;
  pill: string;
  iconBg: string;
  stripe: string;
}> = {
  InPerson: {
    label: 'Presencial',
    icon: <Building2 size={15} />,
    pill:    'bg-primary/10 text-primary-text border border-primary/20',
    iconBg:  'bg-primary/10 text-primary-text',
    stripe:  'bg-primary',
  },
  Online: {
    label: 'Telemedicina',
    icon: <Monitor size={15} />,
    pill:    'bg-violet-100 text-violet-700 border border-violet-200',
    iconBg:  'bg-violet-100 text-violet-600',
    stripe:  'bg-violet-500',
  },
  Any: {
    label: 'Ambos',
    icon: <RefreshCw size={15} />,
    pill:    'bg-teal-50 text-teal-700 border border-teal-200',
    iconBg:  'bg-teal-50 text-teal-600',
    stripe:  'bg-gradient-to-b from-primary via-violet-500 to-teal-500',
  },
};

const STATUS_CFG: Record<AppointmentStatus, { label: string; badge: string }> = {
  Scheduled:            { label: 'Agendada',               badge: 'bg-primary/10 text-primary-text' },
  AwaitingPayment:      { label: 'Aguardando pagamento',   badge: 'bg-warning-subtle text-warning-text' },
  AwaitingConfirmation: { label: 'Aguardando confirmação', badge: 'bg-warning-subtle text-warning-text' },
  Confirmed:            { label: 'Confirmada',             badge: 'bg-success-subtle text-success-text' },
  InProgress:           { label: 'Em andamento',           badge: 'bg-primary/10 text-primary-text' },
  Completed:            { label: 'Realizada',              badge: 'bg-success-subtle text-success-text' },
  RescheduleNeeded:     { label: 'Precisa remarcar',       badge: 'bg-danger-subtle text-danger-text' },
  Canceled:             { label: 'Cancelada',              badge: 'bg-danger-subtle text-danger-text' },
  Absent:               { label: 'Ausente',                badge: 'bg-danger-subtle text-danger-text' },
};

const FILTERS: { value: DoctorAppointmentsFilter; label: string }[] = [
  { value: 'Today',    label: 'Hoje' },
  { value: 'Tomorrow', label: 'Amanhã' },
  { value: 'Week',     label: 'Semana' },
];

// localStartDateTime vem como "dd/MM/yyyy HH:mm" no fuso do médico
const localDate = (a: DoctorAppointment) => a.localStartDateTime.slice(0, 10);
const localTime = (a: DoctorAppointment) => a.localStartDateTime.slice(11, 16);

const dayHeading = (ddmmyyyy: string) => {
  const [day, month, year] = ddmmyyyy.split('/');
  return new Date(`${year}-${month}-${day}T12:00:00`)
    .toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' });
};

// Mesmas regras de transição do domínio (Appointment.cs)
const OPEN: AppointmentStatus[] = ['Scheduled', 'Confirmed'];
// Só dá para entrar na sala de uma teleconsulta já confirmada (paga e aceita pelo médico)
const ROOM_OPEN: AppointmentStatus[] = ['Confirmed', 'InProgress'];
const CANCELABLE: AppointmentStatus[] = ['Scheduled', 'Confirmed', 'AwaitingPayment', 'AwaitingConfirmation'];

function AppointmentActions({ appointment, onChanged }: { appointment: DoctorAppointment; onChanged: () => void }) {
  const [isSaving, setIsSaving] = useState(false);
  const { appointmentId, status } = appointment;

  const run = async (action: () => Promise<void>, success: string) => {
    setIsSaving(true);
    try {
      await action();
      toast.success(success);
      onChanged();
    } catch (err) {
      toast.danger(errorMessage(err, 'Erro ao atualizar a consulta.'));
    } finally {
      setIsSaving(false);
    }
  };

  const changeStatus = (change: AppointmentStatusChange, success: string) =>
    run(() => AppointmentsService.changeAppointmentStatus(appointmentId, change), success);

  const awaitingConfirmation = appointment.type === 'Online' && status === 'AwaitingConfirmation';
  const cancelable = CANCELABLE.includes(status) && canDoctorCancel(appointment.startDateTime);

  if (!awaitingConfirmation && !OPEN.includes(status) && !cancelable) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {awaitingConfirmation && (
        <>
          <Button size="sm" variant="primary" isDisabled={isSaving}
            onPress={() => run(() => AppointmentsService.confirmTeleconsultation(appointmentId), 'Teleconsulta confirmada.')}>
            Confirmar teleconsulta
          </Button>
          <ModalConfirmacao
            onConfirm={() => run(() => AppointmentsService.rejectTeleconsultation(appointmentId), 'Teleconsulta recusada.')}
            disabled={isSaving}
            texto="Recusar esta teleconsulta? A reserva do pagamento será liberada sem cobrança."
            textoBotao="Recusar"
            variant="danger"
          />
        </>
      )}
      {status === 'Scheduled' && (
        <Button size="sm" variant="primary" isDisabled={isSaving}
          onPress={() => changeStatus('Confirmed', 'Consulta confirmada.')}>
          Confirmar
        </Button>
      )}
      {OPEN.includes(status) && (
        <>
          <Button size="sm" variant="secondary" isDisabled={isSaving}
            onPress={() => changeStatus('Completed', 'Consulta concluída.')}>
            Concluir
          </Button>
          <ModalConfirmacao
            onConfirm={() => changeStatus('Absent', 'Ausência registrada.')}
            disabled={isSaving}
            texto="Registrar que o paciente faltou?"
            textoBotao="Paciente faltou"
            variant="danger"
          />
        </>
      )}
      {cancelable && (
        <ModalConfirmacao
          onConfirm={() => changeStatus('Canceled', 'Consulta cancelada.')}
          disabled={isSaving}
          texto="Cancelar esta consulta? O pagamento do paciente será estornado."
          textoBotao="Cancelar consulta"
          variant="danger"
        />
      )}
    </div>
  );
}

function groupByDay(appointments: DoctorAppointment[]) {
  const groups = new Map<string, DoctorAppointment[]>();
  for (const appointment of appointments) {
    const day = localDate(appointment);
    groups.set(day, [...(groups.get(day) ?? []), appointment]);
  }
  return [...groups.entries()];
}


export function AvailabilityHistorical() {
  const navigate = useNavigate();
  const [filter, setFilter]             = useState<DoctorAppointmentsFilter>('Today');
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [isLoading, setIsLoading]       = useState(false);
  const [activeId, setActiveId]         = useState<number | null>(null);
  const [reloadKey, setReloadKey]       = useState(0);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const res = await AppointmentsService.getDoctorAppointments(filter);
        if (active) {
          setAppointments(res);
          // depois de uma ação, mantém a consulta selecionada
          setActiveId((current) =>
            res.some((a) => a.appointmentId === current) ? current : res[0]?.appointmentId ?? null);
        }
      } catch (err) {
        if (active) toast.danger(errorMessage(err, 'Erro ao carregar as consultas.'));
      } finally {
        if (active) setIsLoading(false);
      }
    };

    load();
    return () => { active = false; };
  }, [filter, reloadKey]);

  const activeAppointment = appointments.find((a) => a.appointmentId === activeId) ?? null;
  const activeCfg = TYPE_CFG[activeAppointment?.type ?? 'InPerson'];

  return (
    <>
      <ToastProvider />

      <div className="flex flex-col h-screen overflow-hidden bg-surface">

        <header className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-border bg-surface gap-4">
          <div>
            <h1 className="text-lg font-bold text-primary-text leading-tight">Minha Agenda</h1>
            <p className="text-xs text-text-secondary mt-0.5">Suas consultas marcadas</p>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-border p-1">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => { setAppointments([]); setActiveId(null); setFilter(f.value); }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                  ${filter === f.value ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:bg-surface-alt'}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-1.5 text-text-secondary border-border rounded-md font-medium"
            onPress={() => navigate('/medico/disponibilidade')}
          >
            <Settings size={15} />
            Configurar Horários
          </Button>
        </header>

        <div className="flex flex-1 overflow-hidden">

          <aside className="w-64 shrink-0 border-r border-border flex flex-col overflow-hidden bg-surface-alt">
            <div className="px-4 py-2.5 border-b border-border flex items-center gap-1.5">
              <Clock size={13} className="text-text-muted" />
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                {appointments.length} consulta(s)
              </span>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <Loader2 size={24} className="animate-spin text-primary opacity-60" />
                  <span className="text-xs text-text-muted">Carregando...</span>
                </div>
              ) : appointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 px-4 text-center">
                  <CalendarDays size={28} className="text-text-muted opacity-30" />
                  <p className="text-sm font-medium text-text-secondary">Nenhuma consulta</p>
                  <p className="text-xs text-text-muted">Não há consultas marcadas neste período.</p>
                </div>
              ) : (
                groupByDay(appointments).map(([day, dayAppointments]) => (
                  <div key={day}>
                    {filter === 'Week' && (
                      <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                        {dayHeading(day)}
                      </p>
                    )}
                    <ul className="py-1">
                      {dayAppointments.map((appointment) => {
                        const isActive = appointment.appointmentId === activeId;
                        return (
                          <li key={appointment.appointmentId}>
                            <button
                              onClick={() => setActiveId(appointment.appointmentId)}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-l-2
                                ${isActive ? 'bg-surface border-l-primary' : 'border-l-transparent hover:bg-surface'}`}
                            >
                              <span className={`text-sm font-bold tabular-nums shrink-0 ${isActive ? 'text-primary-text' : 'text-text-primary'}`}>
                                {localTime(appointment)}
                              </span>
                              <span className={`w-2 h-2 rounded-full shrink-0 ${TYPE_CFG[appointment.type].stripe}`} />
                              <span className="text-xs truncate text-text-primary font-medium">
                                {appointment.patientName}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))
              )}
            </div>

            <div className="px-4 py-3 border-t border-border space-y-1.5">
              {(Object.entries(TYPE_CFG) as [AvailabilitySlotType, typeof TYPE_CFG[AvailabilitySlotType]][]).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${v.stripe}`} />
                  <span className="text-[11px] text-text-muted">{v.label}</span>
                </div>
              ))}
            </div>
          </aside>

          <main className="flex-1 overflow-y-auto p-6">
            {!activeAppointment ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-3">
                <CalendarDays size={40} className="text-text-muted opacity-30" />
                <p className="text-base font-medium text-text-secondary">
                  {isLoading ? 'Carregando agenda...' : 'Selecione uma consulta à esquerda'}
                </p>
              </div>
            ) : (
              <div className="max-w-lg mx-auto space-y-5">

                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${activeCfg.pill}`}>
                    <Clock size={14} />
                    {activeAppointment.localStartDateTime}
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${activeCfg.pill}`}>
                    {activeCfg.icon}
                    {activeCfg.label}
                  </div>
                </div>

                <Card className="border border-border bg-surface shadow-none rounded-xl overflow-hidden">
                  <div className={`h-1 w-full ${activeCfg.stripe}`} />

                  <div className="p-5 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${activeCfg.iconBg}`}>
                        {activeAppointment.type === 'Online' ? <Video size={22} /> : <User size={22} />}
                      </div>
                      <p className="font-semibold text-text-primary">{activeAppointment.patientName}</p>
                      <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded ${STATUS_CFG[activeAppointment.status].badge}`}>
                        {STATUS_CFG[activeAppointment.status].label}
                      </span>
                    </div>

                    {activeAppointment.type === 'Online' && ROOM_OPEN.includes(activeAppointment.status) && (
                      <button
                        onClick={() => navigate(`/medico/teleconsulta/${activeAppointment.appointmentId}/pre-sala`, {
                          state: { appointmentId: activeAppointment.appointmentId, patientName: activeAppointment.patientName },
                        })}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover"
                      >
                        <Video size={14} />
                        Entrar na sala
                      </button>
                    )}

                    <AppointmentActions
                      appointment={activeAppointment}
                      onChanged={() => setReloadKey((k) => k + 1)}
                    />
                  </div>
                </Card>

              </div>
            )}
          </main>

        </div>
      </div>
    </>
  );
}
