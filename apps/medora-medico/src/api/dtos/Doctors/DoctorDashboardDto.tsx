export type AppointmentStatus = "Scheduled" | "Confirmed" | "Completed" | "Canceled" | "Absent";
export type AppointmentType = "InPerson" | "Online";

export interface DashboardRateDto {
  total: number;
  average: number | null;
}

export interface UpcomingAppointmentDto {
  id: number;
  type: AppointmentType;
  startDateTime: string;
  meetingCode: string | null;
  patientName: string;
  status: AppointmentStatus;
}

export interface ActiveTeleconsultationDto {
  appointmentId: number;
  meetingCode: string;
  patientName: string;
  startDateTime: string;
  endDateTime: string;
}

export interface PendingMedicalRecordItemDto {
  appointmentId: number;
  medicalRecordId: number | null;
  patientName: string;
  appointmentDate: string;
}

export interface PendingMedicalRecordsDto {
  total: number;
  items: PendingMedicalRecordItemDto[];
}

export interface DoctorDashboardDto {
  doctorName: string;
  todayCount: number;
  pendingConfirmationCount: number;
  monthRevenue: number;
  rate: DashboardRateDto;
  upcomingAppointments: UpcomingAppointmentDto[];
  activeTeleconsultation: ActiveTeleconsultationDto | null;
  pendingMedicalRecords: PendingMedicalRecordsDto | null;
}