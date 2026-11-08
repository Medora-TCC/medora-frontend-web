import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { DocsList } from "./DocsList";
import { Modal, Spinner } from "@heroui/react";
import { ModalCarregamento, ModalConfirmacao } from "@medora_web/shared";
import { CircleCheck, CircleX, TriangleAlert } from "lucide-react";
import SignaturesService, { type DoctorSignature } from "../../api/services/Signatures";
import MedicalRecordsService from "../../api/services/MedicalRecords";
import PrescriptionsService from "../../api/services/Prescriptions";
import { errorMessage } from "../../api/errors";

const PDFViewer = lazy(() => import("./PDFViewer"));

const POLL_INTERVAL_MS = 15000;

export function SignaturePage() {
  const [docs, setDocs] = useState<DoctorSignature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSucesso, setIsSucesso] = useState<boolean | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [selecionadoId, setSelecionadoId] = useState<number | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [documensoFora, setDocumensoFora] = useState(false);
  const pdfRequest = useRef(0);

  const selecionado = docs.find((d) => d.signatureId === selecionadoId) ?? null;
  const temEmAndamento = docs.some((d) => d.status === "Pending" || d.status === "Submitted");

  // silent: recargas em segundo plano não abrem modal de erro
  const carregar = useCallback(async (silent = false) => {
    try {
      setDocs(await SignaturesService.listMine());
    } catch (err) {
      if (silent) return;
      setMensagem(errorMessage(err, "Erro ao carregar os documentos para assinar."));
      setIsSucesso(false);
    }
  }, []);

  useEffect(() => {
    carregar(false);
    SignaturesService.health()
      .then((h) => setDocumensoFora(h.state !== "Healthy"))
      .catch(() => {});
  }, [carregar]);

  useEffect(() => {
    if (!temEmAndamento) return;
    const id = setInterval(() => carregar(true), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [temEmAndamento, carregar]);

  // Se o documento selecionado saiu da lista (ex.: foi assinado), limpa a seleção
  useEffect(() => {
    if (selecionadoId !== null && !selecionado) {
      pdfRequest.current++;
      setSelecionadoId(null);
      setPdfUrl(null);
    }
  }, [selecionadoId, selecionado]);

  const selecionar = async (doc: DoctorSignature) => {
    setSelecionadoId(doc.signatureId);
    setPdfUrl(null);
    const request = ++pdfRequest.current;
    try {
      if (doc.documentKind === "Prescription" && !doc.prescriptionPublicId) {
        throw new Error("Receita sem identificador. Não foi possível abrir o PDF.");
      }
      const pdf =
        doc.documentKind === "Prescription"
          ? await PrescriptionsService.getPdf(doc.prescriptionPublicId!)
          : await MedicalRecordsService.getPdf(doc.medicalRecordId);
      if (request === pdfRequest.current) setPdfUrl(pdf.downloadUrl);
    } catch (err) {
      if (request !== pdfRequest.current) return;
      setMensagem(errorMessage(err, "Erro ao buscar o PDF do documento."));
      setIsSucesso(false);
    }
  };

  const executar = async (acao: (id: number) => Promise<unknown>, sucesso: string, falha: string) => {
    if (!selecionado) return;
    setIsLoading(true);
    try {
      await acao(selecionado.signatureId);
      setMensagem(sucesso);
      setIsSucesso(true);
      pdfRequest.current++;
      setSelecionadoId(null);
      setPdfUrl(null);
    } catch (err) {
      setMensagem(errorMessage(err, falha));
      setIsSucesso(false);
    } finally {
      setIsLoading(false);
    }
    await carregar(true);
  };

  const assinarDocumento = () =>
    executar(SignaturesService.authorize, "Documento enviado para assinatura", "Erro ao assinar o documento");
  const tentarDeNovo = () =>
    executar(SignaturesService.retry, "Documento reenviado para assinatura", "Erro ao tentar assinar de novo");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="shrink-0 py-4 border-b border-divider">
        <h1 className="text-text-primary text-xl font-semibold text-center">
          Assinatura
        </h1>
      </header>

      {documensoFora && (
        <div className="shrink-0 flex items-center justify-center gap-2 bg-warning-50 text-warning-700 px-4 py-2 text-sm">
          <TriangleAlert size={16} />
          A Documenso está fora do ar. O documento vai ser assinado quando o serviço voltar.
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[40%] shrink-0 overflow-y-auto border-r border-divider p-4">
          <DocsList
            docs={docs}
            selecionadoId={selecionadoId}
            onSelect={selecionar}
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
              <PDFViewer documentUrl={pdfUrl} />
            </Suspense>
          </div>

          <div className="shrink-0 flex justify-end px-8 py-4 border-t border-divider">
            {selecionado?.status === "AwaitingDoctor" && (
              <ModalConfirmacao
                onConfirm={assinarDocumento}
                disabled={isLoading}
                texto="Deseja assinar o documento?"
                textoBotao="Assinar"
              />
            )}
            {selecionado?.status === "Failed" && (
              <ModalConfirmacao
                onConfirm={tentarDeNovo}
                disabled={isLoading}
                texto="Deseja tentar assinar de novo?"
                textoBotao="Tentar de novo"
              />
            )}
          </div>

          <ModalCarregamento isLoading={isLoading} texto="Enviando documento"/>

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
                        <span>{mensagem}</span>
                      </div>
                    ) : (
                      <div className="text-danger font-semibold text-lg text-center items-center flex flex-col gap-4">
                        <CircleX size={56} className="mx-auto" />
                        <span>{mensagem}</span>
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
