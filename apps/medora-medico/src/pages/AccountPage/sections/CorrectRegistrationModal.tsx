import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Button, Input } from "@heroui/react";
import { AlertTriangle, CheckCircle2, Loader2, X } from "lucide-react";
import { correctRegistration } from "../../../api/services/DoctorService";
import type { VerificationStatusDto } from "../../../api/dtos/Doctors/VerificationDto";
import { maskCrm, onlyDigits } from "../../../utils/masks";

const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const FALLBACK_REASON =
  "Não conseguimos confirmar seu registro no CFM. Revise os dados abaixo e envie novamente.";

const inputClass = (hasError: boolean) =>
  `w-full border rounded-lg p-2 transition-colors ${hasError ? "border-danger" : "border-default-200"}`;

const selectClass = (hasError: boolean) =>
  `w-full h-10 px-3 border rounded-lg bg-surface text-text-primary text-sm ${hasError ? "border-danger" : "border-border"}`;

interface FieldErrors {
  crm?: string;
  crmState?: string;
  fullName?: string;
}

interface CorrectRegistrationModalProps {
  status: VerificationStatusDto;
  onClose: () => void;
  /** Chamado após o envio com sucesso (o pai recarrega os dados). O modal continua aberto na tela de sucesso. */
  onSubmitted: () => void;
}

/**
 * Modal único: mostra o motivo da rejeição e, logo abaixo, o formulário de correção.
 * Montar só quando aberto ({open && <CorrectRegistrationModal />}): o estado inicial vem das props.
 */
export default function CorrectRegistrationModal({ status, onClose, onSubmitted }: Readonly<CorrectRegistrationModalProps>) {
  // Foto do que veio do servidor: depois do envio o pai recarrega e o motivo some do status.
  const [original] = useState(() => ({
    crm: onlyDigits(status.crm ?? ""),
    crmState: (status.crmState ?? "").toUpperCase(),
    fullName: (status.fullName ?? "").trim(),
    reason: status.rejectionReason?.trim() || FALLBACK_REASON,
    attemptsLeft: status.correctionAttemptsLeft,
  }));

  const [crm, setCrm] = useState(original.crm);
  const [crmState, setCrmState] = useState(original.crmState);
  const [fullName, setFullName] = useState(original.fullName);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstFieldRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isSubmitting, onClose]);

  const nameChanged = fullName.trim() !== original.fullName;
  const unchanged = crm === original.crm && crmState === original.crmState && !nameChanged;

  const clearError = (field: keyof FieldErrors) => {
    setSubmitError("");
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!crm) next.crm = "Informe o número do CRM";
    if (!UFS.includes(crmState)) next.crmState = "Selecione o estado do CRM";
    if (!fullName.trim()) next.fullName = "Informe seu nome completo";
    else if (fullName.trim().length > 200) next.fullName = "O nome deve ter no máximo 200 caracteres";
    return next;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setIsSubmitting(true);
    setSubmitError("");
    try {
      await correctRegistration({
        crm: onlyDigits(crm),
        crmState,
        fullName: nameChanged ? fullName.trim() : undefined,
      });
      setDone(true);
      onSubmitted();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Não foi possível enviar a correção.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="correct-registration-title"
    >
      <div className="bg-surface rounded-2xl border border-divider shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
        {done ? (
          <div className="flex flex-col items-center text-center gap-3 py-2">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="text-green-600" size={24} />
            </div>
            <h2 id="correct-registration-title" className="text-lg font-bold text-text-primary">
              Dados enviados para verificação
            </h2>
            <p className="text-sm text-text-muted">
              Estamos consultando o CFM. Isso pode levar alguns minutos. Você receberá o resultado por e-mail e ele
              também aparecerá nesta página.
            </p>
            <Button className="bg-primary-color text-white font-bold mt-2" onPress={onClose}>
              Fechar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="text-red-600" size={24} />
                </div>
                <h2 id="correct-registration-title" className="text-lg font-bold text-text-primary">
                  Verificação não aprovada
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                aria-label="Fechar"
                className="text-text-muted hover:text-text-primary disabled:opacity-40"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Motivo</p>
              <p className="text-sm text-red-800 mt-1">{original.reason}</p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-text-primary">Corrija seus dados</p>

              <div className="grid grid-cols-[1fr_6rem] gap-3">
                <div>
                  <label htmlFor="correction-crm" className="block text-sm font-medium text-text-primary mb-1">
                    Número do CRM
                  </label>
                  <Input
                    id="correction-crm"
                    ref={firstFieldRef}
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="Somente números"
                    value={crm}
                    onChange={(e) => {
                      setCrm(maskCrm(e.target.value));
                      clearError("crm");
                    }}
                    aria-invalid={!!errors.crm}
                    className={inputClass(!!errors.crm)}
                  />
                  {errors.crm && <p className="text-xs text-danger-text mt-1">{errors.crm}</p>}
                </div>

                <div>
                  <label htmlFor="correction-uf" className="block text-sm font-medium text-text-primary mb-1">
                    UF
                  </label>
                  <select
                    id="correction-uf"
                    value={crmState}
                    onChange={(e) => {
                      setCrmState(e.target.value);
                      clearError("crmState");
                    }}
                    aria-invalid={!!errors.crmState}
                    className={selectClass(!!errors.crmState)}
                  >
                    <option value="">--</option>
                    {UFS.map((uf) => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                  {errors.crmState && <p className="text-xs text-danger-text mt-1">{errors.crmState}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="correction-name" className="block text-sm font-medium text-text-primary mb-1">
                  Nome completo
                </label>
                <Input
                  id="correction-name"
                  autoComplete="off"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    clearError("fullName");
                  }}
                  aria-invalid={!!errors.fullName}
                  className={inputClass(!!errors.fullName)}
                />
                <p className="text-xs text-text-muted mt-1">Exatamente como consta no CFM.</p>
                {errors.fullName && <p className="text-xs text-danger-text mt-1">{errors.fullName}</p>}
              </div>
            </div>

            {unchanged && (
              <p className="text-xs text-text-muted">
                Você ainda não alterou nenhum dado. Reenvie assim apenas se já regularizou sua situação no CFM.
              </p>
            )}

            {submitError && (
              <p role="alert" className="text-sm text-danger-text flex items-start gap-1.5">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {submitError}
              </p>
            )}

            <p className="text-xs text-text-muted">
              Uma nova verificação leva de 1 a 5 minutos e o resultado chega por e-mail.
              {original.attemptsLeft > 0 && (
                <> Você tem {original.attemptsLeft} {original.attemptsLeft === 1 ? "tentativa" : "tentativas"} de correção.</>
              )}
            </p>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onPress={onClose} isDisabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-primary-color text-white font-bold" isDisabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Enviando...
                  </>
                ) : (
                  "Enviar para verificação"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}