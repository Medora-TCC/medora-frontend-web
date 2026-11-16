import type { PatientSummary } from "../../api/dtos/MedicalRecord/PatientSummary";
import { formatSex } from "../../types/Sex";

export const onlyDigits = (value: string): string => value.replace(/\D/g, "");

export function maskCpf(value: string): string {
  return onlyDigits(value)
    .slice(0, 11)
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

export function formatCpf(cpf?: string): string {
  if (!cpf) return "—";
  const digits = onlyDigits(cpf);
  return digits.length === 11 ? maskCpf(digits) : cpf;
}

export function patientInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function parseBirthDate(value: string): Date | null {
  const br = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  const date = br
    ? new Date(Number(br[3]), Number(br[2]) - 1, Number(br[1]))
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function calcAge(birthDate?: string): number | null {
  if (!birthDate) return null;
  const birth = parseBirthDate(birthDate);
  if (!birth) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const hadBirthday =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hadBirthday) age -= 1;
  return age >= 0 ? age : null;
}

export function patientMeta(patient: PatientSummary): string {
  const age = calcAge(patient.birthDate);
  const sex = formatSex(patient.sex!);
  return [age !== null ? `${age} anos` : null, sex].filter(Boolean).join(" · ") || "—";
}

export const formatDate = (date: Date): string => date.toLocaleDateString("pt-BR");

export const formatTime = (date: Date): string =>
  date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

export const recordStatus = (r: {
  isDeleted: boolean;
  isFinalized: boolean;
}): { label: string; color: "success" | "default" | "danger" } =>
  r.isDeleted
    ? { label: "Inativado", color: "danger" }
    : r.isFinalized
      ? { label: "Finalizado", color: "default" }
      : { label: "Em andamento", color: "success" };