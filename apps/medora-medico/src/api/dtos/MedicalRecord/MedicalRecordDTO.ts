export type MedicalRecordStatus = "Ativo" | "Finalizado" | "Cancelado";

export interface MedicalRecordDTO {
  id: string;
  tipoConsulta: string;
  pacientId: string;
  doctorId: string;
  medicalRecord: string;
  date: string;
  status: MedicalRecordStatus;
}
