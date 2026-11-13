export interface MedicalRecordDTO {
  id: number;
  jsonContent: string;
  dateCreated: Date;
  isFinalized: boolean;
  isDeleted: boolean;
}
