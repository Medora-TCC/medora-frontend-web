import { useCallback, useEffect, useState, type ReactNode } from "react";
import { setAccessToken } from "../api/api";
import { logout, refresh } from "../api/auth";
import { AuthContext } from "./authContextValue";

/**
 * Guarda o token só em memória; ao recarregar a página, recupera a sessão pelo cookie de refresh.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <AuthContext.Provider value={{ accessToken, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
