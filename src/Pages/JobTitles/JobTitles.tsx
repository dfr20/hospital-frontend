import React, { useState } from "react";
import { Layout } from "../../Components/Common/Layout/Layout";
import { Filter, Plus } from "lucide-react";
import Table from "../../Components/Common/Table/Table";
import type { Column } from "../../Components/Common/Table/Table";
import Pagination from "../../Components/Common/Table/Pagination";
import Modal from "../../Components/Common/Modal/Modal";
import DynamicForm from "../../Components/Common/Modal/DynamicForm";
import ConfirmationModal from "../../Components/Common/Modal/ConfirmationModal";
import SearchData from "../../Components/Utils/SearchData";
import type { JobTitle, JobTitlePayload } from "../../Types/JobTitle";
import { useJobTitles } from "../../Hooks/useJobTitles";
import { jobTitleFormFields } from "./JobTitleFormConfigs";
import { useToast } from "../../Contexts/ToastContext";

// Tipo estendido para incluir 'id' necessário para o componente Table
type JobTitleWithId = JobTitle & { id: string };

const JobTitles: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJobTitle, setSelectedJobTitle] = useState<JobTitleWithId | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [jobTitleToDelete, setJobTitleToDelete] = useState<JobTitleWithId | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 10;

  const toast = useToast();
  const { fetchJobTitles, createJobTitle, updateJobTitle, deleteJobTitle } = useJobTitles();
  const { data: jobTitlesData, isLoading, error } = fetchJobTitles(currentPage, itemsPerPage);
  const { mutate: createJobTitleMutation, isPending: isCreating } = createJobTitle();
  const { mutate: updateJobTitleMutation, isPending: isUpdating } = updateJobTitle();

  // Adaptar dados para incluir 'id' baseado em 'public_id'
  const jobTitlesWithId: JobTitleWithId[] = (jobTitlesData?.items || []).map((jobTitle: JobTitle) => ({
    ...jobTitle,
    id: jobTitle.public_id
  }));

  // Definição das colunas da tabela
  const columns: Column<JobTitleWithId>[] = [
    {
      key: 'title',
      header: 'Título do Cargo',
      render: (jobTitle) => (
        <div className="text-sm font-medium text-gray-900">{jobTitle.title}</div>
      )
    },
    {
      key: 'created_at',
      header: 'Data de Criação',
      hideOnMobile: true,
      render: (jobTitle) => (
        <div className="text-sm text-gray-500">
          {new Date(jobTitle.created_at).toLocaleDateString('pt-BR')}
        </div>
      )
    },
    {
      key: 'updated_at',
      header: 'Última Atualização',
      hideOnTablet: true,
      render: (jobTitle) => (
        <div className="text-sm text-gray-500">
          {new Date(jobTitle.updated_at).toLocaleDateString('pt-BR')}
        </div>
      )
    }
  ];

  const handleView = (jobTitle: JobTitleWithId) => {
    setSelectedJobTitle(jobTitle);
    setIsViewMode(true);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (jobTitle: JobTitleWithId) => {
    setSelectedJobTitle(jobTitle);
    setIsEditMode(true);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleDelete = (jobTitle: JobTitleWithId) => {
    setJobTitleToDelete(jobTitle);
    setIsConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!jobTitleToDelete) return;

    setIsDeleting(true);
    try {
      await deleteJobTitle(jobTitleToDelete.public_id);
      toast.success('Cargo excluído', 'Cargo excluído com sucesso!');
      setIsConfirmationOpen(false);
      setJobTitleToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir cargo:', error);
      toast.error('Erro ao excluir', 'Não foi possível excluir o cargo. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmationOpen(false);
    setJobTitleToDelete(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNewJobTitle = () => {
    setSelectedJobTitle(null);
    setIsViewMode(false);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJobTitle(null);
    setIsViewMode(false);
    setIsEditMode(false);
  };

  const handleSubmitJobTitle = (data: JobTitlePayload) => {
    if (isEditMode && selectedJobTitle) {
      // Modo de edição
      updateJobTitleMutation(
        { id: selectedJobTitle.public_id, data },
        {
          onSuccess: () => {
            toast.success('Cargo atualizado', 'Cargo atualizado com sucesso!');
            setIsModalOpen(false);
            setSelectedJobTitle(null);
            setIsEditMode(false);
          },
          onError: (error) => {
            console.error('Erro ao editar cargo:', error);
            toast.error('Erro ao atualizar', 'Não foi possível atualizar o cargo. Tente novamente.');
          }
        }
      );
    } else {
      // Modo de criação
      createJobTitleMutation(data, {
        onSuccess: () => {
          toast.success('Cargo criado', 'Cargo criado com sucesso!');
          setIsModalOpen(false);
        },
        onError: (error) => {
          console.error('Erro ao criar cargo:', error);
          toast.error('Erro ao criar', 'Não foi possível criar o cargo. Tente novamente.');
        }
      });
    }
  };

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar cargos</h3>
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
              <SearchData
                onSelect={(item) => {
                  console.log('Cargo selecionado:', item);
                  // Aqui você pode adicionar lógica para filtrar ou navegar
                }}
              />
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filtrar</span>
              </button>
              <button
                onClick={handleNewJobTitle}
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Novo Cargo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de Cargos */}
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Carregando...</div>
            </div>
          ) : (
            <>
              <Table<JobTitleWithId>
                data={jobTitlesWithId}
                columns={columns}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                emptyMessage="Nenhum cargo encontrado"
              />
              <Pagination
                currentPage={currentPage}
                totalItems={jobTitlesData?.total || 0}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
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
            ? "Detalhes do Cargo"
            : isEditMode
            ? "Editar Cargo"
            : "Criar Novo Cargo"
        }
      >
        <DynamicForm<JobTitlePayload>
          fields={jobTitleFormFields}
          onSubmit={handleSubmitJobTitle}
          onCancel={handleCloseModal}
          isLoading={isCreating || isUpdating}
          submitLabel={isEditMode ? "Salvar Alterações" : "Criar Cargo"}
          cancelLabel="Cancelar"
          initialValues={selectedJobTitle || undefined}
          readOnly={isViewMode}
        />
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir Cargo"
        message={`Tem certeza que deseja excluir o cargo "${jobTitleToDelete?.title}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        isLoading={isDeleting}
        variant="danger"
      />
    </Layout>
  );
};

export default JobTitles;
