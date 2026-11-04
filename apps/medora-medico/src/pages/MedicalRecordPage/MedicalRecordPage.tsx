import { useCallback, useEffect, useState, type JSX } from "react";
import { ToastProvider } from "@heroui/react";
import { useLocation, useParams } from "react-router";
import { PatientHeader, type PatientSummary } from "./PatientHeader";
import { ClinicalSidebar } from "./ClinicalSidebar";
import { MedicalRecordComponent } from "./MedicalRecordComponent";
import { useMedicalRecord } from "../../hooks/useMedicalRecord";

export interface MedicalRecordNavigationState {
  patientName?: string;
  appointmentDate?: string;
  /** Ideal: enviar o resumo completo (ou buscá-lo pela API a partir do appointmentId). */
  patient?: PatientSummary;
}

const isDesktop = () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;

export function MedicalRecordPage(): JSX.Element {
  const { appointmentId } = useParams();
  const location = useLocation();
  const nav = (location.state ?? {}) as MedicalRecordNavigationState;

  const id = Number(appointmentId);
  const hasAppointment = Number.isInteger(id) && id > 0;

  const patient: PatientSummary = nav.patient ?? { name: nav.patientName ?? "Paciente" };

  return (
    <>
      <ToastProvider maxVisibleToasts={1} placement="bottom end" aria-live="assertive" />
      {hasAppointment ? (
        <Workspace key={id} appointmentId={id} patient={patient} appointmentDate={nav.appointmentDate} />
      ) : (
        <NoAppointment />
      )}
    </>
  );
}

function Workspace({
  appointmentId,
  patient,
  appointmentDate,
}: {
  appointmentId: number;
  patient: PatientSummary;
  appointmentDate?: string;
}): JSX.Element {
  const controller = useMedicalRecord(appointmentId);
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);

  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);

  const { mode, saveDraft } = controller;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (mode === "editing") void saveDraft();
      } else if (e.key === "\\") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, saveDraft, toggleSidebar]);

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-surface text-text-primary">
      <PatientHeader
        patient={patient}
        appointmentDate={appointmentDate}
        controller={controller}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      <div className="relative flex min-h-0 flex-1">
        <ClinicalSidebar
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
          historyReloadKey={controller.record?.isFinalized}
          // exams={...} diagnoses={...}  ← ligar quando houver endpoints
        />
        <MedicalRecordComponent controller={controller} />
      </div>
    </div>
  );
}

function NoAppointment(): JSX.Element {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-surface">
      <ClinicalSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      <main className="flex flex-1 items-center justify-center bg-surface-alt p-6">
        <p className="text-center text-text-secondary">Abra o prontuário a partir de uma consulta no painel.</p>
      </main>
    </div>
  );
}