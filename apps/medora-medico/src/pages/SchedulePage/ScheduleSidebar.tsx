import { useNavigate } from 'react-router';
import { Avatar, Button, Card } from '@heroui/react';
import { ChevronRight, CircleAlert, Hourglass, Video } from 'lucide-react';
import type { DoctorAppointment } from '../../api/services/Appointments';
import { TipoConsultaTag } from '../../components/Consulta/ConsultaModal';
import { PatientInitials } from '../ConsultaScreen/ConsultaHelpers';
import { StatusBadge } from './ScheduleCard';
import { dayLabel, isTeleconsultation, localTime } from './ScheduleConfig';
import { getRoomAccess, plural, relativeStart, type ScheduleStats } from './scheduleModel';

interface AwaitingConfirmationPanelProps {
  appointments: DoctorAppointment[];
  totalCount: number;
  error: string | null;
  now: number;
  onOpen: (id: number) => void;
}

export function AwaitingConfirmationPanel({
  appointments,
  totalCount,
  error,
  now,
  onOpen,
}: AwaitingConfirmationPanelProps) {
  if (error) {
    return (
      <Card className="border-warning/30 bg-warning-subtle">
        <Card.Content className="flex items-center gap-2 p-3 text-xs text-warning-text">
          <CircleAlert size={14} strokeWidth={1.25} className="shrink-0" />
          {error}
        </Card.Content>
      </Card>
    );
  }

  if (totalCount === 0) return null;

  const hidden = Math.max(0, totalCount - appointments.length);

  return (
    <Card className="gap-0 overflow-hidden border border-warning/30 p-0">
      <div className="flex items-center justify-between gap-2 bg-warning-subtle px-4 py-2.5">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-warning-text">
          <Hourglass size={13} aria-hidden />
          Aguardando sua confirmação
        </span>
        <span className="rounded-full bg-surface px-2 text-xs font-bold tabular-nums text-warning-text">
          {totalCount}
        </span>
      </div>

      <ul className="max-h-72 divide-y divide-ring overflow-y-auto">
        {appointments.map((appointment) => {
          const day = dayLabel(appointment, now);
          return (
            <li key={appointment.appointmentId}>
              <button
                type="button"
                onClick={() => onOpen(appointment.appointmentId)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-secondary"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold" title={appointment.patientName}>
                    {appointment.patientName}
                  </p>
                  <p className="text-xs tabular-nums text-fg-muted">
                    <span className={`capitalize ${day.className}`}>{day.text}</span> · {localTime(appointment)}
                  </p>
                </div>
                <ChevronRight size={16} className="shrink-0 text-fg-muted" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>

      {hidden > 0 && (
        <p className="border-t border-ring px-4 py-2 text-xs text-fg-muted">
          e mais {hidden} — veja a lista completa na tela de Consultas.
        </p>
      )}
    </Card>
  );
}

interface NextAppointmentProps {
  appointment: DoctorAppointment;
  now: number;
  onOpen: (id: number) => void;
}

export function NextAppointment({ appointment, now, onOpen }: NextAppointmentProps) {
  const navigate = useNavigate();
  const isTele = isTeleconsultation(appointment);
  const room = getRoomAccess(appointment, now);
  const showEnter = room.eligible;

  return (
    <Card className={`flex flex-col gap-3 p-4 ${room.open ? 'border border-success/30 bg-success/5' : ''}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-fg-muted">Próxima consulta</span>
        <span className="text-xs font-medium text-accent">{relativeStart(appointment.startDateTime, now)}</span>
      </div>

      <div className="flex items-center gap-3">
        <Avatar size="md" color="accent" className="shrink-0">
          <Avatar.Fallback>{PatientInitials(appointment.patientName)}</Avatar.Fallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold" title={appointment.patientName}>
            {appointment.patientName}
          </p>
          <p className="text-xs tabular-nums text-fg-muted">
            {localTime(appointment)} · {isTele ? 'Telemedicina' : 'Presencial'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <TipoConsultaTag type={isTele ? 'teleconsulta' : 'presencial'} />
        <StatusBadge status={appointment.status} />
      </div>

      <div className="flex gap-2">
        {showEnter && (
          <Button
            size="sm"
            variant="primary"
            className="flex-1"
            isDisabled={!room.open}
            onPress={() =>
              navigate(`/medico/teleconsulta/${appointment.appointmentId}/pre-sala`, {
                state: { appointmentId: appointment.appointmentId, patientName: appointment.patientName },
              })
            }
          >
            <Video size={14} />
            Entrar na sala
          </Button>
        )}
        <Button
          size="sm"
          variant="secondary"
          className={showEnter ? '' : 'flex-1'}
          onPress={() => onOpen(appointment.appointmentId)}
        >
          Detalhes
        </Button>
      </div>

      {room.hint && <p className="text-xs text-fg-muted">{room.hint}</p>}
    </Card>
  );
}

interface SummaryRowProps {
  label: string;
  value: number;
  hint?: string;
  highlight?: boolean;
}

function SummaryRow({ label, value, hint, highlight = false }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm text-text-secondary">{label}</p>
        {hint && <p className="text-[11px] text-fg-muted">{hint}</p>}
      </div>
      <span className={`text-lg font-bold tabular-nums ${highlight ? 'text-warning-text' : ''}`}>{value}</span>
    </div>
  );
}

export function ScheduleSummary({ stats }: { stats: ScheduleStats }) {
  const pending = stats.toConfirm + stats.toComplete;

  return (
    <Card className="p-4">
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-fg-muted">Resumo do período</h2>
      <div className="flex flex-col divide-y divide-ring">
        <SummaryRow label={plural(stats.appointments, 'Consulta', 'Consultas')} value={stats.appointments} />
        <SummaryRow
          label="Pendências"
          value={pending}
          hint={pending > 0 ? `${stats.toConfirm} p/ confirmar · ${stats.toComplete} p/ concluir` : undefined}
          highlight={pending > 0}
        />
        <SummaryRow label="Telemedicina" value={stats.teleconsultations} />
        <SummaryRow label={plural(stats.freeSlots, 'Horário livre', 'Horários livres')} value={stats.freeSlots} />
      </div>
    </Card>
  );
}