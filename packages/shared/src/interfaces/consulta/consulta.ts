export type StatusConsulta = 'agendado' | 'esperando_pagamento' | 'esperando_confirmacao' |'confirmado'| 'em_atendimento' | 'finalizado' | 'cancelado' | 'ausente';
export type TypeConsulta = 'presencial' | 'teleconsulta' | 'outro';
export type FiltroConsulta = 'hoje' | 'amanha' | 'semana' | 'nenhum';

// O backend serializa os enums como texto (JsonStringEnumConverter)
export const typeMapByCode: Record<string, TypeConsulta> = {
  InPerson: "presencial",
  Online: "teleconsulta",
  Any: "outro"
};

export const filterMapByCode: Record<FiltroConsulta, number | undefined> = {
  hoje: 0,
  amanha: 1,
  semana: 2,
  nenhum: undefined,
};

export const statusMapByCodeToString: Record<number, StatusConsulta | undefined> = {
  1: "agendado",
  2: "esperando_pagamento",
  3: "esperando_confirmacao",
  4: "confirmado",
  5: "em_atendimento",
  6: "finalizado",
  8: "cancelado",
  9: "ausente",
};

export const statusMapByName: Record<string, StatusConsulta> = {
  Scheduled: "agendado",
  AwaitingPayment: "esperando_pagamento",
  AwaitingConfirmation: "esperando_confirmacao",
  Confirmed: "confirmado",
  InProgress: "em_atendimento",
  Completed: "finalizado",
  Canceled: "cancelado",
  Absent: "ausente",
};


// Aceita texto (atual) ou número (caso o backend mude)
export function parseStatus(raw: string | number): StatusConsulta | undefined {
  return typeof raw === "number"
    ? statusMapByCodeToString[raw]
    : statusMapByName[raw];
}

export const statusMapByCode: Record<StatusConsulta, number> = {
  agendado: 1,
  esperando_pagamento: 2,
  esperando_confirmacao: 3,
  confirmado: 4,
  em_atendimento: 5,
  finalizado: 6,
  cancelado: 8,
  ausente: 9,
};

export interface IConsultaDetailed {
  id: number;
  patientNome: string;
  healthInsurance: string; //Ex. Unimed, MedSenior e etc
  startDateTime: string; //Ex. Formato 2026-05-21T08:00:00.000-03:00
  endDateTime: string; //Ex. Formato 2026-05-21T08:00:00.000-03:00
  locationAdress: string; //Ex. Rua das Flores, se for Teleconsulta -> Sala Virtual
  status: StatusConsulta;
  type: TypeConsulta;
  tags?: string[];
  meetingCode?: string; //EX. Medora.com/nanoID
  platform: string; //EX. fixo -> Medora
  patientTermsAccepted: boolean; 
}

export interface IConsultaSimplified{
  id: string;
  patientNome: string;
  healthInsurance: string; //Ex. Unimed, MedSenior e etc
  status: StatusConsulta;
  type: TypeConsulta;
}

export interface IConsultaTeleConsultaDto{
  appointmentId: number,
  patientId: string,
  doctorId: string,
  startDateTime: string;
  endDateTime: string;
  status: number,
  type: number
}

export interface IConsultaTeleConsultaPayload{
  id: number,
  patientId: string,
  doctorId: string,
  startDateTime: string;
  endDateTime: string;
  status: string,
  type: string
}


export interface ITeleConsultaDetailed extends IConsultaDetailed {
   meetingCode: string;
   meetingUrl?: string; //EX. Medora.com/nanoID
   platform: string; //EX. fixo -> Medora
   doctorTermsAccepted: boolean; 
   patientTermsAccepted: boolean; 
}

export interface AcceptTermsDTO{
  termId: string;
  term: string;
  termVersion: string;
  userResponse: boolean;
  consultaId: string;
  userIp: string;
}

export function toConsulta() {
  
}