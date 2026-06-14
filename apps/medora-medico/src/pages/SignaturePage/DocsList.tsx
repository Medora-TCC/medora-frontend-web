export const DocsList = () => {
  return (
    <section className="">
      <h2 className="font-semibold text-lg text-center">Documentos pendentes</h2>
      <section>
        <div className="grid grid-cols-[55%_45%] grid-rows-2 gap-4 m-4 py-4 px-4 bg-surface-secondary">
          <div>Prescrição médica</div>
          <div>Assinatura pendente </div>
          <div className="truncate">Paciente: Joãozinho da silva</div>
          <div>14/06/2026</div>
        </div>
      </section>
    </section>)
}