import React, { useState } from "react";
import { Layout } from "../../Components/Common/Layout/Layout";
import { Search, Filter, Plus } from "lucide-react";
import Table from "../../Components/Common/Table/Table";
import type { Column } from "../../Components/Common/Table/Table";
import Pagination from "../../Components/Common/Table/Pagination";
import Modal from "../../Components/Common/Modal/Modal";
import DynamicForm from "../../Components/Common/Modal/DynamicForm";
import type { Hospital, HospitalPayload } from "../../Types/Hospital";
import { useHospital } from "../../Hooks/useHospital";
import { hospitalFormFields } from "./HospitalFormConfigs";

// Tipo estendido para incluir 'id' necessário para o componente Table
type HospitalWithId = Hospital & { id: string };

const Hospitals: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 10;

  const { fetchHospitals, createHospital } = useHospital();
  const { data: hospitalsData, isLoading, error } = fetchHospitals(currentPage, itemsPerPage);
  const { mutate: createHospitalMutation, isPending: isCreating } = createHospital();

  // Adaptar dados para incluir 'id' baseado em 'public_id'
  const hospitalsWithId: HospitalWithId[] = (hospitalsData?.items || []).map((hospital: Hospital) => ({
    ...hospital,
    id: hospital.public_id
  }));

  // Definição das colunas da tabela
  const columns: Column<HospitalWithId>[] = [
    {
      key: 'name',
      header: 'Nome',
      render: (hospital) => (
        <div className="text-sm font-medium text-gray-900">{hospital.name}</div>
      )
    },
    {
      key: 'document',
      header: 'CNPJ',
      hideOnMobile: true,
      render: (hospital) => (
        <div className="text-sm text-gray-500">{hospital.document}</div>
      )
    },
    {
      key: 'city',
      header: 'Cidade',
      hideOnTablet: true,
      render: (hospital) => (
        <div className="text-sm text-gray-500">{hospital.city}</div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      hideOnMobile: true,
      render: (hospital) => (
        <div className="text-sm text-gray-500">{hospital.email}</div>
      )
    },
    {
      key: 'phone',
      header: 'Telefone',
      hideOnTablet: true,
      render: (hospital) => (
        <div className="text-sm text-gray-500">{hospital.phone}</div>
      )
    }
  ];

  const handleEdit = (hospital: HospitalWithId) => {
    console.log('Editar hospital:', hospital);
    // Adicione sua lógica de edição aqui
  };

  const handleDelete = (hospital: HospitalWithId) => {
    console.log('Excluir hospital:', hospital);
    // Adicione sua lógica de exclusão aqui
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNewHospital = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmitHospital = (data: HospitalPayload) => {
    createHospitalMutation(data, {
      onSuccess: () => {
        setIsModalOpen(false);
        // A query será invalidada automaticamente pelo hook
      },
      onError: (error) => {
        console.error('Erro ao criar hospital:', error);
        alert('Erro ao criar hospital. Tente novamente.');
      }
    });
  };

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar hospitais</h3>
            <p className="text-gray-500">Tente novamente mais tarde</p>
          </div>
        </div>
      </Layout>
    );
  }

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
                placeholder="Buscar hospitais..."
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
                onClick={handleNewHospital}
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Novo Hospital</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de Hospitais */}
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Carregando...</div>
            </div>
          ) : (
            <>
              <Table<HospitalWithId>
                data={hospitalsWithId}
                columns={columns}
                onEdit={handleEdit}
                onDelete={handleDelete}
                emptyMessage="Nenhum hospital encontrado"
              />
              <Pagination
                currentPage={currentPage}
                totalItems={hospitalsData?.total || 0}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>

      {/* Modal de Criação */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Criar Novo Hospital">
        <DynamicForm<HospitalPayload>
          fields={hospitalFormFields}
          onSubmit={handleSubmitHospital}
          onCancel={handleCloseModal}
          isLoading={isCreating}
          submitLabel="Criar Hospital"
          cancelLabel="Cancelar"
        />
      </Modal>
    </Layout>
  );
};

export default Hospitals;
