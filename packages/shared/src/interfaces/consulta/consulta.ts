export type StatusConsulta = 'agendado' | 'esperando_pagamento' | 'esperando_confirmacao' |'em_espera' |'confirmado'| 'em_atendimento' | 'finalizado' | 'cancelado' | 'ausente';
export type TypeConsulta = 'presencial' | 'teleconsulta' | 'outro'

const typeMap: Record<number, TypeConsulta> = {
  1: "presencial",
  2: "teleconsulta",
  3: "outro"
};

const statusMap: Record<number, StatusConsulta> = {
  1: "agendado",
  2: "esperando_pagamento",
  3: "esperando_confirmacao",
  4: "confirmado",
  5: "em_atendimento",
  6: "finalizado",
  7: "cancelado",
  8: "ausente",
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
}

export interface IConsultaSimplified{
  id: string;
  patientNome: string;
  healthInsurance: string; //Ex. Unimed, MedSenior e etc
  status: StatusConsulta;
  type: TypeConsulta;
}


export interface ITeleConsultaDetailed extends IConsultaDetailed {
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