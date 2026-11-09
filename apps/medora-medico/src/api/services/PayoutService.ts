import type { PayoutClosingDetailDto, PayoutStatementDto, PixKeyDto, PixKeyType } from "../dtos/Payouts/PayoutDto";
import { Endpoints } from "../enums/endpoints";
import { toDomainError } from "../errors";
import { api } from "./api";

export async function getMyPayoutStatement(): Promise<PayoutStatementDto> {
  try {
    const response = await api.get<PayoutStatementDto>(Endpoints.MY_PAYOUTS);
    return response.data;
  } catch (error) {
    throw toDomainError(error, "Erro ao carregar seus ganhos.");
  }
}

export async function getMyPixKey(): Promise<PixKeyDto | null> {
  try {
    // 204 quando o médico ainda não cadastrou
    const response = await api.get<PixKeyDto | "">(Endpoints.MY_PIX_KEY);
    return response.data || null;
  } catch (error) {
    throw toDomainError(error, "Erro ao carregar a chave Pix.");
  }
}

export async function saveMyPixKey(type: PixKeyType, key: string): Promise<PixKeyDto> {
  try {
    const response = await api.put<PixKeyDto>(Endpoints.MY_PIX_KEY, { type, key });
    return response.data;
  } catch (error) {
    throw toDomainError(error, "Erro ao salvar a chave Pix.");
  }
}

export async function getMyPayoutClosing(closingId: number): Promise<PayoutClosingDetailDto> {
  try {
    const response = await api.get<PayoutClosingDetailDto>(`${Endpoints.MY_PAYOUT_CLOSINGS}/${closingId}`);
    return response.data;
  } catch (error) {
    throw toDomainError(error, "Erro ao carregar o fechamento.");
  }
}
