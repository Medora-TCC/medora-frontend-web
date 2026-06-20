import { lazy, Suspense, useState } from "react";
import { DocsList } from "./DocsList";
import { Modal, Spinner } from "@heroui/react";
import { ModalCarregamento, ModalConfirmacao } from "@medora_web/shared";
import { CircleCheck, CircleX } from "lucide-react";

const PDFViewer = lazy(() => import("./PDFViewer"));

var MOCK_DOCS = [
  {
    id: "1",
    type: "Prescrição médica",
    status: "pending" as const,
    patient: "Joãozinho da Silva",
    date: "14/06/2026",
    path: "/TesteReceita.pdf",
  },
];

export function SignaturePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSucesso, setIsSucesso] = useState<boolean | null>(null);
  const [documentoSelecionado, setDocumentoSelecionado] = useState<
    string | null
  >(null);

  const assinarDocumento = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    setIsSucesso(true);

    MOCK_DOCS.pop();
    setDocumentoSelecionado(null)

  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="shrink-0 py-4 border-b border-divider">
        <h1 className="text-text-primary text-xl font-semibold text-center">
          Assinatura
        </h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[40%] shrink-0 overflow-y-auto border-r border-divider p-4">
          <DocsList
            docs={MOCK_DOCS}
            setDocumentoSelecionado={setDocumentoSelecionado}
          />
        </aside>

        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <div className="flex-1 overflow-y-auto">
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center">
                  <Spinner size="md" />
                </div>
              }
            >
              <PDFViewer documentUrl={documentoSelecionado} />
            </Suspense>
          </div>

          <div className="shrink-0 flex justify-end px-8 py-4 border-t border-divider">
            <ModalConfirmacao
              onConfirm={assinarDocumento}
              disabled={isLoading}
              texto="Deseja assinar o documento?"
              textoBotao="Assinar"
            />
          </div>

          <ModalCarregamento isLoading={isLoading} />
          
          <Modal>
            <Modal.Backdrop
              isOpen={isSucesso != null}
              onOpenChange={(isOpen) => {
                if (!isOpen) {
                  setIsSucesso(null);
                }
              }}
              variant="opaque"
            >
              <Modal.Container>
                <Modal.Dialog aria-label={`${isSucesso ? "Sucesso" : "Erro"}`}>
                  <Modal.CloseTrigger />
                  <Modal.Body className="flex flex-col items-center justify-center gap-3 py-8">
                    {isSucesso ? (
                      <div className="text-success font-semibold text-lg text-center items-center flex flex-col gap-4">
                        <CircleCheck size={56} className="mx-auto" />
                        <span>Documento assinado com sucesso</span>
                      </div>
                    ) : (
                      <div className="text-danger font-semibold text-lg text-center items-center flex flex-col gap-4">
                        <CircleX size={56} className="mx-auto" />
                        <span>Erro ao assinar o documento</span>
                      </div>
                    )}
                  </Modal.Body>
                </Modal.Dialog>
              </Modal.Container>
            </Modal.Backdrop>
          </Modal>
        </div>
      </div>
    </div>
  );
}
