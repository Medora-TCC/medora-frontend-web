import { request } from "./api";

export type PayoutClosingStatus = "PendingApproval" | "Approved" | "Paid";
export type PayoutItemType = "Credit" | "Debit";

export interface PayoutPreviewItem {
  doctorId: string;
  doctorName: string;
  creditCount: number;
  creditAmount: number;
  debitCount: number;
  debitAmount: number;
  totalAmount: number;
  alreadyClosed: boolean;
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

export type AppointmentIssueReason = "DoctorNoShow" | "CallDropped" | "AudioOrVideoProblem" | "DoctorLate" | "EndedEarly";

const base = "/admin/payouts";

export const getPreview = (month: string) => request<PayoutPreviewItem[]>(`${base}/preview?month=${month}`);

export const getAttention = () => request<PayoutAttentionItem[]>(`${base}/attention`);

export const listClosings = (month: string) => request<PayoutClosingSummary[]>(`${base}/closings?month=${month}`);

export const getClosing = (id: number) => request<PayoutClosingDetail>(`${base}/closings/${id}`);

export const generateClosings = (month: string) =>
  request<number[]>(`${base}/closings`, { method: "POST", body: { month } });

export const approveClosing = (id: number) => request<void>(`${base}/closings/${id}/approve`, { method: "POST" });

export const markClosingAsPaid = (id: number, paymentReference: string) =>
  request<void>(`${base}/closings/${id}/paid`, { method: "POST", body: { paymentReference } });

export const discardClosing = (id: number) => request<void>(`${base}/closings/${id}`, { method: "DELETE" });

export const holdPayout = (appointmentId: number, reason: string) =>
  request<void>(`${base}/appointments/${appointmentId}/hold`, { method: "POST", body: { reason } });

export const releasePayout = (appointmentId: number) =>
  request<void>(`${base}/appointments/${appointmentId}/hold`, { method: "DELETE" });

export const releaseIssuePayout = (issueId: number) =>
  request<void>(`/admin/appointment-issues/${issueId}/release`, { method: "POST" });

export const refundIssuePatient = (issueId: number) =>
  request<void>(`/admin/appointment-issues/${issueId}/refund`, { method: "POST" });
