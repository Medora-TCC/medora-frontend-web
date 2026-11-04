import { useState, type JSX } from "react";
import { Button, Spinner } from "@heroui/react";
import { ModalConfirmacao } from "@medora_web/shared";
import {
  CircleHelp,
  Eye,
  EyeOff,
  FileDown,
  PanelLeftClose,
  PanelLeftOpen,
  Save,
  TriangleAlert,
} from "lucide-react";
import type { SignatureStatus } from "../../api/services/MedicalRecords";
import type { MedicalRecordController, SaveState } from "../../hooks/useMedicalRecord";


export interface PatientSummary {
  name: string;
  birthDate?: string; // ISO "yyyy-mm-dd"
  sex?: "Feminino" | "Masculino" | "Intersexo";
  cpf?: string;
  recordNumber?: string | number;
  appointmentNumber?: string | number;
  allergies?: string[] | null;
  conditions?: string[];
  riskFlags?: string[];
}

interface PatientHeaderProps {
  patient: PatientSummary;
  appointmentDate?: string;
  controller: MedicalRecordController;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const timeFormat = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

function ageFrom(iso?: string): string | null {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const [, y, mo, d] = m.map(Number) as unknown as number[];
  const now = new Date();
  let years = now.getFullYear() - y;
  if (now.getMonth() + 1 < mo || (now.getMonth() + 1 === mo && now.getDate() < d)) years -= 1;
  return `${years} anos`;
}

function formatBirth(iso?: string): string | null {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : null;
}

function maskCpf(cpf: string): string {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11) return "•••.•••.•••-••";
  return `•••.•••.${d.slice(6, 9)}-••`;
}

function formatCpf(cpf: string): string {
  const d = cpf.replace(/\D/g, "");
  return d.length === 11 ? `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}` : cpf;
}

export function PatientHeader({
  patient,
  appointmentDate,
  controller,
  sidebarOpen,
  onToggleSidebar,
}: PatientHeaderProps): JSX.Element {
  const [showCpf, setShowCpf] = useState(false);
  const { mode, saveState, canFinalize, finalize, saveDraft, openPdf, isOpeningPdf, signatureStatus } =
    controller;

  const birth = formatBirth(patient.birthDate);
  const age = ageFrom(patient.birthDate);

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b-2 border-border bg-surface">
      {/* Linha 1: identificação + status + ações */}
      <div className="flex min-h-12 items-center gap-3 px-3">
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          onPress={onToggleSidebar}
          aria-label={sidebarOpen ? "Recolher histórico" : "Abrir histórico"}
          aria-expanded={sidebarOpen}
          aria-controls="clinical-sidebar"
        >
          {sidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
        </Button>

        <div className="flex min-w-0 flex-1 items-baseline gap-x-4 overflow-hidden">
          <h1 className="truncate text-base font-bold text-text-primary">{patient.name}</h1>

          <dl className="hidden items-baseline gap-x-4 whitespace-nowrap text-sm text-text-secondary tabular-nums md:flex">
            {(age || birth) && (
              <Meta label="Idade e nascimento">
                {age}
                {birth && <span className="text-text-muted"> ({birth})</span>}
              </Meta>
            )}
            {patient.sex && <Meta label="Sexo biológico">{patient.sex}</Meta>}
            {patient.cpf && (
              <Meta label="CPF">
                <span className="inline-flex items-center gap-1">
                  {showCpf ? formatCpf(patient.cpf) : maskCpf(patient.cpf)}
                  <button
                    type="button"
                    onClick={() => setShowCpf((v) => !v)}
                    aria-pressed={showCpf}
                    aria-label={showCpf ? "Ocultar CPF" : "Mostrar CPF"}
                    className="rounded p-0.5 text-text-muted hover:text-text-primary focus-visible:outline-2"
                  >
                    {showCpf ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </button>
                </span>
              </Meta>
            )}
            {patient.recordNumber !== undefined && <Meta label="Prontuário">nº {patient.recordNumber}</Meta>}
            {patient.appointmentNumber !== undefined && (
              <Meta label="Atendimento">#{patient.appointmentNumber}</Meta>
            )}
            {appointmentDate && <Meta label="Consulta">{appointmentDate}</Meta>}
          </dl>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <SaveIndicator state={saveState} />

          {mode === "editing" && (
            <>
              <Button size="sm" variant="secondary" onPress={saveDraft} aria-keyshortcuts="Control+S Meta+S">
                <Save />
                <span className="hidden sm:inline">Salvar rascunho</span>
              </Button>
              <ModalConfirmacao
                onConfirm={finalize}
                disabled={!canFinalize}
                texto="Deseja finalizar o atendimento? Depois de finalizado o prontuário não pode mais ser alterado."
                textoBotao="Finalizar atendimento"
              />
            </>
          )}

          {mode === "finalized" && (
            <PdfButton status={signatureStatus} isOpening={isOpeningPdf} onOpen={openPdf} />
          )}
        </div>
      </div>

      {/* Linha 2: alertas clínicos (sempre visível, nunca rola) */}
      <ClinicalAlerts patient={patient} />
    </header>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }): JSX.Element {
  return (
    <div className="flex items-baseline gap-1">
      <dt className="sr-only">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function ClinicalAlerts({ patient }: { patient: PatientSummary }): JSX.Element {
  const { allergies, conditions = [], riskFlags = [] } = patient;

  return (
    <div
      role="region"
      aria-label="Alertas clínicos"
      className="flex min-h-8 flex-wrap items-center gap-1.5 border-t border-border bg-surface-alt px-3 py-1 text-xs"
    >
      {allergies === null || allergies === undefined ? (
        <span className="inline-flex items-center gap-1 rounded-md border border-warning bg-warning-subtle px-2 py-0.5 font-semibold text-warning-text">
          <CircleHelp className="size-3.5" aria-hidden />
          Alergias não registradas
        </span>
      ) : allergies.length === 0 ? (
        <span className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 font-medium text-text-secondary">
          Sem alergias conhecidas
        </span>
      ) : (
        allergies.map((a) => (
          <span
            key={a}
            className="inline-flex items-center gap-1 rounded-md border border-danger bg-danger-subtle px-2 py-0.5 font-bold text-danger-text"
          >
            <TriangleAlert className="size-3.5" aria-hidden />
            Alergia: {a}
          </span>
        ))
      )}

      {riskFlags.map((r) => (
        <span
          key={r}
          className="inline-flex items-center gap-1 rounded-md border border-warning bg-warning-subtle px-2 py-0.5 font-semibold text-warning-text"
        >
          <TriangleAlert className="size-3.5" aria-hidden />
          {r}
        </span>
      ))}

      {conditions.map((c) => (
        <span key={c} className="rounded-md border border-border bg-surface px-2 py-0.5 text-text-secondary">
          {c}
        </span>
      ))}
    </div>
  );
}

function SaveIndicator({ state }: { state: SaveState }): JSX.Element {
  // aria-live fica sempre montado para que leitores de tela anunciem as mudanças.
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
    status === "Signed" || status === null ? null : status === "Failed" ? (
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