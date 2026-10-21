import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { setAccessToken } from "../api/api";
import { logout, refresh } from "../api/auth";

interface AuthContextType {
  accessToken: string | null;
  isLoading: boolean;
  signIn: (token: string) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

/**
 * Guarda o token só em memória; ao recarregar a página, recupera a sessão pelo cookie de refresh.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    refresh()
      .then(signIn)
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, []);

  function signIn(token: string) {
    setAccessToken(token);
    setToken(token);
  }

  async function signOut() {
    await logout();
    setAccessToken(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ accessToken, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
