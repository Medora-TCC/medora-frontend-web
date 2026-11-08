import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "@heroui/react";
import MedicalRecordsService, {
  type MedicalRecord,
  type SignatureStatus,
  type SigningMode,
} from "../api/services/MedicalRecords";
import type { AppointmentStatus } from "../api/services/Appointments";
import { errorMessage } from "../api/errors";
import type { RichTextEditorRef } from "../components/RichTextEditor/RichTextEditor";
import type { PatientSummary } from "../pages/MedicalRecordPage/PatientHeader";

export type SaveState =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved"; at: Date }
  | { kind: "error"; message: string };

const SIGNATURE_POLL_MS = 5000;

/**
 * Toda a lógica de estado do prontuário (antes dentro de MedicalRecordComponent).
 * Foi extraída para que o cabeçalho (status de salvamento + botões) e a área de
 * evolução compartilhem o mesmo estado sem prop drilling nem duplicação.
 */
export function useMedicalRecord(appointmentId: number) {
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [initialContent, setInitialContent] = useState<string | null>(null);
  const [editorKey, setEditorKey] = useState(0);
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
  const [patient, setPatient] = useState<PatientSummary | null>(null);

  const lastSavedRef = useRef<string | null>(null);
  const pendingRef = useRef<string | null>(null);
  const latestRef = useRef<string | null>(null);
  const inFlightRef = useRef<Promise<boolean> | null>(null);
  const editorRef = useRef<RichTextEditorRef>(null);

  const openSigningModal = useCallback(() => setIsSigningModalOpen(true), []);
  const closeSigningModal = useCallback(() => setIsSigningModalOpen(false), []);


  // ---- carga ----------------------------------------------------------------
  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setLoadError(null);

    MedicalRecordsService.getByAppointment(appointmentId)
      .then(({ record: loaded, appointmentStatus: status, isWritable: writable, patientSummary }) => {
        if (!active) return;
        setPatient(patientSummary);
        setRecord(loaded);
        setInitialContent(loaded?.contentJson ?? null);
        setAppointmentStatus(status);
        setIsWritable(writable);
        lastSavedRef.current = loaded?.contentJson ?? null;
        latestRef.current = loaded?.contentJson ?? null;
      })
      .catch((err) => active && setLoadError(errorMessage(err, "Erro ao carregar o prontuário.")))
      .finally(() => active && setIsLoading(false));

    return () => {
      active = false;
    };
  }, [appointmentId]);

  // ---- polling da assinatura (só após finalizar) ------------------------------
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

  // ---- autosave (fila de 1 requisição em voo + 1 pendente) --------------------
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
      latestRef.current = content;
      if (!isLoading) void save(content);
    },
    [isLoading, save],
  );

  /**
   * Garante que tudo que está na tela já foi persistido.
   * O editor tem debounce de 1s: sem forçar a emissão aqui, "Salvar rascunho" e "Finalizar"
   * deixariam de fora o que foi digitado no último segundo.
   */
  const flush = useCallback(async (): Promise<boolean> => {
    editorRef.current?.flush();
    const latest = latestRef.current;
    if (latest !== null && latest !== lastSavedRef.current) return save(latest);
    return inFlightRef.current ? await inFlightRef.current : true;
  }, [save]);

  // ---- ações ----------------------------------------------------------------
  const saveDraft = useCallback(async () => {
    const ok = await flush();
    if (ok) toast.success("Rascunho salvo.");
    else toast.danger("Não foi possível salvar. Verifique a conexão e tente de novo.");
  }, [flush]);

  const finalize = async (mode: SigningMode) => {
    setIsSigningModalOpen(false);
    if (!record) return;
    setIsFinalizing(true);
    try {
      if (!(await flush())) {
        throw new Error("O último trecho não foi salvo. Tente de novo em instantes.");
      }
      await MedicalRecordsService.finalize(record.id, mode);
      setInitialContent(lastSavedRef.current);
      setRecord((r) => (r ? { ...r, isFinalized: true, finalizedAt: new Date().toISOString() } : r));
      toast.success(mode === "Manual" ? "Prontuário finalizado. Assine em Assinar Documentos." : "Prontuário finalizado.");
    } catch (err) {
      toast.danger(errorMessage(err, "Erro ao finalizar o prontuário."));
    } finally {
      setIsFinalizing(false);
    }
  };

  const openPdf = useCallback(async () => {
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
  }, [record]);

  /** Troca o conteúdo inicial do editor (ex.: modelo SOAP). Só use com o editor vazio. */
  const applyTemplate = useCallback((json: string) => {
    setInitialContent(json);
    setEditorKey((k) => k + 1);
  }, []);

  const mode: "loading" | "error" | "finalized" | "readonly" | "editing" = isLoading
    ? "loading"
    : loadError
      ? "error"
      : isFinalized
        ? "finalized"
        : !isWritable
          ? "readonly"
          : "editing";

  return {
    mode,
    record,
    initialContent,
    editorKey,
    editorRef,
    loadError,
    appointmentStatus,
    signatureStatus,
    saveState,
    isEmpty,
    setIsEmpty,
    isFinalizing,
    isOpeningPdf,
    isSigningModalOpen,
    openSigningModal,
    closeSigningModal,
    canFinalize: mode === "editing" && !isEmpty && !!record && !isFinalizing,
    handleChange,
    saveDraft,
    finalize,
    openPdf,
    applyTemplate,
    patient,
  };
}

export type MedicalRecordController = ReturnType<typeof useMedicalRecord>;