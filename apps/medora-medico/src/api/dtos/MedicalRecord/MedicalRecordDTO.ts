export type MedicalRecordStatus = "Não finalizado" | "Finalizado" | "Inativado";

export interface MedicalRecordDTO {
  id: string;
  tipoConsulta: string;
  pacientId: string;
  doctorId: string;
  medicalRecord: string;
  date: string;
  status: MedicalRecordStatus;
}
