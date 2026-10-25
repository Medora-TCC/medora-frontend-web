import type { AvailabilitySlotType } from '@medora_web/shared';
import { Endpoints } from '../enums/endpoints';
import { api } from './api';
import { toDomainError } from '../errors';

export type DoctorAppointmentsFilter = 'Today' | 'Tomorrow' | 'Week' | 'PendingConfirmation' | 'ToComplete';

export type AppointmentStatus =
  | 'Scheduled'
  | 'AwaitingPayment'
  | 'AwaitingConfirmation'
  | 'Confirmed'
  | 'InProgress'
  | 'Completed'
  | 'RescheduleNeeded'
  | 'Canceled'
  | 'Absent';

export interface DoctorAppointment {
  appointmentId: number;
  patientId: string;
  patientName: string;
  startDateTime: string;
  endDateTime: string;
  /** "dd/MM/yyyy HH:mm" no fuso do médico */
  localStartDateTime: string;
  status: AppointmentStatus;
  type: AvailabilitySlotType;
  timeZoneId: string;
  meetingUrl: string | null;
  platform: string | null;
  meetingCode: string | null;
}

interface DoctorAppointmentsPage {
  items: DoctorAppointment[];
  page: number;
  pageSize: number;
  totalCount: number;
}

async function getDoctorAppointments(filter: DoctorAppointmentsFilter): Promise<DoctorAppointment[]> {
  try {
    const res = await api.get<DoctorAppointmentsPage>(Endpoints.DOCTOR_APPOINTMENTS, {
      params: { filter, pageSize: 100 },
    });
    return res.data.items;
  } catch (error) {
    throw toDomainError(error, 'Erro ao carregar as consultas.');
  }
}

/** Confirma a teleconsulta paga: o valor reservado no cartão do paciente é cobrado. */
async function confirmAppointment(appointmentId: number): Promise<void> {
  try {
    await api.post(`/appointments/${appointmentId}/confirm`);
  } catch (error) {
    throw toDomainError(error, 'Erro ao confirmar a consulta.');
  }
}

/** Recusa a teleconsulta paga: a reserva no cartão do paciente é liberada, sem cobrança. */
async function rejectAppointment(appointmentId: number): Promise<void> {
  try {
    await api.post(`/appointments/${appointmentId}/reject`);
  } catch (error) {
    throw toDomainError(error, 'Erro ao recusar a consulta.');
  }
}

/** Conclui a consulta ou registra que o paciente faltou (nesse caso o paciente é reembolsado). */
async function changeAppointmentStatus(appointmentId: number, status: 'Completed' | 'Absent'): Promise<void> {
  try {
    await api.patch(`/appointments/${appointmentId}/status`, { status });
  } catch (error) {
    throw toDomainError(error, 'Erro ao atualizar a consulta.');
  }
}

const AppointmentsService = {
  getDoctorAppointments,
  confirmAppointment,
  rejectAppointment,
  changeAppointmentStatus,
};

export default AppointmentsService;
