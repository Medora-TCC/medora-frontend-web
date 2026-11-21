export interface VerificationStatusDto {
  doctorStatus: number | string;
  verificationStatus: number | string;
  verifiedAt: string | null;
  rejectionReason: string | null;
  crm: string | null;
  crmState: string | null;
  fullName: string | null;
  canCorrect: boolean;
  correctionAttemptsLeft: number;
}

export interface CorrectRegistrationDto {
  crm: string;
  crmState: string;
  fullName?: string;
}

export interface CorrectRegistrationResponseDto {
  doctorStatus: number | string;
  verificationStatus: number | string;
  correctionAttemptsLeft: number;
}