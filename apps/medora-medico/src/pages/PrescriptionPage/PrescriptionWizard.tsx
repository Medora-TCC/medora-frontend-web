import { ArrowRight } from "lucide-react";
import type { Paciente } from "../../types/Prescritpion";
import PrescriptionsService, { type IssuedPrescription } from "../../api/services/Prescriptions";
import { errorMessage } from "../../api/errors";
import { textoDaReceita } from "./prescriptionText";
import { ReceitaEmitida } from "./ReceitaEmitida";
import { WizardProgressBar } from "./WizardProgressBar";
import { StepMedication } from "./Steps/StepMedication";
import { StepDosage } from "./Steps/StepDosage";
import { StepRevision } from "./Steps/StepRevision";
import { PrescriptionSidebar } from "./PrescriptionSidebar";
import { usePrescriptionWizard } from "../../hooks/usePrescriptionWizard";
import { useState } from "react";
import { ModalCarregamento } from "@medora_web/shared";

function iniciais(nome: string): string {
  return nome.replace(/^Dra?\.\s*/, "").split(" ").slice(0, 2).map((n) => n[0]).join("");
}

// A consulta só traz o nome do paciente; os demais dados ficam vazios
function pacienteDaConsulta(nome: string): Paciente {
  return { id: "", nome, dataNascimento: "", cpf: "", medicamentosEmUso: [] };
}


export interface MedicoPrescritor {
  nome: string;
  especialidade?: string;
}

// A receita simples vale 30 dias
const VALIDADE_DIAS = 30;

interface Props {
  medicalRecordId: number;
  medico: MedicoPrescritor;
  patientName?: string;
  onCancelar?: () => void;
}

export function PrescricaoWizard({ medicalRecordId, medico, patientName, onCancelar }: Props) {
  const wizard = usePrescriptionWizard();
  const { state } = wizard;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);
  const [emitida, setEmitida] = useState<{ receita: IssuedPrescription; pdfUrl: string | null } | null>(null);

  const rascunhoComPaciente = {
    ...state.rascunho,
    paciente: state.rascunho.paciente ?? (patientName ? pacienteDaConsulta(patientName) : null),
  };

  async function handleEmitir() {
    setIsLoading(true);
    setErro(null);
    try {
      const receita = await PrescriptionsService.issue(medicalRecordId, textoDaReceita(state.rascunho), VALIDADE_DIAS);
      const pdf = await PrescriptionsService.getPdf(receita.publicId).catch(() => null);
      setEmitida({ receita, pdfUrl: pdf?.downloadUrl ?? null });
    } catch (err) {
      setErro(errorMessage(err, "Erro ao emitir a receita."));
    } finally {
      setIsLoading(false);
    }
  }

  async function abrirPdf() {
    if (!emitida) return;
    // o link do MinIO expira em 5 minutos, então busca um novo a cada clique
    const pdf = await PrescriptionsService.getPdf(emitida.receita.publicId).catch(() => null);
    const url = pdf?.downloadUrl ?? emitida.pdfUrl;
    if (url) window.open(url, "_blank", "noopener");
  }

  if (emitida) {
    return (
      <ReceitaEmitida
        secretCode={emitida.receita.secretCode}
        temPdf={emitida.pdfUrl !== null}
        onAbrirPdf={abrirPdf}
        onVoltar={onCancelar}
      />
    );
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
            {iniciais(medico.nome)}
          </div>
          <div>
            <p className="text-sm font-medium leading-none text-text-primary">
              {medico.nome}
            </p>
            {medico.especialidade && (
              <p className="text-xs text-text-muted">{medico.especialidade}</p>
            )}
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
              medico={medico}
              onEmitir={handleEmitir}
              emitindo={isLoading}
              erro={erro}
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