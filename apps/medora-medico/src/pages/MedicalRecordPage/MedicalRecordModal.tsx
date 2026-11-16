import { Button, Chip, Modal, Spinner } from "@heroui/react";
import { useEffect, useRef, useState, type JSX, type ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import type { MedicalRecordDTO } from "../../api/dtos/MedicalRecord/MedicalRecordDTO";
import MedicalRecordsService, {
  type MedicalRecordPdf,
  type SignatureStatus,
} from "../../api/services/MedicalRecords";
import { MedicalRecordViewer } from "../../components/RichTextEditor/RichTextEditor";
import PDFViewer from "../../components/PDF/PDFViewer";

const URL_STALE_AFTER_MS = 4 * 60 * 1000;

export function formatRecordDate(value: Date | string | null | undefined): string {
  if (!value) return "Data indisponível";
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? "Data indisponível" : d.toLocaleDateString("pt-BR");
}

const signatureBadge: Partial<
  Record<SignatureStatus, { label: string; color: "success" | "warning" | "danger" }>
> = {
  Signed: { label: "Assinado", color: "success" },
  AwaitingDoctor: { label: "Assinatura pendente", color: "warning" },
  Pending: { label: "Assinatura pendente", color: "warning" },
  Submitted: { label: "Assinatura pendente", color: "warning" },
  Failed: { label: "Falha na assinatura", color: "danger" },
};

type Mode = "loading" | "pdf" | "raw";

interface MedicalRecordModalProps {
  medicalRecord: MedicalRecordDTO;
  children: ReactNode;
}

function MedicalRecordContent({ medicalRecord }: { medicalRecord: MedicalRecordDTO }): JSX.Element {
  const [mode, setMode] = useState<Mode>("loading");
  const [pdf, setPdf] = useState<MedicalRecordPdf | null>(null);
  const [attempt, setAttempt] = useState(0);
  const loadedAt = useRef(0);
  
  useEffect(() => {
    let active = true;
    setMode("loading");

    MedicalRecordsService.getPdf(medicalRecord.id)
      .then((res) => {
        if (!active) return;
        if (res.downloadUrl) {
          loadedAt.current = Date.now();
          setPdf(res);
          setMode("pdf");
        } else {
          setMode("raw"); // PDF ainda não disponível
        }
      })
      .catch((e: unknown) => {
        console.error(e);
        if (active) setMode("raw");
      });

      return () => {
      active = false;
    };
  }, [medicalRecord.id, attempt]);

  const openInNewTab = () => {
    if (!pdf?.downloadUrl) return;
    if (Date.now() - loadedAt.current > URL_STALE_AFTER_MS) {
      setAttempt((n) => n + 1);
      return;
    }
    window.open(pdf.downloadUrl, "_blank", "noopener,noreferrer");
  };

  if (mode === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-text-muted" role="status">
        <Spinner size="sm" />
        Carregando prontuário
      </div>
    );
  }

  if (mode === "pdf" && pdf?.downloadUrl) {
    const badge = signatureBadge[pdf.signatureStatus];

    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          {badge ? (
            <Chip size="sm" color={badge.color} variant="soft">
              {badge.label}
            </Chip>
          ) : (
            <span />
          )}
          <Button size="sm" variant="outline" onPress={openInNewTab}>
            <ExternalLink size={16} />
            Abrir em nova aba
          </Button>
        </div>

        <PDFViewer
          documentUrl={pdf.downloadUrl}
          className="min-h-0 rounded-md"
          onError={() => setMode("raw")}
        />
      </div>
    );
  }

  // Fallback: formato original (conteúdo do editor).
  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex items-center justify-between gap-2 rounded-md bg-surface-secondary px-3 py-2 text-xs text-fg-muted"
        role="status"
      >
        <span>Não foi possível exibir o PDF. Mostrando o conteúdo do prontuário.</span>
        <Button size="sm" variant="ghost" onPress={() => setAttempt((n) => n + 1)}>
          Tentar de novo
        </Button>
      </div>
      <MedicalRecordViewer json={medicalRecord.jsonContent} />
    </div>
  );
}

export function MedicalRecordModal({ medicalRecord, children }: MedicalRecordModalProps): JSX.Element {
  return (
    <Modal>
      <Button
        variant="ghost"
        className="h-auto min-h-0 w-full justify-start rounded-md px-2 py-1.5 text-left"
        aria-label={`Abrir consulta de ${formatRecordDate(medicalRecord.dateCreated)}`}
      >
        {children}
      </Button>
      <Modal.Backdrop variant="opaque">
        <Modal.Container>
          <Modal.Dialog className="h-[90%] max-h-none w-[80%] max-w-none">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="w-full text-center">
                <p className="font-semibold text-muted">{formatRecordDate(medicalRecord.dateCreated)}</p>
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <MedicalRecordContent medicalRecord={medicalRecord} />
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}