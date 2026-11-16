import type { AvailabilitySlotType } from '@medora_web/shared';
import { Endpoints } from '../enums/endpoints';
import { api } from './api';
import { toDomainError } from '../errors';

/** Espelha DoctorAppointmentsFilter do backend (default do endpoint: Recent) */
export type DoctorAppointmentsFilter = 'All' | 'Recent' | 'Today' | 'Tomorrow' | 'Week';

// O backend só aceita cancelamento do médico com 72h de antecedência (ChangeAppointmentStatusUseCase)
const DOCTOR_CANCEL_NOTICE_MS = 72 * 60 * 60 * 1000;

export function canDoctorCancel(startDateTime: string): boolean {
  return new Date(startDateTime).getTime() >= Date.now() + DOCTOR_CANCEL_NOTICE_MS;
}

/** Mudanças de status que o PATCH /appointments/{id}/status aceita */
export type AppointmentStatusChange = 'Confirmed' | 'Completed' | 'Absent' | 'Canceled';

/**
 * Status de uma consulta. O enum do backend também tem `Available`, que representa
 * um horário livre (não é uma consulta) e por isso não é exposto nesta listagem.
 */
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

/** Query string aceita por GET /appointments/doctor/me */
export interface DoctorAppointmentsQuery {
  filter: DoctorAppointmentsFilter;
  status?: AppointmentStatus;
  page: number;
  pageSize: number;
}

export interface DoctorAppointmentsPage {
  items: DoctorAppointment[];
  page: number;
  pageSize: number;
  totalCount: number;
}

async function getDoctorAppointments(
  query: DoctorAppointmentsQuery,
  signal?: AbortSignal,
): Promise<DoctorAppointmentsPage> {
  try {
    const { filter, status, page, pageSize } = query;
    // `status` undefined é omitido da query string pelo Axios
    const res = await api.get<DoctorAppointmentsPage>(Endpoints.DOCTOR_APPOINTMENTS, {
      params: { filter, status, page, pageSize },
      signal,
    });
    return res.data;
  } catch (error) {
    throw toDomainError(error, 'Erro ao carregar as consultas.');
  }
}

async function changeAppointmentStatus(appointmentId: number, status: AppointmentStatusChange): Promise<void> {
  try {
    await api.patch(Endpoints.APPOINTMENT_STATUS(appointmentId), { status });
  } catch (error) {
    throw toDomainError(error, 'Erro ao alterar o status da consulta.');
  }
}

/** Confirma uma teleconsulta paga e captura o valor reservado */
async function confirmTeleconsultation(appointmentId: number): Promise<void> {
  try {
    await api.post(Endpoints.CONFIRM_TELECONSULTATION(appointmentId));
  } catch (error) {
    throw toDomainError(error, 'Erro ao confirmar a teleconsulta.');
  }
}

/** Recusa uma teleconsulta paga e libera a reserva sem cobrar */
async function rejectTeleconsultation(appointmentId: number): Promise<void> {
  try {
    await api.post(Endpoints.REJECT_TELECONSULTATION(appointmentId));
  } catch (error) {
    throw toDomainError(error, 'Erro ao recusar a teleconsulta.');
  }
}

const AppointmentsService = {
  getDoctorAppointments,
  changeAppointmentStatus,
  confirmTeleconsultation,
  rejectTeleconsultation,
};

export default AppointmentsService;