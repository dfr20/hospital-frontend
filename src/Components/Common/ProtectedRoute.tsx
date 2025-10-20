import React, { useMemo, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { hasPermission } from '../../Utils/permissions';
import { useAuth } from '../../Contexts/AuthContext';
import api from '../../Api/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPage: string;
}

/**
 * Componente que protege rotas baseado nas permissões do usuário
 * Valida a autenticação com o backend ao entrar em cada rota
 * Redireciona para login se a validação falhar
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredPage }) => {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [authError, setAuthError] = useState(false);

  // Valida o token com o backend ao entrar na rota
  useEffect(() => {
    const validateAuth = async () => {
      // Se não está autenticado, não precisa validar
      if (!isAuthenticated) {
        setIsValidating(false);
        return;
      }

      try {
        setIsValidating(true);
        setAuthError(false);

        // Tenta buscar os dados do usuário para validar o token
        await api.get('/users/me');

        console.log('✅ [ProtectedRoute] Autenticação validada para:', {
          rota: requiredPage,
          usuario: user?.name,
          role: user?.role?.name
        });

        setIsValidating(false);
      } catch (error) {
        console.error('❌ [ProtectedRoute] Falha na validação do token:', error);

        // Se falhar, limpa a sessão e marca erro
        logout();
        setAuthError(true);
        setIsValidating(false);
      }
    };

    validateAuth();
  }, [location.pathname, requiredPage]); // Valida sempre que mudar de rota

  // Memoriza a verificação de permissão para evitar re-renders desnecessários
  const hasAccess = useMemo(() => {
    if (!user || !user.role?.name) return false;
    const access = hasPermission(user.role.name, requiredPage);

    // Log apenas quando entra na rota específica
    console.log('🔐 [ProtectedRoute] Verificando acesso à rota:', {
      rota: requiredPage,
      usuario: user.name,
      role: user.role.name,
      temAcesso: access
    });

    return access;
  }, [user, requiredPage]);

  // Aguarda carregamento do usuário ou validação do token
  if (isLoading || isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {isLoading ? 'Carregando...' : 'Validando autenticação...'}
          </p>
        </div>
      </div>
    );
  }

  // Se houve erro de autenticação ou não está autenticado, redireciona para login
  if (authError || !isAuthenticated) {
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
