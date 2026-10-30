import { useCallback, useEffect, useRef, useState, type JSX } from "react";
import { Button, Spinner, toast } from "@heroui/react";
import { ModalConfirmacao } from "@medora_web/shared";
import { FileDown } from "lucide-react";
import {
  MedicalRecordViewer,
  RichTextEditor,
} from "../../components/RichTextEditor/RichTextEditor";
import MedicalRecordsService, {
  type MedicalRecord,
  type SignatureStatus,
} from "../../api/services/MedicalRecords";
import type { AppointmentStatus } from "../../api/services/Appointments";
import { errorMessage } from "../../api/errors";

interface MedicalRecordComponentProps {
  appointmentId: number;
}

type SaveState =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved"; at: Date }
  | { kind: "error"; message: string };

const timeFormat = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

const SIGNATURE_POLL_MS = 5000;

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
        if (pdf.signatureStatus !== "Signed" && pdf.signatureStatus !== "Failed") {
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

  const finalize = async () => {
    if (!record) return;

    setIsFinalizing(true);
    try {
      if (inFlightRef.current && !(await inFlightRef.current)) {
        throw new Error("O último trecho não foi salvo. Tente de novo em instantes.");
      }

      await MedicalRecordsService.finalize(record.id);
      setInitialContent(lastSavedRef.current);
      setRecord({ ...record, isFinalized: true, finalizedAt: new Date().toISOString() });
      toast.success("Prontuário finalizado.");
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

  if (isLoading) {
    return (
      <section className="flex-1 flex items-center justify-center bg-surface-alt">
        <Spinner />
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="flex-1 flex items-center justify-center bg-surface-alt p-6">
        <p className="text-danger text-center">{loadError}</p>
      </section>
    );
  }

  if (record?.isFinalized) {
    return (
      <section className="flex-1 flex flex-col h-full bg-surface-alt py-4 pb-4 px-4 gap-4">
        <div className="flex justify-between items-center pt-2">
          <h2 className="text-2xl font-bold text-text-primary">Prontuário finalizado</h2>
          <PdfButton status={signatureStatus} isOpening={isOpeningPdf} onOpen={openPdf} />
        </div>
        <div className="flex-1 overflow-hidden">
          <MedicalRecordViewer json={initialContent ?? record.contentJson} />
        </div>
      </section>
    );
  }

  if (!isWritable) {
    const statusLabel = appointmentStatus ? appointmentStatusLabel[appointmentStatus] : "indisponível";

    return (
      <section className="flex-1 flex flex-col h-full bg-surface-alt py-4 pb-4 px-4 gap-4">
        <h2 className="text-2xl font-bold text-text-primary pt-2">Prontuário</h2>
        <p className="rounded-xl border border-warning bg-warning-subtle text-warning-text px-4 py-3">
          Esta consulta está {statusLabel}. O prontuário só pode ser escrito em consultas confirmadas, em andamento ou concluídas.
        </p>
        {record && (
          <div className="flex-1 overflow-hidden">
            <MedicalRecordViewer json={record.contentJson} />
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
        <ModalConfirmacao
          onConfirm={finalize}
          disabled={isEmpty || !record || isFinalizing}
          texto="Deseja finalizar o prontuário? Depois de finalizado ele não pode mais ser alterado."
          textoBotao="Finalizar"
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
    : status === "Failed" ? <span className="text-sm text-danger">A assinatura falhou; o PDF sai sem assinatura.</span>
    : status === null ? null
    : (
      <span className="flex items-center gap-2 text-sm text-text-secondary">
        <Spinner size="sm" />
        Assinatura em andamento; por enquanto o PDF sai sem assinatura.
      </span>
    );

  return (
    <div className="flex items-center gap-3">
      {note}
      <Button variant="primary" onPress={onOpen} isDisabled={isOpening}>
        <FileDown />
        Baixar PDF
      </Button>
    </div>
  );
}

function SaveIndicator({ state }: { state: SaveState }): JSX.Element | null {
  switch (state.kind) {
    case "saving":
      return <span className="text-sm text-text-secondary">Salvando…</span>;
    case "saved":
      return <span className="text-sm text-text-secondary">Salvo às {timeFormat.format(state.at)}</span>;
    case "error":
      return <span className="text-sm text-danger">Não foi salvo: {state.message}</span>;
    default:
      return null;
  }
}
