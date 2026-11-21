import { api } from "../client";
import { Endpoints } from "../endpoints";
import type {
  PayoutAttentionItem,
  PayoutClosingDetail,
  PayoutClosingSummary,
  PayoutPreviewItem,
} from "../dtos/payouts";

export async function getPreview(month: string): Promise<PayoutPreviewItem[]> {
  const { data } = await api.get<PayoutPreviewItem[]>(Endpoints.PAYOUTS_PREVIEW, { params: { month } });
  return data;
}

export async function getAttention(): Promise<PayoutAttentionItem[]> {
  const { data } = await api.get<PayoutAttentionItem[]>(Endpoints.PAYOUTS_ATTENTION);
  return data;
}

export async function listClosings(month: string): Promise<PayoutClosingSummary[]> {
  const { data } = await api.get<PayoutClosingSummary[]>(Endpoints.PAYOUT_CLOSINGS, { params: { month } });
  return data;
}

export async function getClosing(id: number): Promise<PayoutClosingDetail> {
  const { data } = await api.get<PayoutClosingDetail>(Endpoints.PAYOUT_CLOSING(id));
  return data;
}

export async function generateClosings(month: string): Promise<number[]> {
  const { data } = await api.post<number[]>(Endpoints.PAYOUT_CLOSINGS, { month });
  return data;
}

export async function approveClosing(id: number): Promise<void> {
  await api.post(Endpoints.PAYOUT_CLOSING_APPROVE(id));
}

export async function markClosingAsPaid(id: number, paymentReference: string): Promise<void> {
  await api.post(Endpoints.PAYOUT_CLOSING_PAID(id), { paymentReference });
}

export async function discardClosing(id: number): Promise<void> {
  await api.delete(Endpoints.PAYOUT_CLOSING(id));
}

export async function holdPayout(appointmentId: number, reason: string): Promise<void> {
  await api.post(Endpoints.PAYOUT_HOLD(appointmentId), { reason });
}

export async function releasePayout(appointmentId: number): Promise<void> {
  await api.delete(Endpoints.PAYOUT_HOLD(appointmentId));
}