import type { JSX } from "react";
import { useCallback, useEffect, useRef, useState, type JSX } from "react";
import { Button, Spinner, toast } from "@heroui/react";
import { SigningModeModal } from "../../components/SigningModeModal/SigningModeModal";
import { FileDown } from "lucide-react";
import {
  MedicalRecordViewer,
  RichTextEditor,
} from "../../components/RichTextEditor/RichTextEditor";
import MedicalRecordsService, {
  type MedicalRecord,
  type SignatureStatus,
  type SigningMode,
} from "../../api/services/MedicalRecords";
import type { AppointmentStatus } from "../../api/services/Appointments";
import type { MedicalRecordController } from "../../hooks/useMedicalRecord";
import { SOAP_TEMPLATE } from "./SoapTemplate";

const appointmentStatusLabel: Record<AppointmentStatus, string> = {
  Scheduled: "agendada",
  AwaitingPayment: "aguardando pagamento",
  AwaitingConfirmation: "aguardando confirmação",
  Confirmed: "confirmada",
  InProgress: "em andamento",
  Completed: "concluída",
  RescheduleNeeded: "precisa ser remarcada",
  Canceled: "cancelada",
  Absent: "com ausência registrada",
};

export function MedicalRecordComponent({
  appointmentId,
}: MedicalRecordComponentProps): JSX.Element {
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [initialContent, setInitialContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>({ kind: "idle" });
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isSigningModalOpen, setIsSigningModalOpen] = useState(false);
  const [isOpeningPdf, setIsOpeningPdf] = useState(false);
  const [isWritable, setIsWritable] = useState(true);
  const [appointmentStatus, setAppointmentStatus] = useState<AppointmentStatus | null>(null);
  const [signatureStatus, setSignatureStatus] = useState<SignatureStatus | null>(null);

  const lastSavedRef = useRef<string | null>(null);
  const pendingRef = useRef<string | null>(null);
  const inFlightRef = useRef<Promise<boolean> | null>(null);

  useEffect(() => {
    let active = true;

    setIsLoading(true);
    setLoadError(null);

    MedicalRecordsService.getByAppointment(appointmentId)
      .then(({ record: loaded, appointmentStatus, isWritable }) => {
        if (!active) return;
        setRecord(loaded);
        setInitialContent(loaded?.contentJson ?? null);
        setAppointmentStatus(appointmentStatus);
        setIsWritable(isWritable);
        lastSavedRef.current = loaded?.contentJson ?? null;
      })
      .catch((err) => active && setLoadError(errorMessage(err, "Erro ao carregar o prontuário.")))
      .finally(() => active && setIsLoading(false));

    return () => {
      active = false;
    };
  }, [appointmentId]);

  const recordId = record?.id;
  const isFinalized = record?.isFinalized ?? false;

  useEffect(() => {
    if (!isFinalized || recordId === undefined) return;

    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const check = async () => {
      try {
        const pdf = await MedicalRecordsService.getPdf(recordId);
        if (!active) return;
        setSignatureStatus(pdf.signatureStatus);
        if (pdf.signatureStatus !== "Signed" && pdf.signatureStatus !== "Failed" && pdf.signatureStatus !== "AwaitingDoctor") {
          timer = setTimeout(check, SIGNATURE_POLL_MS);
        }
      } catch {
        if (active) timer = setTimeout(check, SIGNATURE_POLL_MS);
      }
    };

    void check();

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [isFinalized, recordId]);

  const drain = useCallback(async (): Promise<boolean> => {
    while (pendingRef.current !== null) {
      const content = pendingRef.current;
      pendingRef.current = null;

      if (content === lastSavedRef.current) continue;

      setSaveState({ kind: "saving" });
      try {
        const saved = await MedicalRecordsService.saveDraft(appointmentId, content);
        lastSavedRef.current = content;
        setRecord(saved);
        setSaveState({ kind: "saved", at: new Date() });
      } catch (err) {
        setSaveState({ kind: "error", message: errorMessage(err, "Erro ao salvar o prontuário.") });
        return false;
      }
    }

    return true;
  }, [appointmentId]);

  const save = useCallback(
    (content: string): Promise<boolean> => {
      pendingRef.current = content;

      if (!inFlightRef.current) {
        inFlightRef.current = drain().finally(() => {
          inFlightRef.current = null;
        });
      }

      return inFlightRef.current;
    },
    [drain],
  );

  const handleChange = useCallback(
    (content: string) => {
      if (!isLoading) void save(content);
    },
    [isLoading, save],
  );

  const finalize = async (mode: SigningMode) => {
    setIsSigningModalOpen(false);
    if (!record) return;

    setIsFinalizing(true);
    try {
      if (inFlightRef.current && !(await inFlightRef.current)) {
        throw new Error("O último trecho não foi salvo. Tente de novo em instantes.");
      }

      await MedicalRecordsService.finalize(record.id, mode);
      setInitialContent(lastSavedRef.current);
      setRecord({ ...record, isFinalized: true, finalizedAt: new Date().toISOString() });
      toast.success(mode === "Manual" ? "Prontuário finalizado. Assine em Assinar Documentos." : "Prontuário finalizado.");
    } catch (err) {
      toast.danger(errorMessage(err, "Erro ao finalizar o prontuário."));
    } finally {
      setIsFinalizing(false);
    }
  };

  const openPdf = async () => {
    if (!record) return;

    setIsOpeningPdf(true);
    try {
      const pdf = await MedicalRecordsService.getPdf(record.id);
      setSignatureStatus(pdf.signatureStatus);
      if (!pdf.downloadUrl) throw new Error("O PDF não está disponível no momento.");
      window.open(pdf.downloadUrl, "_blank", "noopener");
    } catch (err) {
      toast.danger(errorMessage(err, "Erro ao abrir o PDF."));
    } finally {
      setIsOpeningPdf(false);
    }
  };
const dateTimeFormat = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

interface MedicalRecordComponentProps {
  controller: MedicalRecordController;
}

/**
 * Só a área de trabalho: título, cabeçalho e ações moram em PatientHeader.
 * Estrutura: coluna flex com `min-h-0` → o editor ocupa o resto da altura e rola por dentro,
 * sem os antigos `h-[78%]` / `max-h-[78%]`.
 */
export function MedicalRecordComponent({ controller }: MedicalRecordComponentProps): JSX.Element {
  const {
    mode,
    record,
    initialContent,
    editorKey,
    editorRef,
    loadError,
    appointmentStatus,
    isEmpty,
    setIsEmpty,
    handleChange,
    applyTemplate,
  } = controller;

  return (
    <main className="flex min-w-0 flex-1 flex-col bg-surface-alt">
      {mode === "loading" && (
        <div className="flex flex-1 items-center justify-center" role="status" aria-label="Carregando prontuário">
          <Spinner />
        </div>
      )}

      {mode === "error" && (
        <div className="flex flex-1 items-center justify-center p-6" role="alert">
          <p className="text-center text-danger">{loadError}</p>
        </div>
      )}

      {mode === "finalized" && record && (
        <>
          <div className="shrink-0 border-b border-success bg-success-subtle px-4 py-1.5 text-sm font-semibold text-success">
            Atendimento finalizado
            {record.finalizedAt && (
              <span className="ml-2 font-normal tabular-nums">
                em {dateTimeFormat.format(new Date(record.finalizedAt))}
              </span>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <MedicalRecordViewer json={initialContent ?? record.contentJson} />
          </div>
        </>
      )}

      {mode === "readonly" && (
        <>
          <p className="shrink-0 border-b border-warning bg-warning-subtle px-4 py-2 text-sm text-warning-text">
            Esta consulta está {appointmentStatus ? appointmentStatusLabel[appointmentStatus] : "indisponível"}.
            O prontuário só pode ser escrito em consultas confirmadas, em andamento ou concluídas.
          </p>
          {record && (
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <MedicalRecordViewer json={record.contentJson} />
            </div>
          )}
        </>
      )}

      {mode === "editing" && (
        <>
          <div className="flex h-9 shrink-0 items-center justify-between gap-2 px-4">
            <h2 className="text-sm font-semibold text-text-primary">Evolução clínica</h2>
            {/* Só aparece com o editor vazio: nunca sobrescreve o que o médico já escreveu */}
            {isEmpty && (
              <Button size="sm" variant="ghost" onPress={() => applyTemplate(SOAP_TEMPLATE)}>
                <ClipboardList />
                Usar modelo SOAP
              </Button>
            )}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="flex-1 flex flex-col h-full bg-surface-alt py-4 pb-4">
      <div className="flex justify-between items-center px-4 pt-2 pb-4">
        <h2 className="text-2xl font-bold text-text-primary">Prontuário</h2>
        <SaveIndicator state={saveState} />
      </div>
      <div className="h-[78%] max-h-[78%] overflow-hidden">
        <RichTextEditor
          setText={handleChange}
          setIsEmpty={setIsEmpty}
          content={initialContent}
        />
      </div>
      <div className="mt-4 p-4 w-full flex justify-end">
        <Button isDisabled={isEmpty || !record || isFinalizing} onPress={() => setIsSigningModalOpen(true)}>
          Finalizar
        </Button>
        <SigningModeModal
          isOpen={isSigningModalOpen}
          onConfirm={finalize}
          onCancel={() => setIsSigningModalOpen(false)}
          texto="Deseja finalizar o prontuário? Depois de finalizado ele não pode mais ser alterado."
        />
      </div>
    </section>
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
    status === "Signed" ? null
    : status === "AwaitingDoctor" ? <span className="text-sm text-text-secondary">Aguardando sua assinatura em Assinar Documentos</span>
    : status === "Failed" ? <span className="text-sm text-danger">A assinatura falhou; o PDF sai sem assinatura.</span>
    : status === null ? null
    : (
      <span className="flex items-center gap-2 text-sm text-text-secondary">
        <Spinner size="sm" />
        Assinatura em andamento; por enquanto o PDF sai sem assinatura.
      </span>
    );

          {/* O RichTextEditor ocupa 100% deste contêiner e rola por dentro da área de escrita */}
          <div className="min-h-0 flex-1 overflow-hidden px-2 pb-2">
            <RichTextEditor
              key={editorKey}
              ref={editorRef}
              setText={handleChange}
              setIsEmpty={setIsEmpty}
              content={initialContent}
            />
          </div>
        </>
      )}
    </main>
  );
}