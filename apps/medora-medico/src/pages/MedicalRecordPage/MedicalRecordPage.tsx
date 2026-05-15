import { useEffect, useState } from "react";
import { Button, toast, ToastProvider } from "@heroui/react";
import { ArrowRight } from "lucide-react";
import { ModalConfirmacao } from "@medora_web/shared";
import { RichTextEditor } from "../../components/RichTextEditor/RichTextEditor";
import { type MedicalRecordDTO } from "../../api/dtos/MedicalRecord/MedicalRecordDTO";
import { fetchProntuarios } from "./MedicalRecord";

export function MedicalRecordPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [prontuariosAnteriores, setProntuariosAnteriores] = useState<
    MedicalRecordDTO[]
  >([]);
  const [text, setText] = useState<string>("");
  const [isEmpty, setIsEmpty] = useState<boolean>(true);

  const paciente = {
    id: "pac-123",
    nome: "João da Silva",
    idade: "56 Anos",
    dataNascimento: "12/12/1970",
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        setProntuariosAnteriores(await fetchProntuarios());
      } catch (e: unknown) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const SalvarProntuario = () => {
    if (!text.trim()) {
      toast.danger("O prontuário não pode estar vazio!");
      return;
    }

    toast.promise(
      new Promise((resolve) => setTimeout(() => resolve("Ok"), 2000)),
      {
        error: "Falha ao salvar.",
        loading: "Salvando...",
        success: "Salvo com sucesso!",
      },
    );

    setText("");
  };

  return (
    <section className="w-full max-h-[90vh] min-h-full bg-surface overflow-hidden flex flex-col">
      <ToastProvider
        maxVisibleToasts={1}
        placement="bottom end"
        aria-live="assertive"
      />
      <section className="w-full px-6 py-4 shrink-0 shadow-md z-10 font-semibold">
        <section className="flex flex-col">
          <span className="text-[20px] truncate">{paciente.nome}</span>

          <div className="flex flex-row gap-2">
            <span className="">{paciente.idade}</span>
            <span className="">Nascimento: {paciente.dataNascimento}</span>
          </div>
        </section>
      </section>

      <section className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <section className="px-2 py-4 border-r">
          <div className="px-6 py-5 border-b border-gray-100 sticky top-0 bg-white">
            <h2 className="text-2xl font-bold text-gray-800">
              Prontuários anteriores
            </h2>
          </div>

          {isLoading ? <></> : <div className="flex flex-col gap-4 p-2 overflow-y-auto w-full md:w-80">
            {prontuariosAnteriores.map((prontuario) => (
              <div
                key={prontuario.id}
                className="p-2 grid grid-cols-[70%_20%] grid-rows-2 gap-x-4 w-full bg-surface-alt rounded-lg shadow font-semibold align-middle focus-visible:outline-2 focus-visible:ring-offset-1"
              >
                <span className="col-span-1 text-[18px] ">
                  {prontuario.tipoConsulta}
                </span>
                <Button className="col-span-1 row-span-2 my-auto hover:scale-105 transition-transform justify-self-end">
                  <ArrowRight />
                </Button>
                <span className="col-span-1 row-span-1 text-gray-700">
                  Data: {prontuario.date}
                </span>
              </div>
            ))}
          </div>

          }
        </section>
        <section className="flex-1 flex flex-col bg-gray-50 py-4 pb-4">
          <div className="flex justify-between px-4 pt-2 pb-4">
            <h2 className="text-2xl font-bold text-gray-700">
              Novo prontuário
            </h2>
          </div>
          <div className="h-[78%] max-h-[78%] overflow-hidden">
            <RichTextEditor setText={setText} setIsEmpty={setIsEmpty} />
          </div>
          <div className="mt-4 p-4 w-full flex justify-end ">
            <ModalConfirmacao
              onConfirm={SalvarProntuario}
              disabled={isEmpty}
              texto="Deseja mesmo salvar? ATENÇÃO: Após salvo o prontuário não pode mais ser alterado"
            />
          </div>
        </section>
      </section>
    </section>
  );
}
