
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

    console.log(res.data)

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