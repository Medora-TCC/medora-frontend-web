import type { JSX } from "react";
import { Button, Spinner } from "@heroui/react";
import { ClipboardList } from "lucide-react";
import { MedicalRecordViewer, RichTextEditor } from "../../components/RichTextEditor/RichTextEditor";
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