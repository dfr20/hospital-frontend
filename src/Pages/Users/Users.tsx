import React, { useState } from "react";
import { Layout } from "../../Components/Common/Layout/Layout";
import { Search, Filter, Plus } from "lucide-react";
import Table from "../../Components/Common/Table/Table";
import type { Column } from "../../Components/Common/Table/Table";
import Pagination from "../../Components/Common/Table/Pagination";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

const Users: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Dados de exemplo - substitua por dados reais da sua API
  const users: User[] = [
    { id: 1, name: "João Silva", email: "joao@hospital.com", role: "Médico", status: "Ativo" },
    { id: 2, name: "Maria Santos", email: "maria@hospital.com", role: "Enfermeira", status: "Ativo" },
    { id: 3, name: "Pedro Costa", email: "pedro@hospital.com", role: "Administrativo", status: "Inativo" },
    { id: 4, name: "Ana Oliveira", email: "ana@hospital.com", role: "Médico", status: "Ativo" },
  ];

  // Definição das colunas da tabela
  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Nome',
      render: (user) => (
        <div className="text-sm font-medium text-gray-900">{user.name}</div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      hideOnMobile: true,
      render: (user) => (
        <div className="text-sm text-gray-500">{user.email}</div>
      )
    },
    {
      key: 'role',
      header: 'Função',
      hideOnTablet: true,
      render: (user) => (
        <div className="text-sm text-gray-500">{user.role}</div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          user.status === 'Ativo' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {user.status}
        </span>
      )
    }
  ];

  const handleEdit = (user: User) => {
    console.log('Editar usuário:', user);
    // Adicione sua lógica de edição aqui
  };

  const handleDelete = (user: User) => {
    console.log('Excluir usuário:', user);
    // Adicione sua lógica de exclusão aqui
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Aqui você pode fazer uma nova requisição para a API com a página atualizada
  };

  const handleNewUser = () => {
    console.log('Criar novo usuário');
    // Adicione sua lógica aqui (ex: abrir modal, navegar para página de criação, etc)
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Filtros e Busca */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Campo de Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar usuários..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
            </div>
            
            {/* Botões de Ação */}
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filtrar</span>
              </button>
              <button 
                onClick={handleNewUser}
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Novo Usuário</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de Usuários com Componente Reutilizável */}
        <div>
          <Table<User>
            data={users}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            emptyMessage="Nenhum usuário encontrado"
          />
          <Pagination
            currentPage={currentPage}
            totalItems={users.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Users;


