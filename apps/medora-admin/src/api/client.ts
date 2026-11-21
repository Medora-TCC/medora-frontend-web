import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "https://localhost:7069/api";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

interface ProblemDetails {
  title?: string;
  detail?: string;
  type?: string;
  Erros?: string[];
}

export class ApiError extends Error {
  status: number;
  body?: ProblemDetails;

  constructor(message: string, status: number, body?: ProblemDetails) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

const GENERIC_VALIDATION_DETAIL = "Um ou mais erros de validação ocorreram";

// ---------- sessão expirada ----------

let onSessionExpired: (() => void) | null = null;

export function setOnSessionExpired(handler: (() => void) | null) {
  onSessionExpired = handler;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    const { data } = await axios.post<{ accessToken: string }>(`${baseUrl}/auth/refresh`, null, {
      withCredentials: true,
    });
    accessToken = data.accessToken;
    return accessToken;
  } catch {
    return null;
  }
}

function toApiError(error: AxiosError<ProblemDetails>): ApiError {
  if (!error.response) return new ApiError("Não foi possível conectar ao servidor.", 0);

  const body = error.response.data;
  const validation = (body?.Erros ?? []).filter(Boolean).join(" ");
  const detail = body?.detail && body.detail !== GENERIC_VALIDATION_DETAIL ? body.detail : undefined;

  return new ApiError(validation || detail || body?.title || "Erro inesperado.", error.response.status, body);
}

export const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

// Login e código de verificação usam o token temporário do cookie mfa_token. O backend só lê esse
// cookie quando a requisição não traz outro token: com o token de uma sessão anterior (o portal do
// médico no mesmo localhost) o código era recusado com 403.
const isLoginStep = (config: InternalAxiosRequestConfig) =>
  config.url === "/auth/login" ||
  config.url === "/mfa/auth/verify" ||
  (config.url === "/mfa/" && config.data?.Action === "Login");

api.interceptors.request.use((config) => {
  if (accessToken && !config.headers.Authorization && !isLoginStep(config)) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ProblemDetails>) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const isAuthCall = original?.url?.startsWith("/auth/") || original?.url?.startsWith("/mfa/");

    if (error.response?.status === 401 && original && !original._retried && !isAuthCall) {
      original._retried = true;

      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const newToken = await refreshPromise;

      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }

      accessToken = null;
      onSessionExpired?.();
    }

    return Promise.reject(toApiError(error));
  },
);

/**
 * Mantido para as telas existentes: mesma assinatura de antes, agora usando o axios.
 */
export async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string } = {},
): Promise<T> {
  const response = await api.request<T>({
    url: path,
    method: options.method ?? "GET",
    data: options.body,
    headers: options.token ? { Authorization: `Bearer ${options.token}` } : undefined,
  });

  return response.data;
}