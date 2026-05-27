import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useAdmin";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, loading: authLoading, refreshSession } = useAuth();
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin();
  const location = useLocation();

  useEffect(() => {
    // Re-verify session when entering protected routes
    if (user && adminOnly) {
      refreshSession();
    }
  }, [location.pathname, adminOnly, user, refreshSession]);

  if (authLoading || (adminOnly && roleLoading)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">
            Verificando permissões...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login but save the attempted URL
    return <Navigate to="/entrar" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    console.warn(`Unauthorized access attempt to ${location.pathname} by user ${user.id}`);
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}