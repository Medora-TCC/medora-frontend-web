import { Button } from "@heroui/react";
import { ClipboardPlus } from "lucide-react";
import { useNavigate } from "react-router";


export default function EnterConsultaButton() {
    const navigate = useNavigate();

  return (
  <>
      <Button
        size="sm"
        variant="primary"
        onPress={() => navigate('../prontuario')
        }
        className="shrink-0"
      >
      <ClipboardPlus  />
        Prontuário
      </Button>
  </>
  )
}