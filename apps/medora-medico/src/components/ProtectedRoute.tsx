import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute() {
    const { accessToken, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
    return (
      <div>
        Carregando informações da sessão...
      </div>
    ); 
  }

    if(!accessToken) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
}