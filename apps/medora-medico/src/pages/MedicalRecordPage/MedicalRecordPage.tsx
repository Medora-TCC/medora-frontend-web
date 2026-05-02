import { useRef } from "react"
import { Button, toast, ToastProvider } from "@heroui/react";
import { ArrowRight } from "lucide-react";
import { ModalConfirmacao } from "../../components/ModalConfirmacao";

export function MedicalRecordPage() {

    const prontuarioRef = useRef<HTMLTextAreaElement>(null);

    const SalvarProntuario = () => {
        toast.promise(new Promise((resolve) => setTimeout(() => resolve("Ok"), 2000)), { error: "Falha ao salvar.", loading: "Salvando...", success: "Salvo com sucesso!" })
        // Aqui envia a requisição para o backend...
    }

    return (
        <section className="w-full min-h-screen max-h-screen bg-surface overflow-hidden flex flex-col">
            <ToastProvider maxVisibleToasts={1} placement="bottom end" />
            <section className="w-full px-6 py-4 flex flex-wrap gap-8 bg-gray-600 shrink-0 shadow-md z-10">
                <div className="flex flex-col">
                    <span className="text-gray-300 text-xs font-semibold uppercase tracking-wider">Paciente</span>
                    <span className="text-white truncate">João da Silva</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-gray-300 text-xs font-semibold uppercase tracking-wider">Idade</span>
                    <span className="text-white">56 Anos</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-gray-300 text-xs fo nt-semibold uppercase tracking-wider">Data de nascimento</span>
                    <span className="text-white">12/12/1970</span>
                </div>
            </section>

            <section className="flex flex-col md:flex-row flex-1 overflow-hidden">
                <section className="col-span-1 px-2 py-4 border-r">
                    <div className="px-6 py-5 border-b border-gray-100 sticky top-0 bg-white">
                        <h2 className="text-2xl font-bold text-gray-800">Prontuários anteriores</h2>
                    </div>

                    <div className="flex flex-col gap-4 px-2">
                        <div className="p-2 flex justify-between w-full bg-surface-alt rounded-md">Data: 22/02/2026 <Button><ArrowRight /></Button></div>
                    </div>
                </section>
                <section className="flex-1 flex flex-col bg-gray-50 overflow-hidden py-4 pb-4">
                    <div className="flex justify-between px-4 pt-2 pb-4">
                        <h2 className="text-2xl font-bold text-gray-700">Novo prontuário</h2>
                        <ModalConfirmacao onConfirm={SalvarProntuario} texto="Deseja mesmo salvar? ATENÇÃO: Após salvo o prontuário não pode mais ser alterado"/>
                    </div>
                    <textarea
                        name="novoProntuario"
                        id="novoProntuario"
                        ref={prontuarioRef}
                        className="flex-1 w-full bg-white border border-gray-300 rounded-xl p-4 resize-none shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-300 transition-shadow text-gray-700" />
                </section>
            </section>
        </section>
    )
}