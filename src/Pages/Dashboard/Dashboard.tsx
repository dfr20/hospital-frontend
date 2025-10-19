import React from 'react';
import { Layout } from '../../Components/Common/Layout/Layout';
import { Home, Activity, Users, Package } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <Layout>
      <div className="p-6">
        {/* Header da Dashboard */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Bem-vindo ao sistema de gestão hospitalar</p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Card 1 */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">-</p>
              </div>
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Hospitais</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">-</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Itens no Catálogo</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">-</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Atividade</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">-</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Atividades Recentes */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Atividades Recentes</h2>
            <div className="space-y-4">
              <p className="text-gray-500 text-center py-8">Nenhuma atividade recente</p>
            </div>
          </div>

          {/* Informações Rápidas */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Informações Rápidas</h2>
            <div className="space-y-4">
              <p className="text-gray-500 text-center py-8">Dados em desenvolvimento</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
