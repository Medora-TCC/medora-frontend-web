import { useState } from "react";
import { ToastProvider } from "@heroui/react";
import { MedicalRecordHistory } from "./MedicalRecordHistory";
import { MedicalRecordComponent } from "./MedicalRecordComponent";

export function MedicalRecordPage() {
  const [error, setError] = useState<string | null>(null);

  const paciente = {
    id: "pac-123",
    nome: "João da Silva",
    idade: "56 Anos",
    dataNascimento: "12/12/1970",
  };

  console.log(error)

  return (
    <section className="w-full max-h-[90vh] h-full bg-surface overflow-hidden flex flex-col">
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

      <section className="flex h-full flex-col md:flex-row flex-1 overflow-hidden">
        <MedicalRecordHistory setError={setError} />
        <MedicalRecordComponent setError={setError} />
      </section>
    </section>
  );
}
