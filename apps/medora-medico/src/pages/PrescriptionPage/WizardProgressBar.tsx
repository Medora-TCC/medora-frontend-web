import { Check } from "lucide-react";
import type { EtapaWizard } from "./Prescritpion";

interface Etapa {
  id: EtapaWizard;
  label: string;
  descricao: string;
}

const ETAPAS: Etapa[] = [
  { id: "tipo",          label: "Tipo de receita", descricao: "Simples, especial ou antimicrobiano" },
  { id: "medicamentos",  label: "Medicamentos",    descricao: "Busca e seleção" },
  { id: "posologia",     label: "Posologia",       descricao: "Dose, frequência e orientações" },
  { id: "revisao",       label: "Revisão",         descricao: "Confirmar e emitir" },
];

interface Props {
  etapaAtual: EtapaWizard;
  etapasCompletas: EtapaWizard[];
  onNavegar?: (etapa: EtapaWizard) => void;
}

export function WizardProgressBar({ etapaAtual, etapasCompletas, onNavegar }: Props) {
  return (
    <div className="flex items-start gap-0 px-6 py-4 border-b border-gray-100 bg-gray-50">
      {ETAPAS.map((etapa, idx) => {
        const completa = etapasCompletas.includes(etapa.id);
        const ativa = etapa.id === etapaAtual;
        const navegavel = completa && onNavegar;

        return (
          <div key={etapa.id} className="flex items-start flex-1">
            <div className="flex flex-col items-center flex-1">
              <button
                onClick={() => navegavel && onNavegar(etapa.id)}
                disabled={!navegavel}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  transition-colors duration-150 mb-2
                  ${ativa
                    ? "bg-blue-900 text-white"
                    : completa
                    ? "bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer"
                    : "bg-white border border-gray-200 text-gray-400 cursor-default"
                  }
                `}
                aria-current={ativa ? "step" : undefined}
              >
                {completa && !ativa ? (
                  <Check size={14} strokeWidth={2.5} />
                ) : (
                  idx + 1
                )}
              </button>

              <span
                className={`text-xs font-medium text-center leading-tight ${
                  ativa ? "text-blue-900" : completa ? "text-gray-600" : "text-gray-400"
                }`}
              >
                {etapa.label}
              </span>
              <span className="text-xs text-gray-400 text-center leading-tight hidden sm:block">
                {etapa.descricao}
              </span>
            </div>

            {idx < ETAPAS.length - 1 && (
              <div
                className={`h-px w-full mt-4 transition-colors duration-300 ${
                  completa ? "bg-green-400" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}