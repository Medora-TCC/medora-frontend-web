import { useNavigate } from 'react-router';
import { Avatar, Button, Card } from '@heroui/react';
import { Calendar, Video } from 'lucide-react';
import type { AppointmentStatus, DoctorAppointment } from '../../api/services/Appointments';
import { TipoConsultaTag } from '../../components/Consulta/ConsultaModal';
import { PatientInitials } from '../ConsultaScreen/ConsultaHelpers';
import { STATUS_CFG, canEnterRoom, dayLabel, isTeleconsultation, localTime } from './ScheduleConfig';

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const { label, badge, icon: Icon } = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${badge}`}>
      <Icon size={12} aria-hidden="true" />
      {label}
    </span>
  );
}

interface ScheduleCardProps {
  appointment: DoctorAppointment;
  /** "agora" vem da tela (atualizado a cada minuto) para não haver um timer por card */
  now: number;
  onCardClick: (id: number) => void;
  muted?: boolean;
}

export function ScheduleCard({ appointment, now, onCardClick, muted = false }: ScheduleCardProps) {
  const navigate = useNavigate();
  const isTele = isTeleconsultation(appointment);
  const showEnter = canEnterRoom(appointment);
  const day = dayLabel(appointment, now);

  const stripe = showEnter ? 'bg-success' : isTele ? 'bg-violet-500' : 'bg-teal-500';

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onCardClick(appointment.appointmentId)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCardClick(appointment.appointmentId);
        }
      }}
      className={`
        relative flex min-h-56 h-52 w-full min-w-0 md:min-h-0 md:aspect-square overflow-hidden gap-0 p-0 cursor-pointer
        rounded-lg border border-ring bg-surface-raised shadow-md transition-all duration-200 hover:shadow-lg
        ${showEnter ? 'border-success/30 bg-success/5 hover:bg-success/10' : 'hover:bg-surface-secondary'}
        ${muted ? 'opacity-50 grayscale hover:opacity-100 hover:grayscale-0' : ''}
      `}
    >
      <span aria-hidden className={`absolute inset-x-0 top-0 h-1 ${stripe}`} />

      <Card.Content className="flex flex-1 flex-col gap-0 p-0">
        <div className="flex flex-1 flex-col items-center justify-center gap-2.5 px-4 pb-3 pt-5 text-center">
          <Avatar size="lg" color="accent" className="shrink-0">
            <Avatar.Fallback>{PatientInitials(appointment.patientName)}</Avatar.Fallback>
          </Avatar>

          <span
            className="line-clamp-2 wrap-break-word text-base font-semibold leading-tight"
            title={appointment.patientName}
          >
            {appointment.patientName}
          </span>

          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <TipoConsultaTag type={isTele ? 'teleconsulta' : 'presencial'} />
            <StatusBadge status={appointment.status} />
          </div>
        </div>

        <div
          className={`flex items-center gap-3 border-t border-ring bg-surface-secondary/40 px-4 py-2.5 ${
            showEnter ? 'justify-between' : 'justify-center'
          }`}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <Calendar size={18} className="shrink-0 text-text-secondary" aria-hidden />
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-none tabular-nums">{localTime(appointment)}</span>
              <span className={`mt-0.5 text-[11px] capitalize ${day.className}`}>{day.text}</span>
            </div>
          </div>

          {showEnter && (
            <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
              <Button
                size="sm"
                variant="primary"
                onPress={() =>
                  navigate(`/medico/teleconsulta/${appointment.appointmentId}/pre-sala`, {
                    state: { appointmentId: appointment.appointmentId, patientName: appointment.patientName },
                  })
                }
              >
                <Video size={14} />
                Entrar
              </Button>
            </div>
          )}
        </div>
      </Card.Content>
    </Card>
  );
}