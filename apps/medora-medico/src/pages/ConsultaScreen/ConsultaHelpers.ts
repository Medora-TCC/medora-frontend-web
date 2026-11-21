import type { IConsultaDetailed } from "@medora_web/shared";
import { ROOM_LEAD_MINUTES } from "../SchedulePage/scheduleModel";

export function PatientInitials(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}


export function canEnter(c: IConsultaDetailed): boolean {
  if (!c) return false;
  if (c.status !== "confirmado" && c.status !== "em_atendimento") return false;  
  // mesma regra da agenda: a sala abre ROOM_LEAD_MINUTES antes (o backend recusa antes disso)
  const inicio = new Date(c.startDateTime).getTime() - ROOM_LEAD_MINUTES * 60 * 1000;
  const fim = new Date(c.endDateTime).getTime();
  const agora = Date.now();

  return agora >= inicio && agora <= fim;
}

// dispara para o back a ação de tentar entrar na consulta
export function enterConsulta(meetingCode: string, navigate: any) {

  navigate(`../teleconsulta/${meetingCode}/pre-sala`, { state: { appointmentId: meetingCode } });
}

export function isTeleConsulta(consulta: IConsultaDetailed ) {
  return consulta.type === 'teleconsulta' && 'meetingCode' in consulta;
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
