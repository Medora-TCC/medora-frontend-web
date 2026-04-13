import notFoundIcon from "../../assets/notFound.svg";
import { Button } from "@heroui/react";

interface NotFoundProps {
  homeUrl: string;
}

export function NotFound() {
  //   const navigate = useNavigate();
  return (
    <div className="bg-surface w-full max-w-md rounded-2xl shadow-xs border border-border p-4 mx-2 md:p-8 md:mx-0 flex flex-col gap-4 items-center text-center">
      <img
        src={notFoundIcon}
        alt="Ilustração de não encontrado"
        className="h-80 w-auto object-contain"
      />
      <div className="flex flex-col gap-2 w-full">
        <h1 className="text-2xl font-bold text-warning mx-auto">
          Não encontrado
        </h1>
        <p className="text-muted-foreground opacity-80 leading-relaxed">
          O recurso que você buscou não foi encontrado.
        </p>
        <Button className="mx-auto" size="lg">Voltar para home</Button>
      </div>
    </div>
  );
}
