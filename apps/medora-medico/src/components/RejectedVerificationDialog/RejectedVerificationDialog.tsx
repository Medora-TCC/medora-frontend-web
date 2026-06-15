import { Button } from "@heroui/react";
import { AlertTriangle } from "lucide-react";

interface RejectedVerificationDialogProps {
  isOpen: boolean;
  reason: string;
  onReview: () => void;
}

export default function RejectedVerificationDialog({ isOpen, reason, onReview }: Readonly<RejectedVerificationDialogProps>) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface rounded-2xl border border-divider shadow-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="text-red-600" size={24} />
          </div>
          <h2 className="text-lg font-bold text-text-primary">Verificação não aprovada</h2>
        </div>

        <p className="text-text-muted text-sm">{reason}</p>

        <div className="flex justify-end">
          <Button className="bg-primary-color text-white font-bold" onPress={onReview}>
            Revisar meus dados
          </Button>
        </div>
      </div>
    </div>
  );
}
