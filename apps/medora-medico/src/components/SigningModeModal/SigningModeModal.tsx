import { useState } from "react";
import { Button, Modal } from "@heroui/react";
import type { SigningMode } from "../../api/services/MedicalRecords";

interface Props {
  isOpen: boolean;
  onConfirm: (mode: SigningMode) => void;
  onCancel: () => void;
  texto: string;
}

const OPCOES: { mode: SigningMode; titulo: string; apoio: string }[] = [
  { mode: "Automatic", titulo: "Assinar automaticamente", apoio: "O sistema assina em segundo plano." },
  { mode: "Manual", titulo: "Assinar depois", apoio: "O documento fica em Assinar Documentos até você assinar." },
];

// O conteúdo só existe enquanto o modal está aberto, então o estado volta
// a "Automatic" a cada abertura.
export function SigningModeModal({ isOpen, ...rest }: Props) {
  return isOpen ? <SigningModeContent {...rest} /> : null;
}

function SigningModeContent({ onConfirm, onCancel, texto }: Omit<Props, "isOpen">) {
  const [mode, setMode] = useState<SigningMode>("Automatic");

  return (
    <Modal>
      <Modal.Backdrop
        isOpen
        onOpenChange={(open) => {
          if (!open) onCancel();
        }}
      >
        <Modal.Container>
          <Modal.Dialog className="bg-surface" aria-label="Escolha da assinatura">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="text-1.5xl font-semibold text-text-primary">{texto}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div role="radiogroup" aria-label="Modo de assinatura" className="flex flex-col gap-3">
                {OPCOES.map((o) => (
                  <label
                    key={o.mode}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${
                      mode === o.mode ? "border-primary-color" : "border-border"
                    }`}
                  >
                    <input
                      type="radio"
                      name="signing-mode"
                      className="mt-1"
                      checked={mode === o.mode}
                      onChange={() => setMode(o.mode)}
                    />
                    <span className="flex flex-col">
                      <span className="text-sm font-medium text-text-primary">{o.titulo}</span>
                      <span className="text-xs text-text-muted">{o.apoio}</span>
                    </span>
                  </label>
                ))}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button size="sm" className="w-full text-text-inverse" onPress={() => onConfirm(mode)}>
                Confirmar
              </Button>
              <Button variant="danger-soft" className="w-full" onPress={onCancel}>
                Cancelar
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
