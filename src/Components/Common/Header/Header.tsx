import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { headerConfigs } from './HeaderData';
import { useAuth } from '../../../Contexts/AuthContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  // Pega o header correto baseado na rota atual
  const data = headerConfigs[location.pathname] || headerConfigs['/users'];

  const handleAction = (actionId: string) => {
    if (actionId === 'logout') {
      logout();
      navigate('/');
    } else {
      console.log('Header action:', actionId);
      // Adicione sua lógica aqui (ex: abrir modal de settings, etc)
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
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
  );
};

export default Header;
