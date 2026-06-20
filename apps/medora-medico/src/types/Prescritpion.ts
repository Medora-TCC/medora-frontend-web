export type ViaAdministracao = "oral" | "sublingual" | "topica" | "injetavel" | "inalatoria";

export type FrequenciaUso =
  | "1x_dia"
  | "2x_dia"
  | "3x_dia"
  | "4x_dia"
  | "6_6h"
  | "8_8h"
  | "12_12h"
  | "uso_continuo"
  | "se_necessario";

export type DuracaoTratamento = "continuo" | "7d" | "14d" | "30d" | "outro";

export interface Paciente {
  id: string;
  nome: string;
  dataNascimento: string;
  cpf: string;
  peso?: number;
  altura?: number;
  convenio?: string;
  medicamentosEmUso: string[];
}

export interface Medicamento {
  id: string;
  nomeComercial?: string;
  principioAtivo: string;
  concentracao: string;
  formaFarmaceutica: string;
  tipo: "referencia" | "generico" | "similar";
  classe: string; 
  interacoes: string[];
  restricoes: string[]; 
}

export interface ItemPrescricao {
  id: string;
  medicamento: Medicamento;
  dose: string;
  via: ViaAdministracao;
  frequencia: FrequenciaUso;
  horario?: string;
  quantidade: number;
  duracao: DuracaoTratamento;
  duracaoCustomDias?: number;
  orientacoes: string;
}

export interface PrescricaoRascunho {
  paciente: Paciente | null;
  itens: ItemPrescricao[];
  observacoesGerais: string;
}

export type EtapaWizard = "medicamentos" | "posologia" | "revisao";

export interface WizardState {
  etapaAtual: EtapaWizard;
  etapasCompletas: EtapaWizard[];
  rascunho: PrescricaoRascunho;
  itemEmEdicao: ItemPrescricao | null;
}

export const LABEL_VIA: Record<ViaAdministracao, string> = {
  oral: "Via oral (VO)",
  sublingual: "Sublingual",
  topica: "Tópica",
  injetavel: "Injetável",
  inalatoria: "Inalatória",
};

export const LABEL_FREQUENCIA: Record<FrequenciaUso, string> = {
  "1x_dia": "1x ao dia",
  "2x_dia": "2x ao dia",
  "3x_dia": "3x ao dia",
  "4x_dia": "4x ao dia",
  "6_6h": "De 6 em 6 horas",
  "8_8h": "De 8 em 8 horas",
  "12_12h": "De 12 em 12 horas",
  uso_continuo: "Uso contínuo",
  se_necessario: "Se necessário (SN)",
};

export const LABEL_DURACAO: Record<DuracaoTratamento, string> = {
  continuo: "Uso contínuo",
  "7d": "7 dias",
  "14d": "14 dias",
  "30d": "30 dias",
  outro: "Outro (especificar)",
};