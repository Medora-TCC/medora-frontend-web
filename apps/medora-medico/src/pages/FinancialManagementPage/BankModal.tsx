import { useState } from "react";
import { Modal } from "@heroui/react";
import { Wallet, Building, Loader2 } from "lucide-react";

const banks = [
  "Banco do Brasil",
  "Bradesco",
  "Caixa Econômica Federal",
  "Itaú",
  "Nubank",
  "Santander",
  "Sicoob",
  "Sicredi",
  "XP Investimentos",
];

interface BankData {
  banco: string;
  cpfCnpj: string;
  titular: string;
  agencia: string;
  conta: string;
}

interface BankAccountModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function BankAccountModal({ isOpen, onOpenChange }: BankAccountModalProps) {
  const [tipoConta, setTipoConta] = useState<"corrente" | "poupança">("corrente");
  const [saving, setSaving] = useState(false);
  const [bankData, setBankData] = useState<BankData>({
    banco: "",
    cpfCnpj: "",
    titular: "",
    agencia: "",
    conta: "",
  });

  function handleField(field: keyof BankData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setBankData((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleSave() {
    setSaving(true);
    // TODO: await api.post('/financeiro/dados-bancarios', { ...bankData, tipoConta })
    setTimeout(() => {
      setSaving(false);
      onOpenChange(false);
    }, 1500);
  }

  const isCorrente = tipoConta === "corrente";

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
            aria-label="Dados de Recebimento"
            className="bg-[#1C1C1E] border border-[#3A3A3C] rounded-2xl shadow-2xl"
          >
            <Modal.CloseTrigger className="rounded-lg border border-[#3A3A3C] bg-[#2C2C2E] text-[#9CA3AF] hover:bg-[#3A3A3C] transition-colors" />

            <Modal.Header className="border-b border-[#2C2C2E] px-5 py-4">
              <Modal.Heading className="text-base font-bold text-[#F5F5F7]">
                Dados de Recebimento
              </Modal.Heading>
            </Modal.Header>

            <Modal.Body className="px-5 py-4 flex flex-col gap-4">

              <div className="flex bg-[#2C2C2E] rounded-xl p-1 gap-1">
                <TabButton
                  active={isCorrente}
                  onClick={() => setTipoConta("corrente")}
                  activeColor="#00E5A0"
                  icon={<Wallet size={14} />}
                  label="Conta Corrente"
                />
                <TabButton
                  active={!isCorrente}
                  onClick={() => setTipoConta("poupança")}
                  activeColor="#FF5252"
                  icon={<Building size={14} />}
                  label="Conta Poupança"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <FieldWrapper label="Banco">
                  <select
                    value={bankData.banco}
                    onChange={handleField("banco")}
                    className="w-full px-3 py-2 rounded-lg text-[13px] bg-[#2C2C2E] border border-[#3A3A3C] text-[#F5F5F7] outline-none cursor-pointer appearance-none"
                  >
                    <option value="">Selecione…</option>
                    {banks.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </FieldWrapper>

                <FieldWrapper label="CPF / CNPJ do Titular">
                  <DarkInput
                    type="text"
                    placeholder="000.000.000-00"
                    value={bankData.cpfCnpj}
                    onChange={handleField("cpfCnpj")}
                  />
                </FieldWrapper>
              </div>

              <FieldWrapper label="Nome Completo do Titular">
                <DarkInput
                  type="text"
                  placeholder="Como no documento oficial"
                  value={bankData.titular}
                  onChange={handleField("titular")}
                />
              </FieldWrapper>

              <div className="grid grid-cols-2 gap-2.5">
                <FieldWrapper label="Agência (sem dígito)">
                  <DarkInput
                    type="text"
                    placeholder="0000"
                    value={bankData.agencia}
                    onChange={handleField("agencia")}
                  />
                </FieldWrapper>
                <FieldWrapper label="Conta com dígito">
                  <DarkInput
                    type="text"
                    placeholder="00000-0"
                    value={bankData.conta}
                    onChange={handleField("conta")}
                  />
                </FieldWrapper>
              </div>
            </Modal.Body>

            <Modal.Footer className="border-t border-[#2C2C2E] px-5 py-3 flex justify-between items-center">
              <button
                slot="close"
                disabled={saving}
                className="bg-transparent border-none text-[#9CA3AF] text-[13px] font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2 rounded-[9px] text-[13px] font-semibold text-[#F5F5F7] bg-[#2C2C2E] border border-[#3A3A3C] cursor-pointer hover:bg-[#3A3A3C] transition-colors disabled:opacity-80 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Vinculando…
                  </>
                ) : (
                  "Vincular Conta"
                )}
              </button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

function TabButton({
  active,
  onClick,
  activeColor,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  activeColor: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{ color: active ? activeColor : "#6B7280" }}
      className={[
        "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border-none cursor-pointer transition-all duration-150",
        active ? "bg-[#3A3A3C]" : "bg-transparent",
      ].join(" ")}
    >
      {icon}
      {label}
    </button>
  );
}

function FieldWrapper({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="block text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

function DarkInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2 rounded-lg text-[13px] bg-[#2C2C2E] border border-[#3A3A3C] text-[#F5F5F7] outline-none placeholder-[#6B7280] box-border"
    />
  );
}
