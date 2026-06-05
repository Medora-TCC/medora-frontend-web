import { PrescricaoWizard } from "./PrescriptionWizard";

export function PrescriptionPage() {

  return (<section>
    <PrescricaoWizard
  onConcluir={(rascunho) => console.log(rascunho)}
  onCancelar={() => {}}
/>
  </section>)
}
