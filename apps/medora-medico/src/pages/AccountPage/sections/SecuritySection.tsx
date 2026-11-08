import { useState } from "react";
import { Button, Input, Spinner } from "@heroui/react";
import { CheckCircle2, KeyRound } from "lucide-react";
import { FieldWrapper, PasswordInput } from "@medora_web/shared";
import { useMainLayout } from "../../../components/MainLayout/mainLayoutContext";
import { requestPasswordReset, resetPassword } from "../../../api/services/Auth";

type Step = "idle" | "code" | "done";

const MIN_PASSWORD_LENGTH = 6;

export default function SecuritySection() {
  const { doctorRqes } = useMainLayout();
  const email = doctorRqes?.email ?? "";

  const [step, setStep] = useState<Step>("idle");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSendCode = async () => {
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      await requestPasswordReset(email);
      setStep("code");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível enviar o código.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(`A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("As senhas não coincidem.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    try {
      await resetPassword(email, code.trim(), newPassword);
      setStep("done");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível alterar a senha.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setStep("idle");
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
    setErrorMessage("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-text-primary">Segurança</h2>
        <p className="text-sm text-text-secondary">Gerencie o acesso à sua conta.</p>
      </div>

      <div className="bg-surface-alt border border-divider rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-divider">
          <KeyRound size={18} className="text-primary-color" />
          <h3 className="font-semibold text-text-primary">Senha</h3>
        </div>

        <div className="p-4 space-y-4">
          {step === "idle" && (
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-text-secondary">
                Enviaremos um código para <span className="font-semibold text-text-primary">{email || "seu e-mail"}</span> para confirmar a alteração.
              </p>
              <Button size="sm" variant="outline" onPress={handleSendCode} isDisabled={!email || isSubmitting}>
                {isSubmitting ? <Spinner color="current" size="sm" /> : "Alterar senha"}
              </Button>
            </div>
          )}

          {step === "code" && (
            <div className="space-y-4">
              <p className="text-sm text-text-secondary">
                Digite o código enviado para <span className="font-semibold text-text-primary">{email}</span> e a nova senha.
              </p>

              <FieldWrapper label="Código">
                <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Código recebido por e-mail" autoComplete="one-time-code" />
              </FieldWrapper>

              <PasswordInput
                id="newPassword"
                label="Nova senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                hasError={false}
              />

              <PasswordInput
                id="confirmPassword"
                label="Confirmar nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                hasError={confirmPassword.length > 0 && confirmPassword !== newPassword}
              />

              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onPress={handleCancel} isDisabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button size="sm" variant="primary" onPress={handleReset} isDisabled={!code.trim() || !newPassword || isSubmitting}>
                  {isSubmitting ? <Spinner color="current" size="sm" /> : "Salvar nova senha"}
                </Button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="flex items-center gap-2 text-sm text-success-text">
              <CheckCircle2 size={16} />
              Senha alterada com sucesso.
            </div>
          )}

          {errorMessage && (
            <p className="text-xs text-danger-text">{errorMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
}