import { ApiError, request } from "./api";

export type LoginResult = { accessToken: string } | { mfaRequired: true };

export async function login(email: string, password: string): Promise<LoginResult> {
  try {
    const data = await request<{ accessToken: string }>("/auth/login", { method: "POST", body: { email, password } });
    return { accessToken: data.accessToken };
  } catch (error) {
    // O backend responde 403 mfa_required e grava o token intermediário num cookie.
    if (error instanceof ApiError && error.status === 403 && error.body?.type === "mfa_required") {
      return { mfaRequired: true };
    }
    throw error instanceof ApiError && error.status === 0
      ? error
      : new Error("Erro ao fazer login. Verifique suas credenciais.");
  }
}

export async function initMfa(): Promise<{ useAuthenticationApp: boolean; sentTo?: string }> {
  return request("/mfa/", { method: "POST", body: { Action: "Login" } });
}

export async function verifyMfa(code: string, rememberDevice: boolean): Promise<{ accessToken: string }> {
  return request("/mfa/auth/verify", { method: "POST", body: { code, rememberDevice } });
}

export async function refresh(): Promise<string> {
  const data = await request<{ accessToken: string }>("/auth/refresh", { method: "POST", body: {} });
  return data.accessToken;
}

export async function logout(): Promise<void> {
  await request("/auth/logout", { method: "POST" }).catch(() => undefined);
}
