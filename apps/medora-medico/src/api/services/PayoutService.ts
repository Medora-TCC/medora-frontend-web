import type { PayoutClosingDetailDto, PayoutStatementDto } from "../dtos/Payouts/PayoutDto";
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

export async function getMyPayoutClosing(closingId: number): Promise<PayoutClosingDetailDto> {
  try {
    const response = await api.get<PayoutClosingDetailDto>(`${Endpoints.MY_PAYOUT_CLOSINGS}/${closingId}`);
    return response.data;
  } catch (error) {
    throw toDomainError(error, "Erro ao carregar o fechamento.");
  }
}
