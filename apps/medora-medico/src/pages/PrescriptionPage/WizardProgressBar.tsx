import { Check } from "lucide-react";
import type { EtapaWizard } from "../../types/Prescritpion";

interface Etapa {
  id: EtapaWizard;
  label: string;
  descricao: string;
}

const ETAPAS: Etapa[] = [
  { id: "medicamentos", label: "Medicamentos", descricao: "Busca e seleção" },
  { id: "posologia", label: "Posologia", descricao: "Dose, frequência e orientações" },
  { id: "revisao", label: "Revisão", descricao: "Confirmar e emitir" },
];

interface Props {
  etapaAtual: EtapaWizard;
  etapasCompletas: EtapaWizard[];
  onNavegar?: (etapa: EtapaWizard) => void;
}

export function WizardProgressBar({ etapaAtual, etapasCompletas, onNavegar }: Props) {
  return (
    <div
      className="bg-surface-alt border-border flex items-start gap-0 px-6 py-4 border-b"
    >
      {ETAPAS.map((etapa, idx) => {
        const completa = etapasCompletas.includes(etapa.id);
        const ativa = etapa.id === etapaAtual;
        const navegavel = completa && !!onNavegar;

        return (
          <div key={etapa.id} className="flex items-start flex-1">
            <div className="flex flex-col items-center flex-1">
              <button
                onClick={() => navegavel && onNavegar!(etapa.id)}
                disabled={!navegavel}
                aria-current={ativa ? "step" : undefined}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2 transition-colors duration-150 
                  ${ativa ? "bg-primary-color text-text-inverse"
                    : completa
                      ? "bg-success-subtle text-success-text cursor-pointer"
                      : "bg-surface border border-border text-text-muted cursor-default"
                  }`}
              >
                {completa && !ativa ? <Check size={14} strokeWidth={2.5} /> : idx + 1}
              </button>

              <span
                className={`text-xs font-medium text-center leading-tight 
                  ${ativa ? "text-primary-color"
                    : completa
                      ? "text-text-secondary"
                      : "text-text-muted"
                  }`}
              >
                {etapa.label}
              </span>
              <span
                className="text-xs text-text-muted text-center leading-tight hidden sm:block"
              >
                {etapa.descricao}
              </span>
            </div>

            {idx < ETAPAS.length - 1 && (
              <div
              className={`h-px w-full mt-4 transition-colors duration-300 ${completa ? "bg-success" : "bg-border"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
