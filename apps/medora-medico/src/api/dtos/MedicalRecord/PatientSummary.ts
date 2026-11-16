import type { Sex } from "../Doctors/PersonalDataDto";

export interface PatientSummary {
  id?: string;
  name: string;
  birthDate?: string; // ISO "dd/mm/yyyy"
  sex?: Sex;
  cpf?: string;
}