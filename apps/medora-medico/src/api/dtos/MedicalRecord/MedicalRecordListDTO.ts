import type { MedicalRecordDTO } from "./MedicalRecordDTO";
import type { PatientSummary } from "./PatientSummary";

export interface MedicalRecordListDTO {
  patientSummary: PatientSummary,
  medicalRecord: MedicalRecordDTO,
}