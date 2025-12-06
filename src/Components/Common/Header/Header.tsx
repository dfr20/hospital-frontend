import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User as UserIcon } from 'lucide-react';
import { headerConfigs } from './HeaderData';
import { useAuth } from '../../../Contexts/AuthContext';
import ConfirmationModal from '../Modal/ConfirmationModal';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Pega o header correto baseado na rota atual
  // Primeiro tenta match exato, depois tenta match parcial (para rotas dinâmicas)
  const getHeaderData = () => {
    // Match exato
    if (headerConfigs[location.pathname]) {
      return headerConfigs[location.pathname];
    }
    
    // Match parcial - verifica se a rota começa com alguma das rotas configuradas
    const matchingRoute = Object.keys(headerConfigs).find(route => 
      location.pathname.startsWith(route) && route !== '/'
    );
    
    if (matchingRoute) {
      return headerConfigs[matchingRoute];
    }
    
    // Fallback
    return headerConfigs['/users'];
  };

  const data = getHeaderData();

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
    navigate('/');
  };

  const handleCancelLogout = () => {
    setIsLogoutModalOpen(false);
  };

  return (
    <>
      <header className="bg-gray-50 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 mb-1">
              {data.breadcrumb.join(' / ')}
            </div>
            <h2 className="text-xl font-semibold text-gray-800">{data.title}</h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Informações do usuário */}
            {user && (
              <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-2 bg-gradient-to-br from-teal-50 to-teal-100 rounded-full">
                  <UserIcon className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-800">{user.email}</span>
                  <span className="text-xs text-gray-500">{user.job_title.title}</span>
                </div>
              </div>
            )}
            
            {/* Botão de Logout */}
            <button
              onClick={handleLogout}
              className="p-2.5 hover:bg-red-50 rounded-lg transition-colors group"
              title="Sair"
            >
              <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
            </button>
          </div>
        </div>
      </header>

      {/* Modal de Confirmação de Logout */}
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={handleCancelLogout}
        onConfirm={handleConfirmLogout}
        title="Confirmar Logout"
        message="Tem certeza que deseja sair? Você precisará fazer login novamente para acessar o sistema."
        confirmLabel="Sair"
        cancelLabel="Cancelar"
        variant="warning"
      />
    </>
  );
};

export default Header;
