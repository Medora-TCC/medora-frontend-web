export type DoctorStatus = "Pending" | "Approved" | "Rejected";

// Calculado pela API a partir da data da última verificação; tem prioridade sobre o status.
export type VerificationBadge = "Verified" | "PendingReverification" | "Suspended";

export interface ProfessionalRegistrationDto {
  id: number;
  councilType: string;
  councilNumber: string;
  councilState: string;
}

export interface ProfessionalDataDto {
  status: DoctorStatus;
  registrations: ProfessionalRegistrationDto[];
  verificationBadge?: VerificationBadge | null;
  verificationDate?: string | null;
}
