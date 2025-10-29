import React, { useState } from "react";
import { Layout } from "../../Components/Common/Layout/Layout";
import { Filter, Plus } from "lucide-react";
import Table from "../../Components/Common/Table/Table";
import type { Column } from "../../Components/Common/Table/Table";
import Pagination from "../../Components/Common/Table/Pagination";
import Modal from "../../Components/Common/Modal/Modal";
import DynamicForm from "../../Components/Common/Modal/DynamicForm";
import ConfirmationModal from "../../Components/Common/Modal/ConfirmationModal";
import type { PublicAcquisition, PublicAcquisitionPayload } from "../../Types/PublicAcquisition";
import { usePublicAcquisitions } from "../../Hooks/usePublicAcquisitions";
import { publicAcquisitionFormFields } from "./PublicAcquisitionFormConfigs";
import { useToast } from "../../Contexts/ToastContext";
import { getErrorMessage } from "../../Utils/errorHandler";

// Tipo estendido para incluir 'id' necessário para o componente Table
type PublicAcquisitionWithId = PublicAcquisition & { id: string };

const PublicAcquisitions: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPublicAcquisition, setSelectedPublicAcquisition] = useState<PublicAcquisitionWithId | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [publicAcquisitionToDelete, setPublicAcquisitionToDelete] = useState<PublicAcquisitionWithId | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  const toast = useToast();
  const { fetchPublicAcquisitions, createPublicAcquisition, updatePublicAcquisition, deletePublicAcquisition } = usePublicAcquisitions();

  const { data: publicAcquisitionsData, isLoading, error } = fetchPublicAcquisitions(currentPage, itemsPerPage);
  const { mutate: createPublicAcquisitionMutation, isPending: isCreating } = createPublicAcquisition();
  const { mutate: updatePublicAcquisitionMutation, isPending: isUpdating } = updatePublicAcquisition();

  // Adaptar dados para incluir 'id' baseado em 'public_id'
  const publicAcquisitionsWithId: PublicAcquisitionWithId[] = (publicAcquisitionsData?.items || []).map((publicAcquisition: PublicAcquisition) => ({
    ...publicAcquisition,
    id: publicAcquisition.public_id
  }));

  // Filtrar licitações baseado no termo de busca
  const filteredPublicAcquisitions = publicAcquisitionsWithId.filter((publicAcquisition) => {
    if (!searchTerm) return true;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return (
      publicAcquisition.code.toLowerCase().includes(lowerSearchTerm) ||
      publicAcquisition.title.toLowerCase().includes(lowerSearchTerm)
    );
  });

  // Definição das colunas da tabela
  const columns: Column<PublicAcquisitionWithId>[] = [
    {
      key: 'code',
      header: 'Código',
      render: (publicAcquisition) => (
        <div className="text-sm font-medium text-gray-900">{publicAcquisition.code}</div>
      )
    },
    {
      key: 'title',
      header: 'Título',
      hideOnMobile: true,
      render: (publicAcquisition) => (
        <div className="text-sm text-gray-500">{publicAcquisition.title}</div>
      )
    },
    {
      key: 'created_at',
      header: 'Data de Criação',
      hideOnTablet: true,
      render: (publicAcquisition) => (
        <div className="text-sm text-gray-500">
          {new Date(publicAcquisition.created_at).toLocaleDateString('pt-BR')}
        </div>
      )
    }
  ];

  const handleView = (publicAcquisition: PublicAcquisitionWithId) => {
    setSelectedPublicAcquisition(publicAcquisition);
    setIsViewMode(true);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (publicAcquisition: PublicAcquisitionWithId) => {
    setSelectedPublicAcquisition(publicAcquisition);
    setIsEditMode(true);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleDelete = (publicAcquisition: PublicAcquisitionWithId) => {
    setPublicAcquisitionToDelete(publicAcquisition);
    setIsConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!publicAcquisitionToDelete) return;

    setIsDeleting(true);
    try {
      await deletePublicAcquisition(publicAcquisitionToDelete.public_id);
      toast.success('Licitação excluída', 'Licitação excluída com sucesso!');
      setIsConfirmationOpen(false);
      setPublicAcquisitionToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir licitação:', error);
      toast.error('Erro ao excluir', getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmationOpen(false);
    setPublicAcquisitionToDelete(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNewPublicAcquisition = () => {
    setSelectedPublicAcquisition(null);
    setIsViewMode(false);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPublicAcquisition(null);
    setIsViewMode(false);
    setIsEditMode(false);
  };

  const handleSubmitPublicAcquisition = (data: PublicAcquisitionPayload) => {
    if (isEditMode && selectedPublicAcquisition) {
      // Modo de edição
      updatePublicAcquisitionMutation(
        { id: selectedPublicAcquisition.public_id, data },
        {
          onSuccess: () => {
            toast.success('Licitação atualizada', 'Licitação atualizada com sucesso!');
            setIsModalOpen(false);
            setSelectedPublicAcquisition(null);
            setIsEditMode(false);
          },
          onError: (error) => {
            console.error('Erro ao editar licitação:', error);
            toast.error('Erro ao atualizar', getErrorMessage(error));
          }
        }
      );
    } else {
      // Modo de criação
      createPublicAcquisitionMutation(data, {
        onSuccess: () => {
          toast.success('Licitação criada', 'Licitação criada com sucesso!');
          setIsModalOpen(false);
        },
        onError: (error) => {
          console.error('Erro ao criar licitação:', error);
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar licitações</h3>
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
                placeholder="Buscar licitações..."
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
                onClick={handleNewPublicAcquisition}
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nova Licitação</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de Licitações */}
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Carregando...</div>
            </div>
          ) : (
            <>
              <Table<PublicAcquisitionWithId>
                data={filteredPublicAcquisitions}
                columns={columns}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                emptyMessage={searchTerm ? "Nenhuma licitação encontrada com esse termo" : "Nenhuma licitação encontrada"}
              />
              {!searchTerm && (
                <Pagination
                  currentPage={currentPage}
                  totalItems={publicAcquisitionsData?.total || 0}
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
            ? "Detalhes da Licitação"
            : isEditMode
            ? "Editar Licitação"
            : "Criar Nova Licitação"
        }
      >
        <DynamicForm<PublicAcquisitionPayload>
          fields={publicAcquisitionFormFields}
          onSubmit={handleSubmitPublicAcquisition}
          onCancel={handleCloseModal}
          isLoading={isCreating || isUpdating}
          submitLabel={isEditMode ? "Salvar Alterações" : "Criar Licitação"}
          cancelLabel="Cancelar"
          initialValues={selectedPublicAcquisition ? {
            code: selectedPublicAcquisition.code,
            title: selectedPublicAcquisition.title
          } : undefined}
          readOnly={isViewMode}
        />
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir Licitação"
        message={`Tem certeza que deseja excluir a licitação "${publicAcquisitionToDelete?.code} - ${publicAcquisitionToDelete?.title}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        isLoading={isDeleting}
        variant="danger"
      />
    </Layout>
  );
};

export default PublicAcquisitions;
