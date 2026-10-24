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

  const validationErrors = (body?.Erros ?? []).filter(Boolean);
  if (validationErrors.length > 0) {
    return new Error(validationErrors.join(' '));
  }

  const conflicts = (body?.Conflitos ?? []).filter(Boolean);
  const detail = body?.detail && body.detail !== GENERIC_VALIDATION_DETAIL ? body.detail : undefined;

  if (detail && conflicts.length > 0) {
    return new Error(`${detail} ${conflicts.join(', ')}`);
  }

  if (detail || conflicts.length > 0) {
    return new Error(detail ?? conflicts.join(', '));
  }

  return new Error(fallback);
}

export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
