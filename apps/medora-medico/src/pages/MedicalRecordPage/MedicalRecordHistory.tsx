import { Button, Spinner } from "@heroui/react";
import { useEffect, useState, type JSX } from "react";
import { MedicalRecordModal } from "./MedicalRecordModal";
import type { MedicalRecordDTO, MedicalRecordStatus } from "../../api/dtos/MedicalRecord/MedicalRecordDTO";
import { fetchProntuarios as fetchMedicalRecords } from "./MedicalRecord";
import { useNavigate } from "react-router";
import { ArrowRight } from "lucide-react";

interface MedicalRecordHistoryProps {
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

const BadgeStatus: Record<MedicalRecordStatus, string> = {
  "Inativado": "bg-danger-subtle text-danger-text border border-danger",
  "Não finalizado": "bg-primary-subtle text-primary-text border border-primary-color",
  "Finalizado": "bg-success-subtle text-success border border-success"
}

export function MedicalRecordHistory({
  setError,
}: MedicalRecordHistoryProps): JSX.Element {

  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const [prontuariosAnteriores, setProntuariosAnteriores] = useState<
    MedicalRecordDTO[]
  >([]);

  const load = async () => {
    setIsLoading(true);
    try {
      setProntuariosAnteriores(await fetchMedicalRecords());
    } catch (e: unknown) {
      setError("Ocorreu um erro ao buscar os prontuários anteriores");
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="px-2 border-r-4 border-border">
      <div className="px-6 py-5 border-b border-border sticky top-0 bg-surface">
        <h2 className="text-2xl font-bold text-text-primary text-center">
          Histórico
        </h2>
      </div>

      {isLoading ? (
        <div className="w-20 flex flex-col mx-auto mt-10">
          <p className="text-text-muted">Carregando</p>
          <div className="flex justify-around mt-4">
            <div className="animate-spin w-8">
              <Spinner className="w-fit mx-auto" />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 p-2 overflow-y-auto w-full md:w-80">
          {prontuariosAnteriores.length < 1 ? (
            <p className="w-full text-center text-muted mt-5">
              Nenhum prontuário encontrado
            </p>
          ) : (
            <>
              {prontuariosAnteriores.map((prontuario) => (
                <div
                  key={prontuario.id}
                  className="p-3 grid grid-cols-[1fr_auto] grid-rows-3 gap-x-4 w-full bg-surface-alt rounded-sm shadow font-semibold focus-visible:outline-2 focus-visible:ring-offset-1"
                >
                  <span className="col-start-1 row-start-1 text-[18px] self-center">
                    {prontuario.tipoConsulta}
                  </span>

                  <div className="col-start-2 row-span-2 flex items-center">
                    {prontuario.status !== "Não finalizado" ?
                      <MedicalRecordModal medicalRecord={prontuario} /> :
                      <div>
                        <Button className="col-span-1 row-span-2 my-auto hover:scale-105 transition-transform justify-self-end rounded-lg" type="button" onClick={() => navigate("/medico/prontuario", { state: { prontuario } })}>
                          <ArrowRight />
                        </Button>
                      </div>}
                  </div>

                  <span className="col-start-1 row-start-2 text-text-secondary self-center">
                    Data: {prontuario.date}
                  </span>

                  <span className={`col-start-1 row-start-3 w-[60%] text-center rounded-2xl ${BadgeStatus[prontuario.status]}`}>{prontuario.status}</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </section>
  );
}
