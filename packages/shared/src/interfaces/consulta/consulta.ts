export type StatusConsulta = 'agendado' | 'em_espera' | 'em_atendimento' | 'finalizado' | 'cancelado';

export interface IConsulta {
  id: string;
  pacienteId: string;
  pacienteNome: string;
  medicoId: string;
  dataHorario: string;
  status: StatusConsulta;
  observacoes?: string;
  tags?: string[];
}

export interface IConsultaDetalhada extends IConsulta {
  prescricaoId?: string;
  historicoPaciente?: string;
}

export interface ITeleConsulta extends IConsulta {
   salaVirtualUrl?: string;
}
