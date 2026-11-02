import { useEffect, useState } from "react";
import { Modal } from "@heroui/react";
import { Loader2 } from "lucide-react";
import { saveMyPixKey } from "../../api/services/PayoutService";
import { errorMessage } from "../../api/errors";
import type { PixKeyDto, PixKeyType } from "../../api/dtos/Payouts/PayoutDto";

const keyTypes: { value: PixKeyType; label: string; placeholder: string }[] = [
  { value: "Random", label: "Chave aleatória", placeholder: "00000000-0000-0000-0000-000000000000" },
  { value: "Cnpj", label: "CNPJ", placeholder: "00.000.000/0000-00" },
];

interface PixKeyModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  current: PixKeyDto | null;
  onSaved: (pixKey: PixKeyDto) => void;
}

export function PixKeyModal({ isOpen, onOpenChange, current, onSaved }: PixKeyModalProps) {
  const [type, setType] = useState<PixKeyType>("Random");
  const [key, setKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setType(current?.type ?? "Random");
    setKey("");
    setError(null);
  }, [isOpen, current]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      onSaved(await saveMyPixKey(type, key));
      onOpenChange(false);
    } catch (e) {
      setError(errorMessage(e, "Erro ao salvar a chave Pix."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop
        variant="blur"
        isDismissable={!saving}
        isKeyboardDismissDisabled={saving}
        className="bg-black/65"
      >
        <Modal.Container placement="center" size="md">
          <Modal.Dialog
            aria-label="Chave Pix"
            className="bg-surface border border-ring rounded-2xl shadow-2xl"
          >
            <Modal.CloseTrigger className="rounded-lg border border-ring bg-surface-overlay text-text-muted hover:bg-text-primary transition-colors" />

            <Modal.Header className="border-b border-ring px-5 py-4">
              <Modal.Heading className="text-base font-bold text-text-primary">
                Chave Pix
              </Modal.Heading>
            </Modal.Header>

            <Modal.Body className="px-5 py-4 flex flex-col gap-4">
              <p className="m-0 text-xs text-text-secondary">
                Seus repasses são enviados para esta chave, que precisa estar em seu nome.
                Aceitamos só chave aleatória ou CNPJ, para não expor seus dados pessoais.
              </p>

              {current && (
                <p className="m-0 text-xs text-text-secondary">
                  Chave atual: <strong className="text-text-primary">{current.maskedKey}</strong>
                </p>
              )}

              <label className="flex flex-col gap-1.5 text-[11px] font-semibold text-text-primary uppercase tracking-wide">
                Tipo da chave
                <select
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value as PixKeyType);
                    setKey("");
                  }}
                  className="w-full px-3 py-2 rounded-lg text-[13px] font-normal normal-case bg-surface-alt border border-ring text-text-primary outline-none cursor-pointer"
                >
                  {keyTypes.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-[11px] font-semibold text-text-primary uppercase tracking-wide">
                {current ? "Nova chave" : "Chave"}
                <input
                  type="text"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder={keyTypes.find((option) => option.value === type)?.placeholder}
                  className="w-full px-3 py-2 rounded-lg text-[13px] font-normal normal-case bg-surface-alt border border-ring text-text-secondary outline-none placeholder-text-muted box-border"
                />
              </label>

              {error && (
                <p className="m-0 px-3 py-2 rounded-lg text-[13px] bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]">
                  {error}
                </p>
              )}
            </Modal.Body>

            <Modal.Footer className="border-t border-ring px-5 py-3 flex justify-between items-center">
              <button
                slot="close"
                disabled={saving}
                className="bg-transparent border-none text-text-primary text-[13px] font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>

              <button
                onClick={handleSave}
                disabled={saving || !key.trim()}
                className="flex items-center gap-1.5 px-5 py-2 rounded-[9px] text-[13px] font-semibold text-[#F5F5F7] bg-accent border border-ring cursor-pointer hover:bg-accent/50 transition-colors disabled:opacity-80 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Salvando…
                  </>
                ) : (
                  "Salvar chave"
                )}
              </button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
