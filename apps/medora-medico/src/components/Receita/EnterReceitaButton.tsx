import { Button } from "@heroui/react";
import { FileUser } from "lucide-react";
import { useNavigate } from "react-router";
import type { PrescriptionNavigationState } from "../../pages/PrescriptionPage/PrescriptionPage";

interface EnterReceitaButtonProps {
  appointmentId?: number | string;
  state?: PrescriptionNavigationState;
}

export default function EnterReceitaButton({ appointmentId, state }: EnterReceitaButtonProps) {
  const navigate = useNavigate();

  return (
    <Button
      variant="primary"
      size="sm"
      className="shrink-0"
      onPress={() => navigate(appointmentId ? `/medico/prescricao/${appointmentId}` : "/medico/prescricao", { state })}
    >
      <FileUser />
      Receita
    </Button>
  );
}
