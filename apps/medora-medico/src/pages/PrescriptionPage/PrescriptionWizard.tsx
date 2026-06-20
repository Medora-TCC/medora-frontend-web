import { ArrowRight } from "lucide-react";
import type { Paciente } from "../../types/Prescritpion";
import { WizardProgressBar } from "./WizardProgressBar";
import { StepMedication } from "./Steps/StepMedication";
import { StepDosage } from "./Steps/StepDosage";
import { StepRevision } from "./Steps/StepRevision";
import { PrescriptionSidebar } from "./PrescriptionSidebar";
import { usePrescriptionWizard } from "../../hooks/usePrescriptionWizard";
import { useState } from "react";
import { useNavigate } from "react-router";
import { ModalCarregamento } from "@medora_web/shared";


const MEDICO_MOCK = {
  id: "doc1",
  nome: "Carlos Eduardo Menezes",
  crm: "52840",
  especialidade: "Clínica Geral",
  uf: "PR",
};

const PACIENTE_MOCK: Paciente = {
  id: "pac1",
  nome: "Ana Paula Rodrigues",
  dataNascimento: "1980-03-14",
  cpf: "***.456.789-**",
  peso: 68,
  altura: 165,
  convenio: "Unimed Gold",
  medicamentosEmUso: [],
};

interface Props {
  onConcluir?: (rascunho: ReturnType<typeof usePrescriptionWizard>["state"]["rascunho"]) => void;
  onCancelar?: () => void;
}

export function PrescricaoWizard({ onConcluir, onCancelar }: Props) {
  const wizard = usePrescriptionWizard();
  const { state } = wizard;
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Injeta o paciente mock — em produção vem de props ou contexto
  const rascunhoComPaciente = {
    ...state.rascunho,
    paciente: state.rascunho.paciente ?? PACIENTE_MOCK,
  };

  async function handleEmitir() {
    setIsLoading(true);
    onConcluir?.(rascunhoComPaciente);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    navigate("/medico/assinatura");
  }

  const ETAPA_IDX = ["medicamentos", "posologia", "revisao"].indexOf(state.etapaAtual) + 1;

  return (
    <div
      className="bg-surface my-auto flex flex-col w-full max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-sm border border-border"
    >
      <header
        className="flex items-center justify-between px-6 py-3 border-b border-border"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center bg-primary-color text-text-inverse"
          >
            {MEDICO_MOCK.nome.split(" ").slice(0, 2).map((n) => n[0]).join("")}
          </div>
          <div>
            <p className="text-sm font-medium leading-none text-text-primary">
              Dr. {MEDICO_MOCK.nome}
            </p>
            <p className="text-xs text-text-muted">
              CRM/{MEDICO_MOCK.uf} {MEDICO_MOCK.crm} · {MEDICO_MOCK.especialidade}
            </p>
          </div>
        </div>

        <div className="flex items-center">
          <button
            onClick={onCancelar}
            className="text-xs transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text-secondary)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            Cancelar
          </button>
        </div>
      </header>

      <WizardProgressBar
        etapaAtual={state.etapaAtual}
        etapasCompletas={state.etapasCompletas}
        onNavegar={wizard.irParaEtapa}
      />

      <div className="flex flex-1 min-h-100">
        <main className="flex-1 px-6 py-5 overflow-y-auto">
          {state.etapaAtual === "medicamentos" && (
            <StepMedication
              itensPrescritos={state.rascunho.itens}
              onSelecionarMedicamento={wizard.iniciarEdicaoMedicamento}
              onEditarItem={wizard.editarItem}
              onRemoverItem={wizard.removerItem}
            />
          )}

          {state.etapaAtual === "posologia" && state.itemEmEdicao && (
            <StepDosage
              item={state.itemEmEdicao}
              onChange={wizard.atualizarItemEmEdicao}
              onConfirmar={wizard.confirmarItemPosologia}
              onCancelar={wizard.voltar}
            />
          )}

          {state.etapaAtual === "revisao" && (
            <StepRevision
              rascunho={rascunhoComPaciente}
              medico={MEDICO_MOCK}
              onEmitir={handleEmitir}
              onVoltar={wizard.voltarInicio}
            />
          )}
        </main>

        <PrescriptionSidebar
          paciente={rascunhoComPaciente.paciente}
          itensPrescritos={state.rascunho.itens}
          itemEmEdicao={state.itemEmEdicao}
        />
      </div>

      {state.etapaAtual === "medicamentos" && (
        <footer
          className="flex items-center justify-between px-6 py-3 border-t border-border"
        >
          <span />

          <span className="text-xs text-text-muted">
            Etapa {ETAPA_IDX} de 3
          </span>

          <button
            onClick={wizard.avancarRevisao}
            disabled={!wizard.podeContinuar}
            className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl transition-all active:scale-[0.98] 
                      ${wizard.podeContinuar ? "bg-primary-color text-text-inverse hover:bg-primary-hover cursor-pointer" : "bg-surface-raised text-text-muted cursor-not-allowed"}`}
          >
            Ir para revisão
            <ArrowRight size={15} />
          </button>
        </footer>
      )}
      <ModalCarregamento isLoading={isLoading} texto="Gerando prescrição"/>
    </div>
  );
}