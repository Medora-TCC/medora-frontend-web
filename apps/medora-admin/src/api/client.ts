import axios, { AxiosError } from "axios";

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

export const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

// coloca o token em toda requisição (a não ser que a chamada mande um próprio)
api.interceptors.request.use((config) => {
  if (accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// transforma qualquer erro no mesmo ApiError de antes
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ProblemDetails>) => {
    if (!error.response) {
      return Promise.reject(new ApiError("Não foi possível conectar ao servidor.", 0));
    }

    const body = error.response.data;
    const validation = (body?.Erros ?? []).filter(Boolean).join(" ");
    const detail = body?.detail && body.detail !== GENERIC_VALIDATION_DETAIL ? body.detail : undefined;

    return Promise.reject(
      new ApiError(validation || detail || body?.title || "Erro inesperado.", error.response.status, body),
    );
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