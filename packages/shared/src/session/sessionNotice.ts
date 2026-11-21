// Lembra se havia sessão aberta neste navegador para avisar, na tela de login, quando ela caiu sozinha
// (expirou por inatividade ou foi encerrada pelo suporte). Sair pelo botão não gera aviso.
const HAD_SESSION_KEY = "medora:had-session";
const NOTICE_KEY = "medora:session-ended";

function safely(action: () => void) {
  try {
    action();
  } catch {
    // storage bloqueado (aba anônima, política do navegador): sem aviso, o login segue normal
  }
}

/** Chamar quando o login termina: a partir daqui, perder a sessão gera aviso. */
export function markSessionStarted(): void {
  safely(() => localStorage.setItem(HAD_SESSION_KEY, "1"));
}

/** Chamar quando o usuário sai pelo botão: não mostra aviso. */
export function markSessionClosedByUser(): void {
  safely(() => {
    localStorage.removeItem(HAD_SESSION_KEY);
    sessionStorage.removeItem(NOTICE_KEY);
  });
}

/** Chamar quando o refresh falha: se havia sessão, a próxima tela de login mostra o aviso. */
export function markSessionLost(): void {
  safely(() => {
    if (localStorage.getItem(HAD_SESSION_KEY) !== null) {
      sessionStorage.setItem(NOTICE_KEY, "1");
    }
    localStorage.removeItem(HAD_SESSION_KEY);
  });
}

export function hasSessionEndedNotice(): boolean {
  try {
    return sessionStorage.getItem(NOTICE_KEY) !== null;
  } catch {
    return false;
  }
}

export function clearSessionEndedNotice(): void {
  safely(() => sessionStorage.removeItem(NOTICE_KEY));
}
