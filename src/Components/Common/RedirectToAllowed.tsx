import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllowedPages } from '../../Utils/permissions';
import { Layout } from '../Common/Layout/Layout';
import { useAuth } from '../../Contexts/AuthContext';

/**
 * Componente que redireciona o usuário para a primeira página que ele tem permissão
 * Útil como página inicial após o login
 */
const RedirectToAllowed: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Se não houver usuário logado, redireciona para login
      navigate('/', { replace: true });
      return;
    }

    const userRole = user?.role?.name;

    if (!userRole) {
      // Se não houver role, redireciona para login
      navigate('/', { replace: true });
      return;
    }

    // Pega todas as páginas permitidas para a role do usuário
    const allowedPages = getAllowedPages(userRole);

    if (allowedPages.length === 0) {
      // Se não houver páginas permitidas, redireciona para login
      console.warn('Usuário não tem permissão para acessar nenhuma página');
      navigate('/', { replace: true });
      return;
    }

    // Redireciona para a primeira página permitida
    navigate(allowedPages[0], { replace: true });
  }, [navigate, user, isAuthenticated]);

  // Mostra uma mensagem de carregamento enquanto redireciona, com Layout
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    </Layout>
  );
};

export default RedirectToAllowed;
