import type { Race, Sex } from "../dtos/Doctors/PersonalDataDto";

export const sexLabel: Record<Sex, string> = {
  Unknown: "Não informado",
  Male: "Masculino",
  Female: "Feminino",
  Intersex: "Intersexo",
};

export const raceLabel: Record<Race, string> = {
  None: "Não informada",
  White: "Branca",
  Black: "Preta",
  Yellow: "Amarela",
  Brown: "Parda",
  Indigenous: "Indígena",
};

export function formatCpf(cpf: string | null): string | null {
  if (!cpf) return null;
  const digits = cpf.replace(/\D/g, "");
  return digits.length === 11
    ? digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    : cpf;
}

export function formatDateOnly(value: string | null): string | null {
  if (!value) return null;
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

export function formatPhone(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  if (digits.length === 10) return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  return phone;
}

const regionNames = new Intl.DisplayNames(["pt-BR"], { type: "region" });

export function formatCountry(code: string | null): string | null {
  if (!code) return null;
  try {
    return regionNames.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

const TIME_ZONE_LABELS: Record<string, string> = {
  "America/Sao_Paulo": "Horário de Brasília (GMT-3)",
  "America/Manaus": "Horário do Amazonas (GMT-4)",
  "America/Rio_Branco": "Horário do Acre (GMT-5)",
  "America/Noronha": "Fernando de Noronha (GMT-2)",
};

export function formatTimeZone(timeZoneId: string | null): string | null {
  if (!timeZoneId) return null;
  return TIME_ZONE_LABELS[timeZoneId] ?? timeZoneId;
}

export const TIME_ZONE_OPTIONS = Object.entries(TIME_ZONE_LABELS).map(([value, label]) => ({ value, label }));

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export const BRAZIL_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

const NON_COUNTRY_CODES = new Set(["EU", "EZ", "UN", "QO", "XA", "XB", "ZZ"]);

function buildCountryOptions() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const options: { value: string; label: string }[] = [];

  for (const first of letters) {
    for (const second of letters) {
      const code = first + second;
      if (NON_COUNTRY_CODES.has(code)) continue;
      const name = regionNames.of(code);
      if (name && name !== code) options.push({ value: code, label: name });
    }
  }

  return options.sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
}

export const COUNTRY_OPTIONS = buildCountryOptions();

export function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function daysUntil(dateOnly: string): number {
  const [year, month, day] = dateOnly.split("-").map(Number);
  const target = Date.UTC(year, month - 1, day);
  const [ty, tm, td] = todayIso().split("-").map(Number);
  const today = Date.UTC(ty, tm - 1, td);
  return Math.round((target - today) / 86_400_000);
}