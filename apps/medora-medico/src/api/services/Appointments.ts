import type { AvailabilitySlotType } from '@medora_web/shared';
import { Endpoints } from '../enums/endpoints';
import { api } from './api';
import { toDomainError } from '../errors';

export type DoctorAppointmentsFilter = 'Today' | 'Tomorrow' | 'Week';

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

const AppointmentsService = {
  getDoctorAppointments,
};

export default AppointmentsService;
