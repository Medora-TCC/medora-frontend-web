import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { Avatar, Button, Modal, toast } from '@heroui/react';
import { Calendar, FileText, Pill, Video } from 'lucide-react';
import { ModalConfirmacao } from '@medora_web/shared';
import AppointmentsService, {
  canDoctorCancel,
  type AppointmentStatusChange,
  type DoctorAppointment,
} from '../../api/services/Appointments';
import { errorMessage } from '../../api/errors';
import { TipoConsultaTag } from '../../components/Consulta/ConsultaModal';
import { PatientInitials } from '../ConsultaScreen/ConsultaHelpers';
import { StatusBadge } from './ScheduleCard';
import { CANCELABLE, OPEN, isTeleconsultation } from './ScheduleConfig';
import { getRecordsAccess, getRoomAccess } from './scheduleModel';
import { medicalRecordRoute, prescriptionRoute, recordsNavState } from './scheduleRoutes';
interface ScheduleActionsProps {
  appointment: DoctorAppointment;
  now: number;
  onChanged: () => void;
}

function ScheduleActions({ appointment, now, onChanged }: ScheduleActionsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { appointmentId, status } = appointment;

  const run = async (action: () => Promise<void>, success: string) => {
    setIsSaving(true);
    try {
      await action();
      toast.success(success);
    } catch (err) {
      toast.danger(errorMessage(err, 'Erro ao atualizar a consulta.'));
    } finally {
      setIsSaving(false);
      onChanged();
    }
  };

  const changeStatus = (change: AppointmentStatusChange, success: string) =>
    run(() => AppointmentsService.changeAppointmentStatus(appointmentId, change), success);

  const awaitingConfirmation = isTeleconsultation(appointment) && status === 'AwaitingConfirmation';
  const isOpen = OPEN.includes(status);
  const hasStarted = new Date(appointment.startDateTime).getTime() <= now;
  const canFinish = isOpen && hasStarted;
  const waitingStart = isOpen && !hasStarted;
  const cancelable =
    !awaitingConfirmation && CANCELABLE.includes(status) && canDoctorCancel(appointment.startDateTime);

  const showConfirm = status === 'Scheduled';
  const hasPrimary = awaitingConfirmation || showConfirm || canFinish;
  const hasDestructive = awaitingConfirmation || canFinish || cancelable;

  if (!hasPrimary && !hasDestructive && !waitingStart) return null;

  return (
    <div className="flex w-full flex-col gap-3">
      {hasPrimary && (
        <div className="flex flex-wrap items-center gap-2">
          {awaitingConfirmation && (
            <Button
              size="sm"
              variant="primary"
              isDisabled={isSaving}
              onPress={() =>
                run(() => AppointmentsService.confirmTeleconsultation(appointmentId), 'Teleconsulta confirmada.')
              }
            >
              Confirmar teleconsulta
            </Button>
          )}

          {showConfirm && (
            <Button
              size="sm"
              variant="primary"
              isDisabled={isSaving}
              onPress={() => changeStatus('Confirmed', 'Consulta confirmada.')}
            >
              Confirmar
            </Button>
          )}

          {canFinish && (
            <Button
              size="sm"
              variant="secondary"
              isDisabled={isSaving}
              onPress={() => changeStatus('Completed', 'Consulta concluída.')}
            >
              Concluir
            </Button>
          )}
        </div>
      )}

      {waitingStart && (
        <p className="text-xs text-fg-muted">
          Concluir e registrar falta ficam disponíveis a partir do horário da consulta.
        </p>
      )}

      {hasDestructive && (
        <div
          className={`flex flex-wrap items-center gap-2 ${
            hasPrimary || waitingStart ? 'border-t border-ring pt-3' : ''
          }`}
        >
          {awaitingConfirmation && (
            <ModalConfirmacao
              size="sm"
              onConfirm={() =>
                run(() => AppointmentsService.rejectTeleconsultation(appointmentId), 'Teleconsulta recusada.')
              }
              disabled={isSaving}
              texto="Recusar esta teleconsulta? A reserva do pagamento será liberada sem cobrança."
              textoBotao="Recusar"
              variant="danger"
            />
          )}

          {canFinish && (
            <ModalConfirmacao
              size="sm"
              onConfirm={() => changeStatus('Absent', 'Ausência registrada.')}
              disabled={isSaving}
              texto="Registrar que o paciente faltou?"
              textoBotao="Paciente faltou"
              variant="danger"
            />
          )}

          {cancelable && (
            <ModalConfirmacao
              size="sm"
              onConfirm={() => changeStatus('Canceled', 'Consulta cancelada.')}
              disabled={isSaving}
              texto="Cancelar esta consulta? O pagamento do paciente será estornado."
              textoBotao="Cancelar consulta"
              variant="danger"
            />
          )}
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-fg-muted">{label}</span>
      <div className="min-w-0 text-sm font-medium text-text-primary">{children}</div>
    </div>
  );
}

interface ScheduleModalProps {
  appointment: DoctorAppointment | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onChanged: () => void;
  now: number;
}

export function ScheduleModal({ appointment, isOpen, onOpenChange, onChanged, now }: ScheduleModalProps) {
  const navigate = useNavigate();

  if (!appointment) return null;

  const isTele = isTeleconsultation(appointment);
  const room = getRoomAccess(appointment, now);
  const showEnter = room.eligible;
  const records = getRecordsAccess(appointment, now);
  const durationMinutes = Math.round(
    (new Date(appointment.endDateTime).getTime() - new Date(appointment.startDateTime).getTime()) / 60_000,
  );

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container size="lg">
        <Modal.Dialog className="bg-surface">
          <Modal.CloseTrigger />

          <Modal.Header className="flex items-center gap-3">
            <Avatar size="lg" color="accent" className="shrink-0">
              <Avatar.Fallback>{PatientInitials(appointment.patientName)}</Avatar.Fallback>
            </Avatar>
            <div className="flex min-w-0 flex-col gap-1.5">
              <Modal.Heading className="truncate text-xl font-semibold text-text-primary">
                {appointment.patientName}
              </Modal.Heading>
              <div className="flex flex-wrap items-center gap-1.5">
                <TipoConsultaTag type={isTele ? 'teleconsulta' : 'presencial'} />
                <StatusBadge status={appointment.status} />
              </div>
            </div>
          </Modal.Header>

          <Modal.Body className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <InfoItem label="Data e hora">
                <span className="inline-flex items-center gap-1.5 tabular-nums">
                  <Calendar size={14} aria-hidden />
                  {appointment.localStartDateTime}
                </span>
              </InfoItem>
              <InfoItem label="Duração">{durationMinutes} min</InfoItem>
              <InfoItem label="Fuso horário">{appointment.timeZoneId}</InfoItem>
              {isTele && appointment.platform && <InfoItem label="Plataforma">{appointment.platform}</InfoItem>}
              {isTele && appointment.meetingCode && (
                <InfoItem label="Código da sala">
                  <span className="font-mono">{appointment.meetingCode}</span>
                </InfoItem>
              )}
            </div>

            {(showEnter || records.eligible) && (
              <div className="flex flex-col gap-2.5 rounded-lg border border-ring bg-surface-secondary/40 p-3">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-fg-muted">Atendimento</span>

                <div className="flex flex-wrap items-center gap-2">
                  {showEnter && (
                    <Button
                      size="sm"
                      variant="primary"
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

                  {records.eligible && (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        isDisabled={!records.open}
                        onPress={() =>
                          navigate(medicalRecordRoute(appointment), { state: recordsNavState(appointment) })
                        }
                      >
                        <FileText size={14} />
                        Abrir prontuário
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        isDisabled={!records.open}
                        onPress={() =>
                          navigate(prescriptionRoute(appointment), { state: recordsNavState(appointment) })
                        }
                      >
                        <Pill size={14} />
                        Receita
                      </Button>
                    </>
                  )}
                </div>

                {room.hint && <p className="text-xs text-fg-muted">{room.hint}</p>}
                {records.hint && <p className="text-xs text-fg-muted">{records.hint}</p>}
              </div>
            )}
          </Modal.Body>

          <Modal.Footer>
            <ScheduleActions appointment={appointment} now={now} onChanged={onChanged} />
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}