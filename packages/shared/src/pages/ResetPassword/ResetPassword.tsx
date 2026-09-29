import { Button, Input } from "@heroui/react";
import { Activity, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { useMemo, useState } from "react";
import type React from "react";
import { Link, useNavigate } from "react-router";
import { PasswordInput } from "../../components/PasswordInput";

const passwordRules = [
  { id: "uppercase", label: "Contenha 1 letra maiúscula ABC", validate: (v: string) => /[A-Z]/.test(v) },
  { id: "special", label: "Contenha 1 caracter especial !@#$%^&*()-+", validate: (v: string) => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
  { id: "number", label: "Contenha 1 número 123", validate: (v: string) => /[0-9]/.test(v) },
  { id: "length", label: "Mínimo de 6 caracteres", validate: (v: string) => v.length >= 6 },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ResetPasswordProps {
  handleSubmit: (email: string, code: string, newPwd: string) => Promise<void>;
}

export function ResetPassword({ handleSubmit }: ResetPasswordProps) {
  const navigate = useNavigate();

  // Controle do modal via estado simples
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [email, setEmail] = useState("");
  const [touchedEmail, setTouchedEmail] = useState(false);

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touchedConfirm, setTouchedConfirm] = useState(false);

  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isEmailValid = EMAIL_REGEX.test(email.trim());
  const showEmailError = touchedEmail && email.length > 0 && !isEmailValid;

  const isCodeValid = /^\d{6}$/.test(code);

  const isPasswordValid = useMemo(
    () => passwordRules.every((rule) => rule.validate(password)),
    [password],
  );

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const showMismatchError = touchedConfirm && confirmPassword.length > 0 && !passwordsMatch;

  const canSubmit =
    isEmailValid &&
    isCodeValid &&
    isPasswordValid &&
    passwordsMatch &&
    !isLoading;

  const clearError = () => {
    if (hasError) setHasError(false);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericOnly = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(numericOnly);
    clearError();
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    setHasError(false);
    setIsLoading(true);

    try {
      await handleSubmit(email.trim(), code.trim(), password);
      setIsSuccessModalOpen(true);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-7xl md:flex-row w-full h-fit md:h-[90vh] bg-surface rounded-2xl shadow-2xl overflow-hidden m-4 border border-border mx-auto relative">
      <div className="md:w-1/2 flex flex-col h-full items-center py-8">
        <div className="flex items-center gap-2 mt-6 justify-center">
          <Activity size={48} className="text-accent" strokeWidth={1.25} />
          <h1 className="text-primary-color text-3xl font-bold">Medora</h1>
        </div>

        <div
          id="reset-card"
          className="md:w-3/4 px-6 md:px-10 py-6 flex flex-col gap-5 items-center justify-center"
        >
          <div id="reset-title" className="space-y-2 text-center">
            <h1 className="font-bold text-2xl text-primary-text">
              Redefinir senha
            </h1>
            <p className="text-text-secondary text-sm">
              Crie uma nova senha de acesso para sua conta
            </p>
          </div>

          <div className="w-full flex items-start gap-2.5 p-3.5 text-xs rounded-xl bg-accent/10 border border-accent/20 text-text-primary">
            <Info size={18} className="shrink-0 text-accent mt-0.5" />
            <span>
              Se este e-mail estiver vinculado a uma conta, um código de 6 dígitos foi enviado. Verifique sua caixa de entrada e spam.
            </span>
          </div>

          {hasError && (
            <div className="w-full flex items-center gap-2 p-3 text-sm rounded-lg bg-danger/10 border border-danger/20 text-danger animate-in fade-in duration-200">
              <AlertCircle size={18} className="shrink-0" />
              <span>Não foi possível redefinir sua senha. Verifique as informações e tente novamente.</span>
            </div>
          )}

          <form className="w-full flex flex-col gap-4" onSubmit={onSubmit}>
            {/* Campo E-mail */}
            <div className="flex flex-col gap-1 w-full">
              <label className="text-sm font-medium mb-1 text-default-700">E-mail</label>
              <Input
                type="email"
                placeholder="exemplo@medora.com"
                value={email}
                disabled={isLoading}
                onBlur={() => setTouchedEmail(true)}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError();
                }}
                className="w-full border rounded p-2 pr-10 transition-colors border-default-200 focus:border-primary"
              />
              {showEmailError && (
                <p className="text-danger text-xs px-1">
                  Insira um e-mail válido
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1 w-full">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium mb-1 text-default-700">Código de verificação</label>
                <span className="text-[11px] text-text-secondary">{code.length}/6</span>
              </div>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={code}
                disabled={isLoading}
                onChange={handleCodeChange}
                className="w-full border rounded p-2 pr-10 transition-colors border-default-200 focus:border-primary tracking-widest text-center"
              />
            </div>

            <PasswordInput
              id="new-password"
              label="Nova senha"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError();
              }}
              placeholder="Digite sua nova senha"
              rules={passwordRules}
            />

            <div className="flex flex-col gap-1 w-full">
              <PasswordInput
                id="confirm-password"
                label="Confirmar senha"
                value={confirmPassword}
                onChange={(e) => {
                  setTouchedConfirm(true);
                  setConfirmPassword(e.target.value);
                  clearError();
                }}
                placeholder="Confirme sua nova senha"
                hasError={showMismatchError}
                rules={[]}
              />
              {showMismatchError && (
                <p className="text-danger text-xs px-1">
                  As senhas não coincidem
                </p>
              )}
            </div>

            <div className="flex flex-col items-center gap-4 mt-3">
              <Button
                size="lg"
                className="w-full md:w-48 rounded-xl"
                type="submit"
                isDisabled={!canSubmit}
              >
                Redefinir senha
              </Button>

              <Link
                to="/login"
                className="w-full text-sm text-center text-accent hover:underline"
              >
                Voltar para o login
              </Link>
            </div>
          </form>
        </div>
      </div>

      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface border border-border w-full max-w-md rounded-2xl p-6 flex flex-col items-center text-center shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="h-14 w-14 rounded-full bg-success/15 flex items-center justify-center text-success">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-primary-text">
                Senha redefinida com sucesso!
              </h2>
              <p className="text-text-secondary text-sm leading-relaxed">
                Sua credencial de acesso foi alterada. Você já pode acessar a plataforma utilizando a sua nova senha.
              </p>
            </div>

            <Button
              size="lg"
              className="w-full rounded-xl"
              onPress={() => navigate("/login")}
            >
              Ir para o login
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}