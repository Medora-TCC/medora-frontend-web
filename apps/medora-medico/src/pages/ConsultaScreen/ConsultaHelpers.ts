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
  if (!c) return false;
  if (c.status !== "confirmado" && c.status !== "em_atendimento") return false;

  const inicio = new Date(c.startDateTime).getTime() - 15 * 60 * 1000;
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
