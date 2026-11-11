import type { JSX } from "react";
import { useMedicalRecord } from "../../hooks/useMedicalRecord";
import { MedicalRecordActions } from "./MedicalRecordActions";
import { MedicalRecordComponent } from "./MedicalRecordComponent";

/** Prontuário compacto, sem cabeçalho do paciente nem histórico (painel lateral da teleconsulta). */
export function MedicalRecordPanel({ appointmentId }: { appointmentId: number }): JSX.Element {
  const controller = useMedicalRecord(appointmentId);

  return (
    <div className="flex h-full flex-col bg-surface-alt">
      <div className="flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2">
        <h2 className="text-base font-bold text-text-primary">Prontuário</h2>
        <MedicalRecordActions controller={controller} />
      </div>
      <MedicalRecordComponent controller={controller} />
    </div>
  );
}
