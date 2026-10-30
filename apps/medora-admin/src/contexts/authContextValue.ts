import { createContext } from "react";

export interface AuthContextType {
  accessToken: string | null;
  isLoading: boolean;
  signIn: (token: string) => void;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);
