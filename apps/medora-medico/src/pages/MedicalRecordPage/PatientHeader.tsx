import { useState, type JSX } from "react";
import { Button, Spinner } from "@heroui/react";
import {
  Eye,
  EyeOff,
  FileDown,
  PanelLeftClose,
  PanelLeftOpen,
  Save,
} from "lucide-react";
import type { SignatureStatus } from "../../api/services/MedicalRecords";
import type { MedicalRecordController, SaveState } from "../../hooks/useMedicalRecord";
import { formatSex } from "../../types/Sex";
import type { Sex } from "../../api/dtos/Doctors/PersonalDataDto";
import { SigningModeModal } from "../../components/SigningModeModal/SigningModeModal";
export interface PatientSummary {
  id?: string;
  name: string;
  birthDate?: string; // ISO "yyyy-mm-dd"
  sex?: Sex;
  cpf?: string;
}

interface PatientHeaderProps {
  patient: PatientSummary | null;
  fallbackName?: string;
  appointmentDate?: string;
  controller: MedicalRecordController;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const timeFormat = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

function ageFrom(dateStr?: string): string | null {
  const m = dateStr?.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return null;

  const [, d, mo, y] = m.map(Number);
  const now = new Date();

  let years = now.getFullYear() - y;
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  if (currentMonth < mo || (currentMonth === mo && currentDay < d)) {
    years -= 1;
  }

  return `${years} anos`;
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
  patient: patientProp,
  fallbackName,
  appointmentDate,
  controller,
  sidebarOpen,
  onToggleSidebar,
}: PatientHeaderProps): JSX.Element {
  const [showCpf, setShowCpf] = useState(false);
  const isLoading = patientProp === null;
  const patient: PatientSummary = patientProp ?? { name: fallbackName ?? "" };
  const {
    mode,
    saveState,
    canFinalize,
    isSigningModalOpen,
    openSigningModal,
    closeSigningModal,
    finalize,
    saveDraft,
    openPdf,
    isOpeningPdf,
    signatureStatus,
  } = controller;

  const birth = patient.birthDate;
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
          {patient.name ? (
            <h1 className="truncate text-base font-bold text-text-primary">{patient.name}</h1>
          ) : (
            <Skeleton className="h-5 w-48" />
          )}
          {isLoading && <Skeleton className="hidden h-4 w-64 md:block" />}

          <dl className="hidden items-baseline gap-x-4 whitespace-nowrap text-sm text-text-secondary tabular-nums md:flex">
            {(age || birth) && (
              <Meta label="Idade e nascimento">
                {age}
                {birth && <span className="text-text-secondary ml-4">Data de nascimento: {birth}</span>}
              </Meta>
            )}
            {patient.sex && <Meta label="Sexo biológico">Sexo: {formatSex(patient.sex)}</Meta>}
            {patient.cpf && (
              <Meta label="CPF">
                <span className="inline-flex items-center gap-1">
                  CPF: {" "}
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
              <Button isDisabled={!canFinalize} onPress={openSigningModal}>
                Finalizar
              </Button>
              <SigningModeModal
                isOpen={isSigningModalOpen}
                onConfirm={finalize}
                onCancel={closeSigningModal}
                texto="Deseja finalizar o prontuário? Depois de finalizado ele não pode mais ser alterado."
              />
            </>
          )}

          {mode === "finalized" && (
            <PdfButton status={signatureStatus} isOpening={isOpeningPdf} onOpen={openPdf} />
          )}
        </div>
      </div>

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

function Skeleton({ className = "" }: { className?: string }): JSX.Element {
  return <span aria-hidden className={`block animate-pulse rounded bg-border motion-reduce:animate-none ${className}`} />;
}

function SaveIndicator({ state }: { state: SaveState }): JSX.Element {
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