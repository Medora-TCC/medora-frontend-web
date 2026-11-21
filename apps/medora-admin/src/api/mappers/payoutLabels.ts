import type { AppointmentIssueReason, PayoutClosingStatus, PayoutItemType, PixKeyType } from "../dtos/payouts";

export const PAYOUT_STATUS_CONFIG: Record<PayoutClosingStatus, { label: string; className: string }> = {
  PendingApproval: { label: "Aguardando aprovação", className: "bg-warning-subtle text-warning-text" },
  Approved: { label: "Aprovado", className: "bg-primary-subtle text-primary-text" },
  Paid: { label: "Pago", className: "bg-success-subtle text-success-text" },
};

export const ISSUE_REASON_LABEL: Record<AppointmentIssueReason, string> = {
  DoctorNoShow: "Médico não compareceu",
  CallDropped: "Chamada caiu",
  AudioOrVideoProblem: "Problema de áudio ou vídeo",
  DoctorLate: "Médico atrasou muito",
  EndedEarly: "Consulta encerrada antes do tempo",
};

export const PAYOUT_ITEM_TYPE_LABEL: Record<PayoutItemType, string> = {
  Credit: "Crédito",
  Debit: "Estorno",
};

export const PIX_KEY_TYPE_LABEL: Record<PixKeyType, string> = {
  Cnpj: "CNPJ",
  Random: "Chave aleatória",
};