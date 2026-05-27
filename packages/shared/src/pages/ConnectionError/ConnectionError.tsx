import { Button } from "@heroui/react";
import { JSX } from "react";
import { useNavigate } from "react-router";

export function ConnectionErrorPage(): JSX.Element {

    const navigate = useNavigate();

    return (
        <div className="bg-surface w-full max-w-md rounded-2xl shadow-xs border border-border p-4 mx-2 md:p-8 md:mx-0 flex flex-col gap-4 items-center text-center">
            <div className="flex flex-col gap-2 w-full">
                <h1 className="text-2xl font-bold text-warning mx-auto">
                    Erro ao comunicar com o servidor
                </h1>
                <p className="text-muted-foreground opacity-80 leading-relaxed">
                    Ops, algo deu errado. Estamos passando por problemas internos. Por favor tente novamente mais tarde. Se o problema persistir, contate o suporte.
                </p>
                <Button className="mx-auto" size="lg" onClick={() => navigate("/")}>Voltar para home</Button>
            </div>
        </div>);
}