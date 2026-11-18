import type { DoctorAppointment } from '../../api/services/Appointments';

// ATENÇÃO: confirme os caminhos reais das rotas de prontuário e receita do seu router.
// São os únicos lugares que precisam mudar.
export const medicalRecordRoute = (a: DoctorAppointment): string => `/medico/prontuario/${a.appointmentId}`;
export const prescriptionRoute = (a: DoctorAppointment): string => `/medico/receita/${a.appointmentId}`;

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