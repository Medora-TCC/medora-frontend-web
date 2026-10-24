import type { AppointmentStatus, AppointmentType } from "../dtos/Doctors/DoctorDashboardDto";

export const appointmentStatusLabel: Record<AppointmentStatus, string> = {
  Scheduled: "Aguardando",
  Confirmed: "Confirmado",
  Completed: "Concluído",
  Canceled: "Cancelado",
  Absent: "Faltou",
};

export const appointmentTypeLabel: Record<AppointmentType, string> = {
  InPerson: "Presencial",
  Online: "Telemedicina",
};