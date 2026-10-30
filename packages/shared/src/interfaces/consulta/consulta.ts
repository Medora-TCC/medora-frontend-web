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


export const statusMapByCode: Record<string, StatusConsulta> = {
  Scheduled: "agendado",
  AwaitingPayment: "esperando_pagamento",
  AwaitingConfirmation: "esperando_confirmacao",
  Confirmed: "confirmado",
  InProgress: "em_atendimento",
  Completed: "finalizado",
  RescheduleNeeded: "agendado",
  Canceled: "cancelado",
  Absent: "ausente",
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
  meetingUrl?: string; //EX. Medora.com/nanoID
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