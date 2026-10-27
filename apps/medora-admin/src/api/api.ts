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

/**
 * Chama a API com o token em memória e os cookies (MFA e refresh). Lança ApiError com a
 * mensagem do ProblemDetails do backend.
 */
export async function request<T>(path: string, options: { method?: string; body?: unknown; token?: string } = {}): Promise<T> {
  const token = options.token ?? accessToken;

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: options.method ?? "GET",
      credentials: "include",
      headers: {
        ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError("Não foi possível conectar ao servidor.", 0);
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    const body = data as ProblemDetails | undefined;
    const validation = (body?.Erros ?? []).filter(Boolean).join(" ");
    const detail = body?.detail && body.detail !== GENERIC_VALIDATION_DETAIL ? body.detail : undefined;
    throw new ApiError(validation || detail || body?.title || "Erro inesperado.", response.status, body);
  }

  return data as T;
}
