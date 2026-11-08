import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { SessionError, SessionLoading } from "./SessionFeedback";

const SESSION_TIMEOUT_MS = 8_000;

interface AuthExtras {
  error?: unknown;
  retry?: () => void | Promise<void>;
  logout?: () => void | Promise<void>;
}

function getStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const e = error as { status?: number; response?: { status?: number } };
  return e.status ?? e.response?.status;
}

export function ProtectedRoute() {
  const { accessToken, isLoading, error, retry, logout } =
    useAuth() as ReturnType<typeof useAuth> & AuthExtras;

  const location = useLocation();
  const navigate = useNavigate();

  const [timedOut, setTimedOut] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setTimedOut(false);
      return;
    }
    const id = window.setTimeout(() => setTimedOut(true), SESSION_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [isLoading, attempt]);

  const hasTimedOut = timedOut && isLoading;
  const unauthorized = getStatus(error) === 401;
  const failed = !unauthorized && (hasTimedOut || Boolean(error));
  const mustLogin = unauthorized || (!isLoading && !accessToken && !failed);

  const clearedRef = useRef(false);
  useEffect(() => {
    if (!unauthorized) {
      clearedRef.current = false;
      return;
    }
    if (clearedRef.current) return;
    clearedRef.current = true;
    void logout?.();
  }, [unauthorized, logout]);

  const handleRetry = useCallback(() => {
    setTimedOut(false);
    setAttempt((n) => n + 1);
    if (retry) {
      void retry();
    } else {
      window.location.reload();
    }
  }, [retry]);

  const handleGoToLogin = useCallback(async () => {
    try {
      await logout?.(); // evita que o /login devolva o usuário com um token ruim
    } finally {
      navigate("/login", { replace: true, state: { from: location } });
    }
  }, [logout, navigate, location]);

  if (mustLogin) {
    return (
      <Navigate
        to="/login"
        state={{ from: location, reason: unauthorized ? "session-expired" : undefined }}
        replace
      />
    );
  }

  if (failed) {
    return (
      <SessionError
        reason={hasTimedOut ? "timeout" : "request"}
        timeoutSeconds={SESSION_TIMEOUT_MS / 1000}
        onRetry={handleRetry}
        onGoToLogin={handleGoToLogin}
      />
    );
  }

  if (isLoading) {
    return <SessionLoading />;
  }

  return <Outlet />;
}