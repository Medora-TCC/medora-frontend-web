export type StatusConsulta = 'agendado' | 'em_espera' | 'em_atendimento' | 'finalizado' | 'cancelado';
export type TypeConsulta = 'presencial' | 'teleconsulta'

export interface IConsultaDetailed {
  id: string;
  doctorName: string;
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
  doctorName: string;
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