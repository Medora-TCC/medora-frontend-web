import { Endpoints } from '../enums/endpoints';
import { api } from './api';
import { toDomainError } from '../errors';
import type { AppointmentStatus } from './Appointments';

export interface MedicalRecord {
  id: number;
  appointmentId: number;
  contentJson: string;
  isFinalized: boolean;
  finalizedAt: string | null;
  updatedAt: string;
}

export type SignatureStatus = 'NotApplicable' | 'Pending' | 'Submitted' | 'Signed' | 'Failed';

export interface AppointmentMedicalRecord {
  record: MedicalRecord | null;
  appointmentStatus: AppointmentStatus;
  isWritable: boolean;
}

export interface MedicalRecordPdf {
  signatureStatus: SignatureStatus;
  downloadUrl: string | null;
  expiresAt: string | null;
}

async function getByAppointment(appointmentId: number): Promise<AppointmentMedicalRecord> {
  try {
    const res = await api.get<AppointmentMedicalRecord>(Endpoints.MEDICAL_RECORD_BY_APPOINTMENT(appointmentId));
    return res.data;
  } catch (error) {
    throw toDomainError(error, 'Erro ao carregar o prontuário.');
  }
}

async function saveDraft(appointmentId: number, contentJson: string): Promise<MedicalRecord> {
  try {
    const res = await api.put<MedicalRecord>(Endpoints.MEDICAL_RECORD_BY_APPOINTMENT(appointmentId), { contentJson });
    return res.data;
  } catch (error) {
    throw toDomainError(error, 'Erro ao salvar o prontuário.');
  }
}

async function finalize(id: number): Promise<void> {
  try {
    await api.post(Endpoints.FINALIZE_MEDICAL_RECORD(id));
  } catch (error) {
    throw toDomainError(error, 'Erro ao finalizar o prontuário.');
  }
}

async function getPdf(id: number): Promise<MedicalRecordPdf> {
  try {
    const res = await api.get<MedicalRecordPdf>(Endpoints.MEDICAL_RECORD_PDF(id));
    return res.data;
  } catch (error) {
    throw toDomainError(error, 'Erro ao buscar o PDF do prontuário.');
  }
}

const MedicalRecordsService = {
  getByAppointment,
  saveDraft,
  finalize,
  getPdf,
};

export default MedicalRecordsService;
