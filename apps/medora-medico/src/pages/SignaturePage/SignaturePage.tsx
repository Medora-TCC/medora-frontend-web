import { lazy, Suspense } from "react";
import { DocsList } from "./DocsList";
import { Spinner } from "@heroui/react";
import { ModalConfirmacao } from "@medora_web/shared";
const PDFViewer = lazy(() => import('./PDFViewer'));

export function SignaturePage() {
  return (
    <section>
      <h1 className="text-text-primary text-xl font-semibold text-center py-4">Assinatura</h1>
      <section className="grid grid-cols-[40%_60%] grid-rows[90%_10%]">
        <DocsList />
        <Suspense fallback={<Spinner size="md" />}>
          <div className="w-full min-w-0">
            <PDFViewer documentUrl={"/Curriculo.pdf"} />
          </div>
        </Suspense>
        <ModalConfirmacao onConfirm={() => {}} disabled={false} texto={"Deseja assinar o documento ?"} textoBotao={"Assinar"} />
      </section>
    </section>)
}