import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { clearSessionEndedNotice, hasSessionEndedNotice } from "../session/sessionNotice";

/** Aviso da tela de login quando a sessão caiu sem o usuário sair (aparece uma vez). */
export function SessionEndedNotice() {
  const [visible] = useState(hasSessionEndedNotice);

  useEffect(() => {
    clearSessionEndedNotice();
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="w-full flex items-start gap-3 rounded-xl bg-warning-subtle text-warning-text px-4 py-3 text-sm"
    >
      <Clock className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="flex flex-col gap-0.5 text-left">
        <p className="font-semibold">Sua sessão foi encerrada</p>
        <p>
          Por segurança, você saiu depois de um tempo sem usar o portal ou porque a sessão foi
          encerrada. Entre de novo para continuar.
        </p>
      </div>
    </div>
  );
}
