import { useState } from "react"
import { Button, toast, ToastProvider } from "@heroui/react";
import { ArrowRight } from "lucide-react";
import { ModalConfirmacao } from "@medora_web/shared";

export function MedicalRecordPage() {

    const paciente = {
        nome: "João da Silva",
        idade: "56 Anos",
        dataNascimento: "12/12/1970"
    };

    const prontuariosAnteriores = [
        { id: 1, data: "22/02/2026" },
        { id: 2, data: "15/01/2026" }
    ];

    const [novoProntuario, setNovoProntuario] = useState("")

    const SalvarProntuario = () => {

        if (!novoProntuario.trim()) {
            toast.danger("O prontuário não pode estar vazio!")
            return;
        }

        toast.promise(new Promise((resolve) => setTimeout(() => resolve("Ok"), 2000)), { error: "Falha ao salvar.", loading: "Salvando...", success: "Salvo com sucesso!" })
        // Aqui envia a requisição para o backend...

        setNovoProntuario("")
    }

    return (
        <section className="w-full min-h-screen max-h-screen bg-surface overflow-hidden flex flex-col">
            <ToastProvider maxVisibleToasts={1} placement="bottom end" />
            <section className="w-full px-6 py-4 flex flex-wrap gap-8 bg-gray-600 shrink-0 shadow-md z-10">
                <div className="flex flex-col">
                    <span className="text-gray-300 text-xs font-semibold uppercase tracking-wider">Paciente</span>
                    <span className="text-white truncate">{paciente.nome}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-gray-300 text-xs font-semibold uppercase tracking-wider">Idade</span>
                    <span className="text-white">{paciente.idade}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-gray-300 text-xs font-semibold uppercase tracking-wider">Data de nascimento</span>
                    <span className="text-white">{paciente.dataNascimento}</span>
                </div>
            </section>

            <section className="flex flex-col md:flex-row flex-1 overflow-hidden">
                <section className="px-2 py-4 border-r">
                    <div className="px-6 py-5 border-b border-gray-100 sticky top-0 bg-white">
                        <h2 className="text-2xl font-bold text-gray-800">Prontuários anteriores</h2>
                    </div>

                    <div className="flex flex-col gap-4 p-2 overflow-y-auto w-full md:w-80">
                        {prontuariosAnteriores.map((prontuario) => (
                            <div key={prontuario.id} className="p-2 flex justify-between w-full bg-surface-alt rounded-lg shadow font-semibold align-middle">
                                <span className="my-auto">Data: {prontuario.data}</span>
                                <Button className="hover:scale-105 transition-transform"><ArrowRight /></Button>
                            </div>
                        ))}
                    </div>
                </section>
                <section className="flex-1 flex flex-col bg-gray-50 overflow-hidden py-4 pb-4">
                    <div className="flex justify-between px-4 pt-2 pb-4">
                        <h2 className="text-2xl font-bold text-gray-700">Novo prontuário</h2>
                        <ModalConfirmacao
                            onConfirm={SalvarProntuario}
                            texto="Deseja mesmo salvar? ATENÇÃO: Após salvo o prontuário não pode mais ser alterado"
                        />
                    </div>
                    <textarea
                        name="novoProntuario"
                        id="novoProntuario"
                        aria-label="Escreva o novo prontuário médico aqui"
                        value={novoProntuario}
                        onChange={(e) => setNovoProntuario(e.target.value)}
                        placeholder="Descreva as observações clínicas do paciente..."
                        className="flex-1 w-full bg-white border border-gray-300 rounded-xl p-4 resize-none shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-300 transition-shadow text-gray-700" />
                </section>
            </section>
        </section>
    )
}