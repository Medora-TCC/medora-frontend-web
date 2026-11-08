
import type { LoginInput } from "../dtos/Auth/LoginInput";
import { Endpoints } from "../enums/endpoints";
import { api } from "./api";
import { isAxiosError } from "axios";


interface LoginResponse {
  token?: string;
  mfaRequired?: boolean;
}

export async function loginService(props: LoginInput): Promise<LoginResponse> {
  try {
    const res = await api.post(Endpoints.LOGIN, props);

    return { token: res.data.accessToken, mfaRequired: false };

  } catch (error) {
    if (isAxiosError(error) && error.response) {
      const { status, data } = error.response;

      if (status === 403 && data?.type === "mfa_required") {
        return { mfaRequired: true }
      }
    }
    throw new Error("Erro ao fazer login. Verifique suas credenciais.");
  }
}

export async function requestPasswordReset(email: string): Promise<void> {
  try {
    await api.post(Endpoints.FORGOT_PWD, { email });
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.detail ?? error.response.data?.title ?? "Não foi possível enviar o código.");
    }
    throw new Error("Erro de conexão. Tente novamente.");
  }
}

export async function resetPassword(email: string, resetCode: string, newPassword: string): Promise<void> {
  try {
    await api.post(Endpoints.RESET_PWD, { email, resetCode, newPassword });
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.detail ?? error.response.data?.title ?? "Não foi possível alterar a senha.");
    }
    throw new Error("Erro de conexão. Tente novamente.");
  }
}