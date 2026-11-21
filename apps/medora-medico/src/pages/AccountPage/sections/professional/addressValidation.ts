import { BRAZIL_STATES, onlyDigits } from "../../../../api/mappers/personLabels";

export interface AddressForm {
  postalCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export type AddressField = keyof AddressForm;
export type AddressErrors = Partial<Record<AddressField, string>>;

// Situação da consulta do CEP no ViaCEP. "unavailable" (serviço fora do ar, sem internet, demora)
// não impede de salvar: o médico preenche à mão. "notFound" impede, porque o CEP não existe.
export type CepStatus =
  | { kind: "idle" }
  | { kind: "loading"; cep: string }
  | { kind: "found"; cep: string; city: string; state: string; hasStreet: boolean }
  | { kind: "notFound"; cep: string }
  | { kind: "unavailable"; cep: string };

// mesmos limites do validador da API (DoctorAddressRequestValidator)
export const ADDRESS_LIMITS = {
  street: 100,
  number: 8,
  complement: 100,
  neighborhood: 100,
  city: 100,
} as const;

const HAS_LETTER = /\p{L}/u;
// nomes de cidade: letras, espaço, apóstrofo, hífen e ponto (ex.: "Santa Bárbara d'Oeste")
const CITY_CHARS = /^[\p{L}\s'.-]+$/u;
// número: começa com algarismo e pode ter letra, barra, hífen ou espaço (ex.: "120", "120A", "12-B")
const HOUSE_NUMBER = /^\d[\dA-Za-z\s/-]*$/;
const NO_NUMBER = /^s\.?\s*\/?\s*n\.?$/i;

export function normalizeSpaces(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

// "s/n", "SN", "s.n." viram "S/N"; o resto só perde os espaços sobrando
export function normalizeNumber(value: string): string {
  const normalized = normalizeSpaces(value);
  return NO_NUMBER.test(normalized) ? "S/N" : normalized.toUpperCase();
}

export function formatCep(value: string): string {
  const digits = onlyDigits(value).slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

// compara sem acento e sem maiúsculas: "São José" e "Sao Jose" são a mesma cidade
export function sameText(a: string, b: string): boolean {
  const simplify = (value: string) =>
    normalizeSpaces(value).normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  return simplify(a) === simplify(b);
}

export function isCepComplete(value: string): boolean {
  return onlyDigits(value).length === 8;
}

function validatePostalCode(value: string, status: CepStatus): string | undefined {
  const cep = onlyDigits(value);
  if (!cep) return "Informe o CEP.";
  if (cep.length !== 8) return "O CEP tem 8 números.";
  if (/^(\d)\1{7}$/.test(cep)) return "CEP inválido.";
  if (status.kind === "notFound" && status.cep === cep) return "CEP não encontrado. Confira os números.";
  if (status.kind === "loading" && status.cep === cep) return "Aguarde a busca do CEP.";
  return undefined;
}

// label: "a rua" (Informe a rua.) e of: "da rua" (Nome da rua muito curto.)
function validateName(value: string, label: string, of: string, max: number, min = 2): string | undefined {
  const text = normalizeSpaces(value);
  if (!text) return `Informe ${label}.`;
  if (text.length < min) return `Nome ${of} muito curto.`;
  if (!HAS_LETTER.test(text)) return `O nome ${of} precisa ter letras.`;
  if (text.length > max) return `Use no máximo ${max} caracteres.`;
  return undefined;
}

function validateNumber(value: string): string | undefined {
  const number = normalizeNumber(value);
  if (!number) return "Informe o número, ou S/N se não houver.";
  if (number.length > ADDRESS_LIMITS.number) return `Use no máximo ${ADDRESS_LIMITS.number} caracteres.`;
  if (number === "S/N") return undefined;
  if (!HOUSE_NUMBER.test(number)) return "Use só o número (ex.: 120, 120A) ou S/N.";
  return undefined;
}

function validateCity(value: string, status: CepStatus): string | undefined {
  const error = validateName(value, "a cidade", "da cidade", ADDRESS_LIMITS.city);
  if (error) return error;
  if (!CITY_CHARS.test(normalizeSpaces(value))) return "A cidade deve ter só letras.";
  if (status.kind === "found" && !sameText(value, status.city)) {
    return `A cidade não confere com o CEP (${status.city}).`;
  }
  return undefined;
}

function validateState(value: string, status: CepStatus): string | undefined {
  if (!value) return "Selecione o estado.";
  if (!(BRAZIL_STATES as readonly string[]).includes(value)) return "Estado inválido.";
  if (status.kind === "found" && value !== status.state) {
    return `O estado não confere com o CEP (${status.state}).`;
  }
  return undefined;
}

export function validateAddress(form: AddressForm, status: CepStatus): AddressErrors {
  const complement = normalizeSpaces(form.complement);
  const errors: AddressErrors = {
    postalCode: validatePostalCode(form.postalCode, status),
    street: validateName(form.street, "a rua", "da rua", ADDRESS_LIMITS.street, 3),
    number: validateNumber(form.number),
    complement:
      complement.length > ADDRESS_LIMITS.complement
        ? `Use no máximo ${ADDRESS_LIMITS.complement} caracteres.`
        : undefined,
    neighborhood: validateName(form.neighborhood, "o bairro", "do bairro", ADDRESS_LIMITS.neighborhood),
    city: validateCity(form.city, status),
    state: validateState(form.state, status),
  };

  return Object.fromEntries(
    Object.entries(errors).filter(([, message]) => message !== undefined),
  ) as AddressErrors;
}
