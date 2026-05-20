import type { IConsultaDetailed } from "@medora_web/shared";

export function PatientInitials(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

export function canEnter(c: IConsultaDetailed): boolean {
  if (c.status !== "agendado" && c.status !== "em_atendimento") return false;
  const horario = new Date(c.dataHorario).getTime();
  const agora = Date.now();
  return agora >= horario - 15 * 60 * 1000 && agora <= horario + 10 * 60 * 1000;
}

export function formatConsultaHorario(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function isHoje(iso: string) {
  const d = new Date(iso);
  const h = new Date();
  return (
    d.getDate() === h.getDate() &&
    d.getMonth() === h.getMonth() &&
    d.getFullYear() === h.getFullYear()
  );
}
