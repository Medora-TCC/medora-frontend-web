import { Endpoints } from '../enums/endpoints';
import { api } from './api';
import { toDomainError } from '../errors';
import type { SignatureStatus } from './MedicalRecords';

export type DocumentKind = 'MedicalRecord' | 'Prescription';

export interface DoctorSignature {
  signatureId: number;
  documentKind: DocumentKind;
  status: SignatureStatus;
  hasEnvelope: boolean;
  medicalRecordId: number;
  prescriptionPublicId: string | null;
  appointmentId: number;
  patientName: string;
  attemptCount: number;
  frozenAt: string | null;
  queuedAt: string | null;
}

interface PagedSignatures {
  items: DoctorSignature[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface SignatureAction {
  signatureId: number;
  status: SignatureStatus;
}

export interface SignatureHealth {
  state: string;
  canIssuePrescription: boolean;
}

async function listMine(): Promise<DoctorSignature[]> {
  try {
    const res = await api.get<PagedSignatures>(Endpoints.MY_SIGNATURES, { params: { page: 1, pageSize: 100 } });
    return res.data.items;
  } catch (error) {
    throw toDomainError(error, 'Erro ao carregar os documentos para assinar.');
  }
}

async function authorize(id: number): Promise<SignatureAction> {
  try {
    const res = await api.post<SignatureAction>(Endpoints.AUTHORIZE_SIGNATURE(id));
    return res.data;
  } catch (error) {
    throw toDomainError(error, 'Erro ao assinar o documento.');
  }
}

async function retry(id: number): Promise<SignatureAction> {
  try {
    const res = await api.post<SignatureAction>(Endpoints.RETRY_SIGNATURE(id));
    return res.data;
  } catch (error) {
    throw toDomainError(error, 'Erro ao tentar assinar de novo.');
  }
}

async function health(): Promise<SignatureHealth> {
  try {
    const res = await api.get<SignatureHealth>(Endpoints.SIGNATURE_HEALTH);
    return res.data;
  } catch (error) {
    throw toDomainError(error, 'Erro ao consultar o serviço de assinatura.');
  }
}

const SignaturesService = {
  listMine,
  authorize,
  retry,
  health,
};

export default SignaturesService;
