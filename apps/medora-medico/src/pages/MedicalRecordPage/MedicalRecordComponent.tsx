import { useRef, useState, type JSX } from "react";
import {
  RichTextEditor,
  type RichTextEditorRef,
} from "../../components/RichTextEditor/RichTextEditor";
import { ModalConfirmacao } from "@medora_web/shared";
import { toast } from "@heroui/react";
import type { MedicalRecordDTO } from "../../api/dtos/MedicalRecord/MedicalRecordDTO";
import { useLocation } from "react-router";

interface MedicalRecordComponentProps {
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export function MedicalRecordComponent({
  setError,
}: MedicalRecordComponentProps): JSX.Element {

  var prontuario: MedicalRecordDTO | null = null

  const location = useLocation();
  prontuario = location.state?.prontuario;

  const [text, setText] = useState<string>("");
  const [isEmpty, setIsEmpty] = useState<boolean>(true);

  const editorRef = useRef<RichTextEditorRef>(null);

  const SalvarProntuario = async () => {
    if (text.length < 1) {
      toast.danger("O prontuário não pode estar vazio!");
      return;
    }

    try {
      const novoProntuario: Omit<MedicalRecordDTO, "id"> = {
        tipoConsulta: "Consulta cardiológica",
        pacientId: "pac-123",
        doctorId: "doc-456",
        medicalRecord: text,
        date: new Date().toLocaleDateString("pt-BR", {
          timeZone: "America/Sao_Paulo",
        }),
        status: "Finalizado",
      };

      toast.promise(
        fetch("/api/prontuario", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(novoProntuario),
        }).then(),
        {
          error: "Falha ao salvar.",
          loading: "Salvando...",
          success: "Salvo com sucesso!",
        },
      );
    } catch (e) {
      setError("Erro ao salvar o prontuario");
    }

    editorRef.current?.clear();

    setText("");
  };

  return (
    <section className="flex-1 flex flex-col bg-surface-alt py-4 pb-4">
      <div className="flex justify-between px-4 pt-2 pb-4">
        <h2 className="text-2xl font-bold text-text-primary">
          Novo prontuário
        </h2>
      </div>
      <div className="h-[78%] max-h-[78%] overflow-hidden">
        <RichTextEditor
          ref={editorRef}
          setText={setText}
          setIsEmpty={setIsEmpty}
          content={prontuario === null || prontuario === undefined ? null : prontuario.medicalRecord}
        />
      </div>
      <div className="mt-4 p-4 w-full flex justify-end ">
        <ModalConfirmacao
          onConfirm={SalvarProntuario}
          disabled={isEmpty}
          texto="Deseja mesmo salvar? ATENÇÃO: Após salvo o prontuário não pode mais ser alterado"
        />
      </div>
    </section>
  );
}
