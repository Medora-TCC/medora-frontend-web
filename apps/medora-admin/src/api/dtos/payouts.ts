export type PayoutClosingStatus = "PendingApproval" | "Approved" | "Paid";
export type PayoutItemType = "Credit" | "Debit";
export type PixKeyType = "Cnpj" | "Random";
export type AppointmentIssueReason = "DoctorNoShow" | "CallDropped" | "AudioOrVideoProblem" | "DoctorLate" | "EndedEarly";

export interface PayoutPreviewConsultation {
  appointmentId: number;
  appointmentStartDateTime: string;
  amount: number;
}

export interface PayoutPreviewItem {
  doctorId: string;
  doctorName: string;
  creditCount: number;
  creditAmount: number;
  debitCount: number;
  debitAmount: number;
  totalAmount: number;
  alreadyClosed: boolean;
  consultations: PayoutPreviewConsultation[];
}

export interface PayoutClosingSummary {
  id: number;
  doctorId: string;
  doctorName: string;
  referenceMonth: string;
  status: PayoutClosingStatus;
  totalAmount: number;
  itemCount: number;
  approvedAt: string | null;
  paidAt: string | null;
  paymentReference: string | null;
  pixKeyType: PixKeyType | null;
  pixKey: string | null;
}

export interface PayoutClosingItem {
  paymentId: number;
  appointmentId: number;
  appointmentStartDateTime: string;
  type: PayoutItemType;
  amount: number;
}

export interface PayoutClosingDetail {
  closing: PayoutClosingSummary;
  items: PayoutClosingItem[];
}

export interface PayoutAttentionItem {
  appointmentId: number;
  paymentId: number;
  doctorId: string;
  doctorName: string;
  appointmentStartDateTime: string;
  appointmentStatus: string;
  amount: number;
  holdReason: string | null;
  heldAt: string | null;
  issueId: number | null;
  issueReason: AppointmentIssueReason | null;
}