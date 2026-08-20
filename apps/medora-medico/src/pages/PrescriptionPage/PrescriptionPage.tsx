import { PrescricaoWizard } from "./PrescriptionWizard";

export function PrescriptionPage() {

  return (
    <section className="h-full pt-10">
      <PrescricaoWizard
        onConcluir={(rascunho) => console.log(rascunho)}
        onCancelar={() => { }}
      />
    </section>)
}
