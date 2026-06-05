import { FileText, FileLock2, Pill, ShieldAlert } from "lucide-react";
import { type TipoReceita, LABEL_TIPO_RECEITA } from "./Prescritpion";

interface OpcaoReceita {
  tipo: TipoReceita;
  icone: React.ReactNode;
  descricao: string;
  observacao?: string;
  cor: string; 
}

const OPCOES: OpcaoReceita[] = [
  {
    tipo: "simples",
    icone: <FileText size={22} />,
    descricao: "Medicamentos comuns sem restrição especial de controle.",
    cor: "border-blue-600 bg-blue-50 text-blue-700",
  },
  {
    tipo: "especial_c1",
    icone: <FileLock2 size={22} />,
    descricao: "Psicotrópicos e substâncias sujeitas a controle especial (lista C1).",
    observacao: "Requer duas vias — uma fica retida na farmácia.",
    cor: "border-amber-500 bg-amber-50 text-amber-700",
  },
  {
    tipo: "especial_c2",
    icone: <ShieldAlert size={22} />,
    descricao: "Retinoides de uso sistêmico e talidomida (lista C2).",
    observacao: "Paciente deve assinar Termo de Consentimento.",
    cor: "border-orange-600 bg-orange-50 text-orange-700",
  },
  {
    tipo: "antimicrobiano",
    icone: <Pill size={22} />,
    descricao: "Antibióticos, antifúngicos e antiparasitários sujeitos à RDC 471/2021.",
    observacao: "Validade de 10 dias. Farmácia retém uma via.",
    cor: "border-teal-600 bg-teal-50 text-teal-700",
  },
];

interface Props {
  selecionado: TipoReceita | null;
  onChange: (tipo: TipoReceita) => void;
}

export function StepRecipeType({ selecionado, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-medium text-gray-900">Tipo de receituário</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Selecione conforme a classe do medicamento que será prescrito.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {OPCOES.map(({ tipo, icone, descricao, observacao, cor }) => {
          const ativo = selecionado === tipo;
          return (
            <button
              key={tipo}
              onClick={() => onChange(tipo)}
              className={`
                flex items-start gap-3 p-4 rounded-xl border text-left
                transition-all duration-150
                ${ativo
                  ? `${cor} border-2`
                  : "border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                }
              `}
            >
              <span className={`mt-0.5 shrink-0 ${ativo ? "" : "text-gray-400"}`}>
                {icone}
              </span>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">
                  {LABEL_TIPO_RECEITA[tipo]}
                </span>
                <span className={`text-xs leading-snug ${ativo ? "opacity-80" : "text-gray-500"}`}>
                  {descricao}
                </span>
                {observacao && (
                  <span className={`text-xs font-medium mt-1 ${ativo ? "opacity-90" : "text-gray-400"}`}>
                    ⓘ {observacao}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}