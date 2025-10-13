import React, { useState } from "react";
import { Layout } from "../../Components/Common/Layout/Layout";
import { Filter, Plus } from "lucide-react";
import Table from "../../Components/Common/Table/Table";
import type { Column } from "../../Components/Common/Table/Table";
import Pagination from "../../Components/Common/Table/Pagination";
import Modal from "../../Components/Common/Modal/Modal";
import DynamicForm from "../../Components/Common/Modal/DynamicForm";
import ConfirmationModal from "../../Components/Common/Modal/ConfirmationModal";
import type { Hospital, HospitalPayload } from "../../Types/Hospital";
import { useHospital } from "../../Hooks/useHospital";
import { hospitalFormFields } from "./HospitalFormConfigs";
import { useToast } from "../../Contexts/ToastContext";
import { getErrorMessage } from "../../Utils/errorHandler";

// Tipo estendido para incluir 'id' necessário para o componente Table
type HospitalWithId = Hospital & { id: string };

const Hospitals: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<HospitalWithId | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [hospitalToDelete, setHospitalToDelete] = useState<HospitalWithId | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  const toast = useToast();
  const { fetchHospitals, createHospital, updateHospital, deleteHospital } = useHospital();
  const { data: hospitalsData, isLoading, error } = fetchHospitals(currentPage, itemsPerPage);
  const { mutate: createHospitalMutation, isPending: isCreating } = createHospital();
  const { mutate: updateHospitalMutation, isPending: isUpdating } = updateHospital();

  // Adaptar dados para incluir 'id' baseado em 'public_id'
  const hospitalsWithId: HospitalWithId[] = (hospitalsData?.items || []).map((hospital: Hospital) => ({
    ...hospital,
    id: hospital.public_id
  }));

  // Filtrar hospitais baseado no termo de busca
  const filteredHospitals = hospitalsWithId.filter((hospital) => {
    if (!searchTerm) return true;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return (
      hospital.name.toLowerCase().includes(lowerSearchTerm) ||
      hospital.document.toLowerCase().includes(lowerSearchTerm) ||
      hospital.city.toLowerCase().includes(lowerSearchTerm) ||
      hospital.email.toLowerCase().includes(lowerSearchTerm) ||
      hospital.phone.toLowerCase().includes(lowerSearchTerm)
    );
  });

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

  const handleView = (hospital: HospitalWithId) => {
    setSelectedHospital(hospital);
    setIsViewMode(true);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (hospital: HospitalWithId) => {
    setSelectedHospital(hospital);
    setIsEditMode(true);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleDelete = (hospital: HospitalWithId) => {
    setHospitalToDelete(hospital);
    setIsConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!hospitalToDelete) return;

    setIsDeleting(true);
    try {
      await deleteHospital(hospitalToDelete.public_id);
      toast.success('Hospital excluído', 'Hospital excluído com sucesso!');
      setIsConfirmationOpen(false);
      setHospitalToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir hospital:', error);
      toast.error('Erro ao excluir', getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmationOpen(false);
    setHospitalToDelete(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNewHospital = () => {
    setSelectedHospital(null);
    setIsViewMode(false);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedHospital(null);
    setIsViewMode(false);
    setIsEditMode(false);
  };

  const handleSubmitHospital = (data: HospitalPayload) => {
    if (isEditMode && selectedHospital) {
      // Modo de edição
      updateHospitalMutation(
        { id: selectedHospital.public_id, data },
        {
          onSuccess: () => {
            toast.success('Hospital atualizado', 'Hospital atualizado com sucesso!');
            setIsModalOpen(false);
            setSelectedHospital(null);
            setIsEditMode(false);
          },
          onError: (error) => {
            console.error('Erro ao editar hospital:', error);
            toast.error('Erro ao atualizar', getErrorMessage(error));
          }
        }
      );
    } else {
      // Modo de criação
      createHospitalMutation(data, {
        onSuccess: () => {
          toast.success('Hospital criado', 'Hospital criado com sucesso!');
          setIsModalOpen(false);
        },
        onError: (error) => {
          console.error('Erro ao criar hospital:', error);
          toast.error('Erro ao criar', getErrorMessage(error));
        }
      });
    }
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
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar hospitais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
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
                data={filteredHospitals}
                columns={columns}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                emptyMessage={searchTerm ? "Nenhum hospital encontrado com esse termo" : "Nenhum hospital encontrado"}
              />
              {!searchTerm && (
                <Pagination
                  currentPage={currentPage}
                  totalItems={hospitalsData?.total || 0}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de Criação/Visualização/Edição */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          isViewMode
            ? "Detalhes do Hospital"
            : isEditMode
            ? "Editar Hospital"
            : "Criar Novo Hospital"
        }
      >
        <DynamicForm<HospitalPayload>
          fields={hospitalFormFields}
          onSubmit={handleSubmitHospital}
          onCancel={handleCloseModal}
          isLoading={isCreating || isUpdating}
          submitLabel={isEditMode ? "Salvar Alterações" : "Criar Hospital"}
          cancelLabel="Cancelar"
          initialValues={selectedHospital || undefined}
          readOnly={isViewMode}
        />
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir Hospital"
        message={`Tem certeza que deseja excluir o hospital "${hospitalToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        isLoading={isDeleting}
        variant="danger"
      />
    </Layout>
  );
};

export default Hospitals;
