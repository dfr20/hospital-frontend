import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../Components/Common/Layout/Layout';
import { sidebarData } from '../../Components/Common/Sidebar/SidebarData';
import { useAuth } from '../../Contexts/AuthContext';
import { hasPermission } from '../../Utils/permissions';

// Mapeamento de descrições para cada rota
const routeDescriptions: Record<string, string> = {
  '/users': 'Gerencie usuários do sistema',
  '/hospitals': 'Gerencie hospitais cadastrados',
  '/suppliers': 'Gerencie fornecedores',
  '/catalog': 'Gerencie catálogo de produtos',
  '/items': 'Gerencie itens e avaliações',
  '/categories': 'Gerencie categorias e subcategorias',
  '/job-titles': 'Gerencie cargos e funções',
  '/public-acquisitions': 'Gerencie licitações públicas',
  '/questions': 'Gerencie questões do sistema'
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Filtra os itens do menu (excluindo o próprio Dashboard) baseado nas permissões do usuário
  const visibleCards = sidebarData.menuItems
    .filter(item => item.route !== '/dashboard') // Remove o dashboard da lista
    .filter(item => user?.role?.name ? hasPermission(user.role.name, item.route) : false);

  const handleCardClick = (route: string) => {
    navigate(route);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white p-8">
        {/* Grid de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleCards.map((item, index) => {
            const Icon = item.icon;
            const description = routeDescriptions[item.route] || 'Acesse esta seção';

            return (
              <button
                key={index}
                onClick={() => handleCardClick(item.route)}
                className="cursor-pointer group relative bg-white border border-gray-200 rounded-lg p-8 shadow hover:shadow-lg transition-all duration-300 hover:border-teal-500"
              >
                <div className="flex flex-col items-center text-center gap-4">
                  {/* Ícone */}
                  <div className="text-teal-600">
                    <Icon className="w-8 h-8" />
                  </div>

                  {/* Texto */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.label}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
