import { Navigate, Outlet } from "react-router";
import { useAuth } from "../contexts/AuthContext";

export function ProtectedRoute() {
  const { accessToken, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-6 text-text-muted">Carregando informações da sessão...</div>;
  }

  if (!accessToken) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
