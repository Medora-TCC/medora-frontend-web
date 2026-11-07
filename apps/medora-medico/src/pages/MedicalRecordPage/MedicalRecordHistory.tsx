import { useEffect, useState, type JSX } from "react";
import { Button, Spinner } from "@heroui/react";
import { useNavigate } from "react-router";
import { MedicalRecordModal } from "./MedicalRecordModal";
import type { MedicalRecordDTO } from "../../api/dtos/MedicalRecord/MedicalRecordDTO";
import { getByPatient as fetchMedicalRecords } from "../../api/services/MedicalRecords";

interface MedicalRecordHistoryProps {
  /** Muda quando é preciso recarregar a lista (ex.: após finalizar o atendimento atual). */
  patientId: string | undefined;
  reloadKey?: unknown;
}

export function MedicalRecordHistory({ reloadKey, patientId }: MedicalRecordHistoryProps): JSX.Element {
  const navigate = useNavigate();

  const [items, setItems] = useState<MedicalRecordDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    console.log(patientId)
    if (patientId === undefined) return;
    let active = true;
    setIsLoading(true);
    setError(null);

    fetchMedicalRecords(patientId)
      .then((data) => active && setItems(data))
      .catch((e: unknown) => {
        console.error(e);
        if (active) setError("Não foi possível carregar as consultas anteriores.");
      })
      .finally(() => active && setIsLoading(false));

    return () => {
      active = false;
    };
  }, [reloadKey, attempt]);


  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2">
        <span className="text-xs text-text-secondary tabular-nums">
          {items.length} {items.length === 1 ? "consulta" : "consultas"}
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-text-muted" role="status">
          <Spinner size="sm" />
          Carregando
        </div>
      ) : error ? (
        <div className="flex flex-col items-start gap-2 p-3 text-sm" role="alert">
          <p className="text-danger">{error}</p>
          <Button size="sm" variant="secondary" onPress={() => setAttempt((n) => n + 1)}>
            Tentar de novo
          </Button>
        </div>
      ) : items.length === 0 ? (
        <p className="p-4 text-center text-sm text-text-muted">Nenhum prontuário encontrado</p>
      ) : (
        <ol className="relative my-2 ml-4 mr-2 border-l border-border">
          {items.map((item) => (
            <li key={item.id} className="relative pl-2">
              <span
                aria-hidden
                className={`absolute -left-1.25 top-4 size-2.5 rounded-full ring-2 ring-surface`}
              />
              {!item.isFinalized ? (
                <Button
                  variant="ghost"
                  className="h-auto min-h-0 w-full justify-start rounded-md px-2 py-1.5 text-left"
                  onPress={() => navigate("/medico/prontuario", { state: { prontuario: item } })}
                  aria-label={`Continuar prontuário de ${item.date}`}
                >
                  <Entry item={item} />
                </Button>
              ) : (
                <MedicalRecordModal medicalRecord={item}>
                  <Entry item={item} />
                </MedicalRecordModal>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function Entry({ item }: { item: MedicalRecordDTO }): JSX.Element {
  return (
    <span className="flex w-full min-w-0 flex-col items-start gap-0.5">
      <span className="flex items-center gap-2 text-xs tabular-nums text-text-secondary">
        {item.date.toLocaleDateString('pt-BR')}
        <span className={`rounded-full px-2 py-px font-semibold`}>
          {item.isDeleted ? "Inativado" : item.isFinalized ? "Finalizado" : "Não finalizado"}
        </span>
      </span>
    </span>
  );
}