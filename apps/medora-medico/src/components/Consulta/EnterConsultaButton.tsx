import { Button } from "@heroui/react";
import { Video } from "lucide-react";
import { enterConsulta } from "../../pages/ConsultaScreen/ConsultaHelpers";
import { useNavigate } from "react-router";


interface EnterButtonProps {
  isJoinable: boolean;
  meetingCode: string | null | undefined;
}

export default function EnterConsultaButton({ isJoinable, meetingCode }: EnterButtonProps) {
  const navigate = useNavigate();

  const disabled = !isJoinable || meetingCode == null;

  function handleEnter() {
    if (meetingCode == null) return;
    enterConsulta(meetingCode, navigate);
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