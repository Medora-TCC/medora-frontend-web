import type { DoctorAppointment } from '../../api/services/Appointments';

// mesmos caminhos do App.tsx (prontuario/:appointmentId e prescricao/:appointmentId)
export const medicalRecordRoute = (a: DoctorAppointment): string => `/medico/prontuario/${a.appointmentId}`;
export const prescriptionRoute = (a: DoctorAppointment): string => `/medico/prescricao/${a.appointmentId}`;

/** State de navegação enviado para as telas de prontuário e receita */
export interface RecordsNavState {
  appointmentId: number;
  patientId: string;
  patientName: string;
}

export const recordsNavState = (a: DoctorAppointment): RecordsNavState => ({
  appointmentId: a.appointmentId,
  patientId: a.patientId,
  patientName: a.patientName,
});