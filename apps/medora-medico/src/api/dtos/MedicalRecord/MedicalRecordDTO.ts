export interface MedicalRecordDTO {
  id: number;
  /** Consulta do prontuário: a tela do prontuário abre por ela (/medico/prontuario/:appointmentId). */
  appointmentId: number;
  jsonContent: string;
  date: Date;
  isFinalized: boolean;
  isDeleted: boolean;
  /** Receita mais recente da consulta (só vem na busca); null = consulta sem receita. */
  prescriptionPublicId?: string | null;
}
