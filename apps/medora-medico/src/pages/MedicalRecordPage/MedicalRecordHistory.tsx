import { useEffect, useMemo, useState, type JSX } from "react";
import { Button, Spinner } from "@heroui/react";
import { useNavigate } from "react-router";
import { MedicalRecordModal } from "./MedicalRecordModal";
import type { MedicalRecordDTO, MedicalRecordStatus } from "../../api/dtos/MedicalRecord/MedicalRecordDTO";
import { fetchProntuarios as fetchMedicalRecords } from "./MedicalRecord";

interface MedicalRecordHistoryProps {
  /** Muda quando é preciso recarregar a lista (ex.: após finalizar o atendimento atual). */
  reloadKey?: unknown;
}

const BadgeStatus: Record<MedicalRecordStatus, string> = {
  Inativado: "bg-danger-subtle text-danger-text border border-danger",
  "Não finalizado": "bg-primary-subtle text-primary-text border border-primary-color",
  Finalizado: "bg-success-subtle text-success border border-success",
};

const DotStatus: Record<MedicalRecordStatus, string> = {
  Inativado: "bg-danger",
  "Não finalizado": "bg-primary-color",
  Finalizado: "bg-success",
};

export function MedicalRecordHistory({ reloadKey }: MedicalRecordHistoryProps): JSX.Element {
  const navigate = useNavigate();

  const [items, setItems] = useState<MedicalRecordDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlyPending, setOnlyPending] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    fetchMedicalRecords()
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

  // Derivado direto: não precisa de um segundo estado + useEffect para sincronizar.
  const visible = useMemo(
    () => (onlyPending ? items.filter((p) => p.status === "Não finalizado") : items),
    [items, onlyPending],
  );

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2">
        <span className="text-xs text-text-secondary tabular-nums">
          {visible.length} {visible.length === 1 ? "consulta" : "consultas"}
        </span>
        <button
          type="button"
          aria-pressed={onlyPending}
          onClick={() => setOnlyPending((v) => !v)}
          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium focus-visible:outline-2 ${
            onlyPending
              ? "border-primary-color bg-primary-subtle text-primary-text"
              : "border-border text-text-secondary hover:bg-surface-alt"
          }`}
        >
          Só não finalizados
        </button>
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
      ) : visible.length === 0 ? (
        <p className="p-4 text-center text-sm text-text-muted">Nenhum prontuário encontrado</p>
      ) : (
        <ol className="relative my-2 ml-4 mr-2 border-l border-border">
          {visible.map((item) => (
            <li key={item.id} className="relative pl-2">
              <span
                aria-hidden
                className={`absolute -left-[5px] top-4 size-2.5 rounded-full ring-2 ring-surface ${DotStatus[item.status]}`}
              />
              {item.status === "Não finalizado" ? (
                <Button
                  variant="ghost"
                  className="h-auto min-h-0 w-full justify-start rounded-md px-2 py-1.5 text-left"
                  onPress={() => navigate("/medico/prontuario", { state: { prontuario: item } })}
                  aria-label={`Continuar ${item.tipoConsulta} de ${item.date}`}
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
      <span className="w-full truncate text-sm font-semibold text-text-primary">{item.tipoConsulta}</span>
      <span className="flex items-center gap-2 text-xs tabular-nums text-text-secondary">
        {item.date}
        <span className={`rounded-full px-2 py-px font-semibold ${BadgeStatus[item.status]}`}>
          {item.status}
        </span>
      </span>
    </span>
  );
}