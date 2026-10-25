import { Endpoints } from '../enums/endpoints';
import { api } from './api';
import { toDomainError } from '../errors';
import type { SignatureStatus } from './MedicalRecords';

export interface IssuedPrescription {
  publicId: string;
  /** Código que o paciente usa para abrir a receita; só é devolvido na emissão */
  secretCode: string;
  documentSignatureId: number;
  verificationUrl: string;
}

export interface PrescriptionPdf {
  signatureStatus: SignatureStatus;
  downloadUrl: string | null;
  expiresAt: string | null;
}

async function issue(medicalRecordId: number, contentText: string, validForDays: number): Promise<IssuedPrescription> {
  try {
    const res = await api.post<IssuedPrescription>(Endpoints.ISSUE_PRESCRIPTION(medicalRecordId), { contentText, validForDays });
    return res.data;
  } catch (error) {
    throw toDomainError(error, 'Erro ao emitir a receita.');
  }
}

async function getPdf(publicId: string): Promise<PrescriptionPdf> {
  try {
    const res = await api.get<PrescriptionPdf>(Endpoints.PRESCRIPTION_PDF(publicId));
    return res.data;
  } catch (error) {
    throw toDomainError(error, 'Erro ao buscar o PDF da receita.');
  }
}

const PrescriptionsService = {
  issue,
  getPdf,
};

export default PrescriptionsService;
