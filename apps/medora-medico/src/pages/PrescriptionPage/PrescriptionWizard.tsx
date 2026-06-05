import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Paciente } from "./Prescritpion";
import { WizardProgressBar } from "./WizardProgressBar";
import { StepRecipeType } from "./StepRecipeType";
import { StepMedication } from "./StepMedication";
import { StepDosage } from "./StepDosage";
import { StepRevision } from "./StepRevision";
import { PrescriptionSidebar } from "./PrescriptionSidebar";
import { usePrescriptionWizard } from "./usePrescriptionWizard";


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

  const rascunhoComPaciente = {
    ...state.rascunho,
    paciente: state.rascunho.paciente ?? PACIENTE_MOCK,
  };

  function handleEmitir() {
    onConcluir?.(rascunhoComPaciente);
    alert("Receituário emitido com sucesso! (mock)");
  }

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto border border-gray-200
                    rounded-2xl bg-white overflow-hidden shadow-sm">


      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
        <button
          onClick={onCancelar}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Cancelar prescrição
        </button>
      </header>

      <WizardProgressBar
        etapaAtual={state.etapaAtual}
        etapasCompletas={state.etapasCompletas}
        onNavegar={wizard.irParaEtapa}
      />

      <div className="flex flex-1 min-h-100">
        <main className="flex-1 px-6 py-5 overflow-y-auto">
          {state.etapaAtual === "tipo" && (
            <StepRecipeType
              selecionado={state.rascunho.tipoReceita}
              onChange={wizard.definirTipoReceita}
            />
          )}

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
              onVoltar={wizard.voltar}
            />
          )}
        </main>

        <PrescriptionSidebar
          paciente={rascunhoComPaciente.paciente}
          tipoReceita={state.rascunho.tipoReceita}
          itensPrescritos={state.rascunho.itens}
          itemEmEdicao={state.itemEmEdicao}
        />
      </div>

      {state.etapaAtual !== "posologia" && state.etapaAtual !== "revisao" && (
        <footer className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
          <button
            onClick={wizard.voltar}
            disabled={state.etapaAtual === "tipo"}
            className="flex items-center gap-1.5 text-sm text-gray-500
                       hover:text-gray-700 disabled:opacity-30 transition-colors"
          >
            <ArrowLeft size={15} />
            Voltar
          </button>

          <span className="text-xs text-gray-400">
            Etapa {["tipo", "medicamentos", "posologia", "revisao"].indexOf(state.etapaAtual) + 1} de 4
          </span>

          <button
            onClick={state.etapaAtual === "tipo" ? wizard.avancar : wizard.avancarRevisao}
            disabled={!wizard.podeContinuar}
            className={`
              flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg
              transition-all active:scale-[0.98]
              ${wizard.podeContinuar
                ? "bg-blue-900 text-white hover:bg-blue-800"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            {state.etapaAtual === "medicamentos" ? "Ir para revisão" : "Próximo"}
            <ArrowRight size={15} />
          </button>
        </footer>
      )}
    </div>
  );
}