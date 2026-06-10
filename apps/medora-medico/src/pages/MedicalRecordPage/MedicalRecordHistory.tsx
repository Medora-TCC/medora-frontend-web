import { Spinner } from "@heroui/react";
import { useEffect, useState, type JSX } from "react";
import { MedicalRecordModal } from "./MedicalRecordModal";
import type { MedicalRecordDTO } from "../../api/dtos/MedicalRecord/MedicalRecordDTO";
import { fetchProntuarios as fetchMedicalRecords } from "./MedicalRecord";

interface MedicalRecordHistoryProps {
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export function MedicalRecordHistory({
  setError,
}: MedicalRecordHistoryProps): JSX.Element {
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
    <section className="px-2 py-4 border-r-4 border-border">
      <div className="px-6 py-5 border-b border-border sticky top-0 bg-surface">
        <h2 className="text-2xl font-bold text-text-primary">
          Prontuários anteriores
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
                  className="p-2 grid grid-cols-[70%_20%] grid-rows-2 gap-x-4 w-full bg-surface-alt rounded-sm shadow font-semibold align-middle focus-visible:outline-2 focus-visible:ring-offset-1"
                >
                  <span className="col-span-1 text-[18px] ">
                    {prontuario.tipoConsulta}
                  </span>
                  <MedicalRecordModal medicalRecord={prontuario} />
                  <span className="col-span-1 row-span-1 text-text-secondary">
                    Data: {prontuario.date}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </section>
  );
}
