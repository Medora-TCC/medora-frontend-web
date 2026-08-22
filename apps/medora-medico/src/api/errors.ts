import { isAxiosError } from 'axios';

export interface ProblemDetailsBody {
  title?: string;
  detail?: string;
  status?: number;
  Erros?: string[];
  Conflitos?: string[];
}

const GENERIC_VALIDATION_DETAIL = 'Um ou mais erros de validação ocorreram';

export function toDomainError(error: unknown, fallback: string): Error {
  if (!isAxiosError(error) || !error.response) {
    return new Error(fallback);
  }

  const body = error.response.data as ProblemDetailsBody | undefined;

  const extensions = [...(body?.Erros ?? []), ...(body?.Conflitos ?? [])].filter(Boolean);
  if (extensions.length > 0) {
    return new Error(extensions.join(' '));
  }

  if (body?.detail && body.detail !== GENERIC_VALIDATION_DETAIL) {
    return new Error(body.detail);
  }

  return new Error(fallback);
}

export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
