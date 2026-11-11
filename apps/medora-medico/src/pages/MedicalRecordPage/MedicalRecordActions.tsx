import { useState, type JSX } from "react";
import { Button, Spinner } from "@heroui/react";
import { FileDown, Save } from "lucide-react";
import type { SignatureStatus, SigningMode } from "../../api/services/MedicalRecords";
import type { MedicalRecordController, SaveState } from "../../hooks/useMedicalRecord";
import { SigningModeModal } from "../../components/SigningModeModal/SigningModeModal";

const timeFormat = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

/** Status de salvamento + ações do prontuário; usado na página e no painel da teleconsulta. */
export function MedicalRecordActions({ controller }: { controller: MedicalRecordController }): JSX.Element {
  const [isSigningModalOpen, setIsSigningModalOpen] = useState(false);
  const { mode, saveState, canFinalize, finalize, saveDraft, openPdf, isOpeningPdf, signatureStatus } =
    controller;

  return (
    <div className="flex shrink-0 items-center gap-3">
      <SaveIndicator state={saveState} />

      {mode === "editing" && (
        <>
          <Button size="sm" variant="secondary" onPress={saveDraft} aria-keyshortcuts="Control+S Meta+S">
            <Save />
            <span className="hidden sm:inline">Salvar rascunho</span>
          </Button>
          <Button size="sm" isDisabled={!canFinalize} onPress={() => setIsSigningModalOpen(true)}>
            Finalizar atendimento
          </Button>
          <SigningModeModal
            isOpen={isSigningModalOpen}
            onConfirm={(signingMode: SigningMode) => {
              setIsSigningModalOpen(false);
              void finalize(signingMode);
            }}
            onCancel={() => setIsSigningModalOpen(false)}
            texto="Deseja finalizar o atendimento? Depois de finalizado o prontuário não pode mais ser alterado."
          />
        </>
      )}

      {mode === "finalized" && (
        <PdfButton status={signatureStatus} isOpening={isOpeningPdf} onOpen={openPdf} />
      )}
    </div>
  );
}

function SaveIndicator({ state }: { state: SaveState }): JSX.Element {
  let content: React.ReactNode = null;
  switch (state.kind) {
    case "saving":
      content = (
        <span className="inline-flex items-center gap-1.5 text-text-secondary">
          <Spinner size="sm" />
          Salvando…
        </span>
      );
      break;
    case "saved":
      content = <span className="text-text-secondary">Salvo às {timeFormat.format(state.at)}</span>;
      break;
    case "error":
      content = (
        <span className="font-semibold text-danger" title={state.message}>
          Não salvo. Tentaremos de novo na próxima alteração
        </span>
      );
      break;
  }

  return (
    <div aria-live="polite" className="hidden min-w-28 justify-end text-sm tabular-nums sm:flex">
      {content}
    </div>
  );
}

function PdfButton({
  status,
  isOpening,
  onOpen,
}: {
  status: SignatureStatus | null;
  isOpening: boolean;
  onOpen: () => void;
}): JSX.Element {
  const note =
    status === "Signed" || status === null ? null : status === "AwaitingDoctor" ? (
      <span className="hidden text-sm text-text-secondary lg:inline">Aguardando sua assinatura em Assinar Documentos.</span>
    ) : status === "Failed" ? (
      <span className="hidden text-sm text-danger lg:inline">Assinatura falhou: o PDF sai sem assinatura.</span>
    ) : (
      <span className="hidden items-center gap-2 text-sm text-text-secondary lg:flex">
        <Spinner size="sm" />
        Assinando… o PDF sai sem assinatura por enquanto.
      </span>
    );

  return (
    <div className="flex items-center gap-3">
      {note}
      <Button size="sm" variant="primary" onPress={onOpen} isDisabled={isOpening}>
        <FileDown />
        Baixar PDF
      </Button>
    </div>
  );
}