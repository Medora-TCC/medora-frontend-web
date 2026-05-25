import { Button } from "@heroui/react";
import { Video } from "lucide-react";
import { enterConsulta } from "../../pages/ConsultaScreen/ConsultaHelpers";
import { useNavigate } from "react-router";

interface EnterButtonProps{
  isJoinable: boolean | false;
  id: string | null;
}


export default function EnterConsultaButton({ isJoinable, id }: EnterButtonProps) {
    const navigate = useNavigate();

  return (
  <>
    {isJoinable ? (
      <Button
        size="sm"
        variant="primary"
        onPress={() => id != null ? enterConsulta(id, navigate) : console.log("Null consulta ID")
        }
        className="shrink-0"
      >
      <Video />
        Entrar
      </Button>
    ) : (
      <Button
        size="sm"
        variant="secondary"
        isDisabled
        className="shrink-0"
      >
        <Video />
        Iniciar
      </Button>

    )}
  </>
  )
}