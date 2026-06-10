import { useEffect, useRef, useState } from "react";
import { Spinner, toast, ToastProvider } from "@heroui/react";
import { ModalConfirmacao } from "@medora_web/shared";
import { RichTextEditor, type RichTextEditorRef } from "../../components/RichTextEditor/RichTextEditor";
import { type MedicalRecordDTO } from "../../api/dtos/MedicalRecord/MedicalRecordDTO";
import { fetchProntuarios } from "./MedicalRecord";
import { MedicalRecordModal } from "./MedicalRecordModal";

export function MedicalRecordPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [prontuariosAnteriores, setProntuariosAnteriores] = useState<
    MedicalRecordDTO[]
  >([]);
  const [text, setText] = useState<string>("");
  const [isEmpty, setIsEmpty] = useState<boolean>(true);

  const editorRef = useRef<RichTextEditorRef>(null);

  const paciente = {
    id: "pac-123",
    nome: "João da Silva",
    idade: "56 Anos",
    dataNascimento: "12/12/1970",
  };

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

  useEffect(() => {
    load();
  }, []);

  const SalvarProntuario = async () => {
    if (text.length < 1) {
      toast.danger("O prontuário não pode estar vazio!");
      return;
    }

    const novoProntuario: Omit<MedicalRecordDTO, "id"> = {
      tipoConsulta: "Consulta cardiológica",
      pacientId: "pac-123",
      doctorId: "doc-456",
      medicalRecord: text,
      date: new Date().toLocaleDateString('pt-BR', {
        timeZone: 'America/Sao_Paulo'
      }),
      status: "Finalizado"
    }

    toast.promise(
      fetch("/api/prontuario", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoProntuario)
      }).then(() => load()),
      {
        error: "Falha ao salvar.",
        loading: "Salvando...",
        success: "Salvo com sucesso!",
      },
    );

    editorRef.current?.clear();

    setText("");
  };

  return (
    <section className="w-full max-h-[90vh] min-h-full bg-surface overflow-hidden flex flex-col">
      <ToastProvider
        maxVisibleToasts={1}
        placement="bottom end"
        aria-live="assertive"
      />
      <section className="w-full px-6 py-4 shrink-0 z-10 font-semibold border-b-[3px] border-border">
        <section className="flex flex-col">
          <span className="text-[20px] truncate">{paciente.nome}</span>

          <div className="flex flex-row gap-2">
            <span className="">{paciente.idade}</span>
            <span className="">Nascimento: {paciente.dataNascimento}</span>
          </div>
        </section>
      </section>

      <section className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <section className="px-2 py-4 border-r-4 border-border">
          <div className="px-6 py-5 border-b border-border sticky top-0 bg-surface">
            <h2 className="text-2xl font-bold text-text-primary">
              Prontuários anteriores
            </h2>
          </div>

          {isLoading ?
            <div className="w-20 flex flex-col mx-auto mt-10">
              <p className="text-text-muted">Carregando</p>
              <div className="flex justify-around mt-4">
                <div className="animate-spin w-8"><Spinner className="w-fit mx-auto" /></div>
              </div>
            </div>
            :
            <div className="flex flex-col gap-4 p-2 overflow-y-auto w-full md:w-80">
              {prontuariosAnteriores.length < 1 ? <p className="w-full text-center text-muted mt-5">Nenhum prontuário encontrado</p> :
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
                  ))
                  }</>}
            </div>

          }
        </section>
        <section className="flex-1 flex flex-col bg-surface-alt py-4 pb-4">
          <div className="flex justify-between px-4 pt-2 pb-4">
            <h2 className="text-2xl font-bold text-text-primary">
              Novo prontuário
            </h2>
          </div>
          <div className="h-[78%] max-h-[78%] overflow-hidden">
            <RichTextEditor ref={editorRef} setText={setText} setIsEmpty={setIsEmpty} />
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
