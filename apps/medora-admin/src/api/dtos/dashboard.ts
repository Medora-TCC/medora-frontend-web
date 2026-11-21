export interface CredentialsOverview {
  ladder: { verified: number; reverificationPending: number; sealSuspended: number };
  byStatus: { status: string; count: number }[];
  needingAttention: { doctorId: string; name: string; verificationStatus: string; verificationDate: string | null }[];
}