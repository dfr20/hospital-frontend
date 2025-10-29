import React, { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { hasPermission } from '../../Utils/permissions';
import { useAuth } from '../../Contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPage: string;
}

/**
 * Componente que protege rotas baseado nas permissões do usuário
 * A validação da autenticação é feita apenas uma vez no AuthContext
 * Aqui apenas verificamos as permissões localmente
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredPage }) => {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Memoriza a verificação de permissão para evitar re-renders desnecessários
  const hasAccess = useMemo(() => {
    if (!user || !user.role?.name) return false;
    return hasPermission(user.role.name, requiredPage);
  }, [user, requiredPage]);

  // Aguarda carregamento inicial do usuário
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado, redireciona para login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Se não tem permissão, redireciona para dashboard
  if (!hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  // Se tiver permissão, renderiza o componente filho
  return <>{children}</>;
};

export default ProtectedRoute;
