import { ToastProvider } from "@heroui/react";
import { useLocation, useParams } from "react-router";
import { MedicalRecordHistory } from "./MedicalRecordHistory";
import { MedicalRecordComponent } from "./MedicalRecordComponent";

export interface MedicalRecordNavigationState {
  patientName?: string;
  appointmentDate?: string;
}

export function MedicalRecordPage() {
  const { appointmentId } = useParams();
  const location = useLocation();
  const navigationState = (location.state ?? {}) as MedicalRecordNavigationState;

  const id = Number(appointmentId);
  const hasAppointment = Number.isInteger(id) && id > 0;

  return (
    <section className="w-full max-h-[90vh] h-full bg-surface overflow-hidden flex flex-col">
      <ToastProvider
        maxVisibleToasts={1}
        placement="bottom end"
        aria-live="assertive"
      />
      <section className="w-full px-6 py-4 shrink-0 z-10 font-semibold border-b-[3px] border-border">
        <section className="flex flex-col">
          <span className="text-[20px] truncate">
            {navigationState.patientName ?? "Prontuário"}
          </span>
          {navigationState.appointmentDate && (
            <span>Consulta: {navigationState.appointmentDate}</span>
          )}
        </section>
      </section>

      <section className="flex h-full flex-col md:flex-row flex-1 overflow-hidden">
        <MedicalRecordHistory setError={() => {}} />
        {hasAppointment ? (
          <MedicalRecordComponent key={id} appointmentId={id} />
        ) : (
          <section className="flex-1 flex items-center justify-center bg-surface-alt p-6">
            <p className="text-text-secondary text-center">
              Abra o prontuário a partir de uma consulta no painel.
            </p>
          </section>
        )}
      </section>
    </section>
  );
}
