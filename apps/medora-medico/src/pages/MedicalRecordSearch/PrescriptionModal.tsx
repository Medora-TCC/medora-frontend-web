import { Button, Chip, Modal, Spinner } from "@heroui/react";
import { useEffect, useRef, useState, type JSX } from "react";
import { ExternalLink, Pill } from "lucide-react";
import PrescriptionsService, { type PrescriptionPdf } from "../../api/services/Prescriptions";
import PDFViewer from "../../components/PDF/PDFViewer";
import { errorMessage } from "../../api/errors";

// o link do PDF expira; depois disso o "abrir em nova aba" busca um novo
const URL_STALE_AFTER_MS = 4 * 60 * 1000;

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "pending" }
  | { kind: "ready"; pdf: PrescriptionPdf & { downloadUrl: string } };

function PrescriptionContent({ publicId }: { publicId: string }): JSX.Element {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);
  const loadedAt = useRef(0);

  useEffect(() => {
    let active = true;

    PrescriptionsService.getPdf(publicId)
      .then((pdf) => {
        if (!active) return;
        if (pdf.downloadUrl) {
          loadedAt.current = Date.now();
          setState({ kind: "ready", pdf: { ...pdf, downloadUrl: pdf.downloadUrl } });
        } else {
          setState({ kind: "pending" });
        }
      })
      .catch((err: unknown) => active && setState({ kind: "error", message: errorMessage(err, "Erro ao buscar a receita.") }));

    return () => {
      active = false;
    };
  }, [publicId, attempt]);

  const retry = () => {
    setState({ kind: "loading" });
    setAttempt((n) => n + 1);
  };

  if (state.kind === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-text-muted" role="status">
        <Spinner size="sm" />
        Carregando receita
      </div>
    );
  }

  if (state.kind !== "ready") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-sm text-text-muted" role="status">
        <p>
          {state.kind === "pending"
            ? "A receita ainda está sendo assinada. O PDF aparece aqui assim que a assinatura terminar."
            : state.message}
        </p>
        <Button size="sm" variant="ghost" onPress={retry}>
          Tentar de novo
        </Button>
      </div>
    );
  }

  const openInNewTab = () => {
    if (Date.now() - loadedAt.current > URL_STALE_AFTER_MS) {
      retry();
      return;
    }
    window.open(state.pdf.downloadUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        {state.pdf.signatureStatus === "Signed" ? (
          <Chip size="sm" color="success" variant="soft">
            Assinada
          </Chip>
        ) : (
          <span />
        )}
        <Button size="sm" variant="outline" onPress={openInNewTab}>
          <ExternalLink size={16} />
          Abrir em nova aba
        </Button>
      </div>

      <PDFViewer documentUrl={state.pdf.downloadUrl} className="min-h-0 rounded-md" onError={retry} />
    </div>
  );
}

interface PrescriptionModalProps {
  publicId: string;
  patientName: string;
}

/** Botão "Receita" dos cards da busca: abre o PDF da receita emitida na consulta. */
export function PrescriptionModal({ publicId, patientName }: PrescriptionModalProps): JSX.Element {
  return (
    <Modal>
      <Button size="sm" variant="secondary" className="w-full border border-current" aria-label={`Abrir receita de ${patientName}`}>
        <Pill size={16} />
        Receita
      </Button>
      <Modal.Backdrop variant="opaque">
        <Modal.Container>
          <Modal.Dialog className="h-[90%] max-h-none w-[80%] max-w-none">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="w-full text-center">
                <p className="font-semibold text-muted">Receita de {patientName}</p>
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <PrescriptionContent publicId={publicId} />
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
