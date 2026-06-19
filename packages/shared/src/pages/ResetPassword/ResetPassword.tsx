import { Button } from "@heroui/react";
import { Activity, Stethoscope } from "lucide-react";
import { useMemo, useState } from "react";
import type React from "react";
import { useNavigate } from "react-router";
import { PasswordInput } from "../../components/PasswordInput";

const passwordRules = [
  { id: "uppercase", label: "Contenha 1 letra maiúscula ABC", validate: (v: string) => /[A-Z]/.test(v) },
  { id: "special", label: "Contenha 1 caracter especial !@#$%^&*()-+", validate: (v: string) => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
  { id: "number", label: "Contenha 1 número 123", validate: (v: string) => /[0-9]/.test(v) },
  { id: "length", label: "Mínimo de 6 caracteres", validate: (v: string) => v.length >= 6 },
];

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touchedConfirm, setTouchedConfirm] = useState(false);

  const isPasswordValid = useMemo(
    () => passwordRules.every((rule) => rule.validate(password)),
    [password],
  );

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const showMismatchError = touchedConfirm && confirmPassword.length > 0 && !passwordsMatch;

  const canSubmit = isPasswordValid && passwordsMatch;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-7xl md:flex-row w-full h-fit md:h-[90vh] bg-surface rounded-2xl shadow-2xl overflow-hidden m-4 border border-border mx-auto">
      <div className="md:w-1/2 flex flex-col h-full items-center">
        <div className="flex items-center gap-2 mt-20 justify-center">
          <Activity size={48} className="text-accent" strokeWidth={1.25} />
          <h1 className="text-primary-color text-3xl font-bold">Medora</h1>
        </div>
        <div
          id="reset-card"
          className="md:w-3/4 px-10 py-10 md:h-3/4 flex flex-col gap-5 items-center justify-center"
        >
          <div id="reset-title" className="space-y-2">
            <h1 className="text-center font-bold text-2xl text-primary-text">
              Redefinir senha
            </h1>
            <p className="text-text-secondary text-sm text-center">
              Crie uma nova senha de acesso para sua conta
            </p>
          </div>

          <form
            className="w-full flex flex-col gap-5"
            onSubmit={onSubmit}
          >
            <PasswordInput
              id="new-password"
              label="Nova senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

            <div className="flex flex-col items-center gap-5 mt-5">
              <Button
                size="lg"
                className="w-45 rounded-xl"
                type="submit"
                isDisabled={!canSubmit}
              >
                Redefinir senha
              </Button>
              <a
                href="/login"
                className="w-full text-[14px] text-center text-accent pr-1"
              >
                Voltar para o login
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}