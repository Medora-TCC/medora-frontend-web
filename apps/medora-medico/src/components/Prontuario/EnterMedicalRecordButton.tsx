import { Button } from "@heroui/react";
import { ClipboardPlus } from "lucide-react";
import { useNavigate } from "react-router";
import type { MedicalRecordNavigationState } from "../../pages/MedicalRecordPage/MedicalRecordPage";

interface EnterMedicalRecordButtonProps {
  appointmentId?: number | string;
  state?: MedicalRecordNavigationState;
}

export default function EnterMedicalRecordButton({ appointmentId, state }: EnterMedicalRecordButtonProps) {
  const navigate = useNavigate();

  return (
    <Button
      size="sm"
      variant="primary"
      onPress={() => navigate(appointmentId ? `/medico/prontuario/${appointmentId}` : "/medico/prontuario", { state })}
      className="shrink-0"
    >
      <ClipboardPlus />
      Prontuário
    </Button>
  );
}
