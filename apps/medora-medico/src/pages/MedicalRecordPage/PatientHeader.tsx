import { useState, type JSX } from "react";
import { Button } from "@heroui/react";
import {
  Eye,
  EyeOff,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import type { MedicalRecordController } from "../../hooks/useMedicalRecord";
import { MedicalRecordActions } from "./MedicalRecordActions";
import { formatSex } from "../../types/Sex";
import type { PatientSummary } from "../../api/dtos/MedicalRecord/PatientSummary";
interface PatientHeaderProps {
  patient: PatientSummary | null;
  fallbackName?: string;
  appointmentDate?: string;
  controller: MedicalRecordController;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

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

        <MedicalRecordActions controller={controller} />
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
