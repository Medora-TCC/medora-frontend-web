export type PayoutLineStatus = "ToReceive" | "Eligible" | "Held" | "InClosing" | "Paid" | "Canceled";
export type PayoutClosingStatus = "PendingApproval" | "Approved" | "Paid";
export type PayoutItemType = "Credit" | "Debit";

export interface PayoutStatementLineDto {
  appointmentId: number;
  appointmentStartDateTime: string;
  appointmentStatus: string;
  amount: number;
  status: PayoutLineStatus;
  closingId: number | null;
  refundedAfterCredit: boolean;
  debitClosingId: number | null;
}

export interface PayoutClosingSummaryDto {
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

export interface PayoutStatementDto {
  toReceiveAmount: number;
  eligibleAmount: number;
  heldAmount: number;
  inClosingAmount: number;
  paidAmount: number;
  pendingDebitAmount: number;
  lines: PayoutStatementLineDto[];
  closings: PayoutClosingSummaryDto[];
}

export interface PayoutClosingItemDto {
  paymentId: number;
  appointmentId: number;
  appointmentStartDateTime: string;
  type: PayoutItemType;
  amount: number;
}

export interface PayoutClosingDetailDto {
  closing: PayoutClosingSummaryDto;
  items: PayoutClosingItemDto[];
}
