import React from 'react';
import { Layout } from '../../Components/Common/Layout/Layout';
import { FileText, Calendar, DollarSign, TrendingUp } from 'lucide-react';

const Bids: React.FC = () => {
  return (
    <Layout>
      <div className="p-6">
        {/* Header da Página */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Licitações</h1>
          <p className="text-gray-600 mt-1">Gerencie as licitações do sistema</p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Card 1 - Total de Licitações */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total de Licitações</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">-</p>
              </div>
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </div>

          {/* Card 2 - Licitações Abertas */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Abertas</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">-</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Card 3 - Licitações em Andamento */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Em Andamento</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">-</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Card 4 - Valor Total */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Valor Total</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">-</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Licitações */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Lista de Licitações</h2>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Nenhuma licitação cadastrada</p>
              <p className="text-gray-400 text-sm mt-2">As licitações aparecerão aqui quando forem criadas</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Bids;
