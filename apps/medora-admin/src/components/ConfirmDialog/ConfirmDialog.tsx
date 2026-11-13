import { Button, Modal } from "@heroui/react";
import { AlertTriangle, HelpCircle } from "lucide-react";
import type { ConfirmOptions } from "./useConfirm";

const TONE = {
  danger: { icon: "bg-danger-subtle text-danger-text", button: "bg-danger text-white" },
  primary: { icon: "bg-primary-subtle text-primary-text", button: "bg-primary-color text-white" },
};

interface ConfirmDialogProps {
  options: ConfirmOptions | null;
  onResolve: (confirmed: boolean) => void;
}

export default function ConfirmDialog({ options, onResolve }: ConfirmDialogProps) {
  const tone = TONE[options?.tone ?? "primary"];
  const Icon = options?.tone === "danger" ? AlertTriangle : HelpCircle;

  return (
    <Modal isOpen={options !== null} onOpenChange={(open) => { if (!open) onResolve(false); }}>
      <Modal.Backdrop variant="blur">
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-md">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Icon className={tone.icon}>
                <Icon className="size-5" />
              </Modal.Icon>
              <Modal.Heading>{options?.title}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p className="text-sm text-text-secondary">{options?.description}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="outline" onPress={() => onResolve(false)}>
                {options?.cancelLabel ?? "Cancelar"}
              </Button>
              <Button className={tone.button} onPress={() => onResolve(true)}>
                {options?.confirmLabel ?? "Confirmar"}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}