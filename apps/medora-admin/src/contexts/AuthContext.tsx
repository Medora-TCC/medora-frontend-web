import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { setAccessToken, setOnSessionExpired } from "../api/client";
import { logout, refresh } from "../api/auth";
import { AuthContext } from "./authContextValue";

/**
 * Guarda o token só em memória; ao recarregar a página, recupera a sessão pelo cookie de refresh.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const signIn = useCallback((token: string) => {
    setAccessToken(token);
    setToken(token);
  }, []);

  const signOut = useCallback(async () => {
    await logout();
    setAccessToken(null);
    setToken(null);
  }, []);

  useEffect(() => {
    refresh()
      .then(signIn)
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, [signIn]);

  useEffect(() => {
    setOnSessionExpired(() => {
      setToken(null);
      navigate("/", { replace: true });
    });
    return () => setOnSessionExpired(null);
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ accessToken, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}