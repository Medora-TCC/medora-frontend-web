export type StatusConsulta = 'agendado' | 'em_espera' | 'em_atendimento' | 'finalizado' | 'cancelado';

export interface IConsultaDetailed {
  id: string;
  pacienteId: string;
  pacienteNome: string;
  medicoId: string;
  dataHorario: string;
  status: StatusConsulta;
  observacoes?: string;
  tags?: string[];
}

export interface IConsultaSimplified{
  id: string;
  pacienteId: string;
  pacienteNome: string;
  medicoId: string;
  dataHorario: string;
  status: StatusConsulta;
  observacoes?: string;
  tags?: string[];
}


export interface ITeleConsultaDetailed extends IConsultaDetailed {
   salaVirtualUrl?: string;
}
