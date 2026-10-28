import { Button } from "@heroui/react";
import { Video } from "lucide-react";
import { enterConsulta } from "../../pages/ConsultaScreen/ConsultaHelpers";
import { useNavigate } from "react-router";


interface EnterButtonProps {
  isJoinable: boolean;
  id: number | null | undefined;
}

export default function EnterConsultaButton({ isJoinable, id }: EnterButtonProps) {
  const navigate = useNavigate();

  const disabled = !isJoinable || id == null;

  function handleEnter() {
    if (id == null) return;
    enterConsulta(id, navigate);
  }
  return (
    <span
      title={disabled ? "Disponível próximo ao horário da consulta" : "Entrar na teleconsulta"}
      className="inline-flex"
    >
      <Button
        size="sm"
        variant={disabled ? "secondary" : "primary"}
        isDisabled={disabled}
        onPress={handleEnter}
        className="shrink-0"
      >
        <Video className="size-4" />
        Entrar
      </Button>
    </span>
  );
}