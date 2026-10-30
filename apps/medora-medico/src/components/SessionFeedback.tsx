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

const screen =
  "fixed inset-0 flex flex-col items-center justify-center gap-1 p-6 " +
  "bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100 " +
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
        className="mb-4 size-11 animate-spin rounded-full border-[3px] border-slate-300 border-t-teal-700 motion-reduce:animation-duration-[3s] dark:border-slate-700 dark:border-t-teal-400"
      />
      <p className="text-base font-semibold">Verificando sua sessão</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Só um instante.
      </p>
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

  const description =
    reason === "timeout"
      ? `O servidor não respondeu em ${timeoutSeconds} segundos. Verifique sua conexão e tente novamente.`
      : "Houve um erro ao confirmar seu acesso. Tente novamente ou entre de novo no sistema.";

  return (
    <div className={`${screen} ${visible ? "opacity-100" : "opacity-0"}`}>
      <section
        role="alert"
        aria-labelledby="session-error-title"
        className="w-full max-w-md rounded-xl border border-slate-300 bg-white p-7 dark:border-slate-700 dark:bg-slate-900"
      >
        <h1
          id="session-error-title"
          className="mb-2 text-lg font-semibold leading-snug"
        >
          Não foi possível verificar sua sessão
        </h1>
        <p className="mb-6 text-[0.9375rem] leading-relaxed text-slate-500 dark:text-slate-400">
          {description}
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg border border-teal-700 bg-teal-700 px-4 py-2.5 text-[0.9375rem] font-semibold text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:border-teal-400 dark:bg-teal-400 dark:text-teal-950 dark:hover:bg-teal-300"
          >
            Tentar novamente
          </button>
          <button
            type="button"
            onClick={onGoToLogin}
            className="rounded-lg border border-slate-300 bg-transparent px-4 py-2.5 text-[0.9375rem] font-semibold hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Ir para o login
          </button>
        </div>
      </section>
    </div>
  );
}
