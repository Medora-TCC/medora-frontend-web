export interface MedicalRecordDTO {
  id: number;
  jsonContent: string;
  date: Date;
  isFinalized: boolean;
  isDeleted: boolean;
}
