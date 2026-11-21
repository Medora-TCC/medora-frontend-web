export interface MedicalRecordDTO {
  id: number;
  /** Consulta do prontuário: a tela do prontuário abre por ela (/medico/prontuario/:appointmentId). */
  appointmentId: number;
  jsonContent: string;
  date: Date;
  isFinalized: boolean;
  isDeleted: boolean;
}
