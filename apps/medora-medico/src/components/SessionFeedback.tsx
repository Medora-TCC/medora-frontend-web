import { Spinner } from "@heroui/react";
import { useEffect, useState } from "react";

/** Devolve `true` após `delayMs`; usado para fazer fade-in só com classes do Tailwind. */
function useVisibleAfter(delayMs: number): boolean {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(id);
  }, [delayMs]);
  return visible;
}

// Os tokens do tema (surface, text-*, border, primary-color...) já trocam de valor
// com [data-theme="dark"], então não é preciso usar variantes `dark:`.
const screen =
  "fixed inset-0 flex flex-col items-center justify-center gap-1 p-6 " +
  "bg-surface text-text-primary " +
  "transition-opacity duration-300 motion-reduce:transition-none";

export function SessionLoading() {
  // Só aparece após 150 ms: validações rápidas não piscam a tela.
  const visible = useVisibleAfter(150);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`${screen} ${visible ? "opacity-100" : "opacity-0"}`}
    >
      <div
        aria-hidden="true"
        className="mb-4 size-11 animate-spin rounded-full border-[3px] border-border border-t-primary-color motion-reduce:[animation-duration:3s]"
      />
      <p className="text-base font-semibold">Verificando sua sessão</p>
      <p className="text-sm text-text-muted">Só um instante.</p>
    </div>
  );
}

interface SessionErrorProps {
  reason: "timeout" | "request";
  timeoutSeconds: number;
  onRetry: () => void;
  onGoToLogin: () => void;
}

export function SessionError({
  reason,
  timeoutSeconds,
  onRetry,
  onGoToLogin,
}: SessionErrorProps) {
  const visible = useVisibleAfter(0);
  const isTimeout = reason === "timeout";

  const description = isTimeout
    ? `O servidor não respondeu em ${timeoutSeconds} segundos. Verifique sua conexão e tente novamente.`
    : "Houve um erro ao confirmar seu acesso. Tente novamente ou entre de novo no sistema.";

  const iconTone = isTimeout
    ? "bg-warning-subtle text-warning-text"
    : "bg-danger-subtle text-danger-text";

  return (
    <div className={`${screen} ${visible ? "opacity-100" : "opacity-0"}`}>
      <section
        role="alert"
        aria-labelledby="session-error-title"
        className="w-full max-w-md rounded-xl border border-border bg-surface-alt p-7"
      >
        <div
          aria-hidden="true"
          className={`mb-4 flex size-10 items-center justify-center rounded-full ${iconTone}`}
        >
          <Spinner size="xl" color="accent" className="motion-reduce:animation-duration-[3s]" />
        </div>

        <h1 id="session-error-title" className="mb-2 text-lg font-semibold leading-snug">
          Não foi possível verificar sua sessão
        </h1>
        <p className="mb-6 text-[0.9375rem] leading-relaxed text-text-secondary">
          {description}
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg bg-primary-color px-4 py-2.5 text-[0.9375rem] font-semibold text-text-inverse transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring"
          >
            Tentar novamente
          </button>
          <button
            type="button"
            onClick={onGoToLogin}
            className="rounded-lg border border-border bg-transparent px-4 py-2.5 text-[0.9375rem] font-semibold text-text-primary transition-colors hover:border-border-hover hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring"
          >
            Ir para o login
          </button>
        </div>
      </section>
    </div>
  );
}