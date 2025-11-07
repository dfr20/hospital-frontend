import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { headerConfigs } from './HeaderData';
import { useAuth } from '../../../Contexts/AuthContext';
import ConfirmationModal from '../Modal/ConfirmationModal';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
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

  const handleAction = (actionId: string) => {
    if (actionId === 'logout') {
      setIsLogoutModalOpen(true);
    } else {
      console.log('Header action:', actionId);
      // Adicione sua lógica aqui (ex: abrir modal de settings, etc)
    }
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
          <div className="flex items-center gap-4">
            {data.actions.map((action) => {
              const Icon = action.icon;

              if (action.type === 'icon') {
                return (
                  <button
                    key={action.id}
                    onClick={() => handleAction(action.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Icon className="w-5 h-5 text-gray-600" />
                  </button>
                );
              }

              if (action.type === 'button') {
                return (
                  <button
                    key={action.id}
                    onClick={() => handleAction(action.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    {action.label}
                  </button>
                );
              }

              return null;
            })}
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
