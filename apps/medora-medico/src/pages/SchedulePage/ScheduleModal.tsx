import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, Modal, toast } from '@heroui/react';
import { Calendar, Video } from 'lucide-react';
import { ModalConfirmacao } from '@medora_web/shared';
import AppointmentsService, {
  canDoctorCancel,
  type AppointmentStatusChange as AppointmentStatusChange,
  type DoctorAppointment,
} from '../../api/services/Appointments';
import { errorMessage } from '../../api/errors';
import { TipoConsultaTag } from '../../components/Consulta/ConsultaModal';
import { StatusBadge } from './ScheduleCard';
import { CANCELABLE, OPEN, canEnterRoom, isTeleconsultation } from './ScheduleConfig';

interface AppointmentActionsProps {
  appointment: DoctorAppointment;
  onChanged: () => void;
}

function AppointmentActions({ appointment, onChanged }: AppointmentActionsProps) {
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
      // sucesso ou erro: a consulta pode ter mudado no servidor
      // (ex.: o prazo de confirmação venceu e ela foi cancelada), então sempre recarrega
      onChanged();
    }
  };

  const changeStatus = (change: AppointmentStatusChange, success: string) =>
    run(() => AppointmentsService.changeAppointmentStatus(appointmentId, change), success);

  const awaitingConfirmation = isTeleconsultation(appointment) && status === 'AwaitingConfirmation';
  const cancelable =
    !awaitingConfirmation && CANCELABLE.includes(status) && canDoctorCancel(appointment.startDateTime);

  if (!awaitingConfirmation && !OPEN.includes(status) && !cancelable) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {awaitingConfirmation && (
        <>
          <Button
            size="sm"
            variant="primary"
            isDisabled={isSaving}
            onPress={() => run(() => AppointmentsService.confirmTeleconsultation(appointmentId), 'Teleconsulta confirmada.')}
          >
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
        <Button
          size="sm"
          variant="primary"
          isDisabled={isSaving}
          onPress={() => changeStatus('Confirmed', 'Consulta confirmada.')}
        >
          Confirmar
        </Button>
      )}

      {OPEN.includes(status) && (
        <>
          <Button
            size="sm"
            variant="secondary"
            isDisabled={isSaving}
            onPress={() => changeStatus('Completed', 'Consulta concluída.')}
          >
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

interface ScheduleModalProps {
  appointment: DoctorAppointment | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onChanged: () => void;
}

export function ScheduleModal({ appointment, isOpen, onOpenChange, onChanged }: ScheduleModalProps) {
  const navigate = useNavigate();

  if (!appointment) return null;

  const isTele = isTeleconsultation(appointment);

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container>
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>{appointment.patientName}</Modal.Heading>
          </Modal.Header>

          <Modal.Body className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <TipoConsultaTag type={isTele ? 'teleconsulta' : 'presencial'} />
              <StatusBadge status={appointment.status} />
            </div>

            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Calendar size={16} aria-hidden />
              <span className="font-semibold tabular-nums">{appointment.localStartDateTime}</span>
            </div>

            {canEnterRoom(appointment) && (
              <div>
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
                  Entrar na sala
                </Button>
              </div>
            )}
          </Modal.Body>

          <Modal.Footer>
            <AppointmentActions appointment={appointment} onChanged={onChanged} />
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}