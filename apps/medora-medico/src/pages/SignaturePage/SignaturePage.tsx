import { lazy, Suspense, useState } from "react";
import { DocsList } from "./DocsList";
import { Modal, Spinner } from "@heroui/react";
import { ModalConfirmacao } from "@medora_web/shared";

const PDFViewer = lazy(() => import('./PDFViewer'));

const MOCK_DOCS = [
  {
    id: '1',
    type: 'Prescrição médica',
    status: 'pending' as const,
    patient: 'Joãozinho da Silva',
    date: '14/06/2026',
    path: "/TesteReceita.pdf"
  },
];

export function SignaturePage() {

  const [isLoading, setIsLoading] = useState(false);
  const [documentoSelecionado, setDocumentoSelecionado] = useState<string | null>(null);

  const assinarDocumento = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="shrink-0 py-4 border-b border-divider">
        <h1 className="text-text-primary text-xl font-semibold text-center">
          Assinatura
        </h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[40%] shrink-0 overflow-y-auto border-r border-divider p-4">
          <DocsList docs={MOCK_DOCS} setDocumentoSelecionado={setDocumentoSelecionado} />
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
              disabled={false}
              texto="Deseja assinar o documento?"
              textoBotao="Assinar"
            />
          </div>

          <Modal>
            <Modal.Backdrop
              isOpen={isLoading}
              isDismissable={false}
              isKeyboardDismissDisabled
              variant="blur"
            >
              <Modal.Container>
                <Modal.Dialog aria-label="Carregando">
                  <Modal.Body className="flex flex-col items-center justify-center gap-3 py-8">
                    <Spinner />
                    <span>Assinando documento</span>
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