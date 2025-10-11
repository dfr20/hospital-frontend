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
import type { Catalog, CatalogPayload } from "../../Types/Catalog";
import { useCatalog } from "../../Hooks/useCatalog";
import { catalogFormFields } from "./CatalogFormConfigs";
import { useToast } from "../../Contexts/ToastContext";

// Tipo estendido para incluir 'id' necessário para o componente Table
type CatalogWithId = Catalog & { id: string };

const Catalogs: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState<CatalogWithId | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [catalogToDelete, setCatalogToDelete] = useState<CatalogWithId | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 10;

  const toast = useToast();
  const { fetchCatalogs, createCatalog, updateCatalog, deleteCatalog } = useCatalog();
  const { data: catalogsData, isLoading, error } = fetchCatalogs(currentPage, itemsPerPage);
  const { mutate: createCatalogMutation, isPending: isCreating } = createCatalog();
  const { mutate: updateCatalogMutation, isPending: isUpdating } = updateCatalog();

  // Adaptar dados para incluir 'id' baseado em 'public_id'
  const catalogsWithId: CatalogWithId[] = (catalogsData?.items || []).map((catalog: Catalog) => ({
    ...catalog,
    id: catalog.public_id
  }));

  // Definição das colunas da tabela
  const columns: Column<CatalogWithId>[] = [
    {
      key: 'name',
      header: 'Nome',
      render: (catalog) => (
        <div className="text-sm font-medium text-gray-900">{catalog.name}</div>
      )
    },
    {
      key: 'description',
      header: 'Descrição',
      hideOnMobile: true,
      render: (catalog) => (
        <div className="text-sm text-gray-500">{catalog.description}</div>
      )
    },
    {
      key: 'presentation',
      header: 'Apresentação',
      hideOnTablet: true,
      render: (catalog) => (
        <div className="text-sm text-gray-500">{catalog.presentation}</div>
      )
    },
    {
      key: 'created_at',
      header: 'Data de Criação',
      hideOnTablet: true,
      render: (catalog) => (
        <div className="text-sm text-gray-500">
          {new Date(catalog.created_at).toLocaleDateString('pt-BR')}
        </div>
      )
    }
  ];

  const handleView = (catalog: CatalogWithId) => {
    setSelectedCatalog(catalog);
    setIsViewMode(true);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (catalog: CatalogWithId) => {
    setSelectedCatalog(catalog);
    setIsEditMode(true);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleDelete = (catalog: CatalogWithId) => {
    setCatalogToDelete(catalog);
    setIsConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!catalogToDelete) return;

    setIsDeleting(true);
    try {
      await deleteCatalog(catalogToDelete.public_id);
      toast.success('Item excluído', 'Item do catálogo excluído com sucesso!');
      setIsConfirmationOpen(false);
      setCatalogToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir item do catálogo:', error);
      toast.error('Erro ao excluir', 'Não foi possível excluir o item. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmationOpen(false);
    setCatalogToDelete(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNewCatalog = () => {
    setSelectedCatalog(null);
    setIsViewMode(false);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCatalog(null);
    setIsViewMode(false);
    setIsEditMode(false);
  };

  const handleSubmitCatalog = (data: CatalogPayload) => {
    if (isEditMode && selectedCatalog) {
      // Modo de edição
      updateCatalogMutation(
        { id: selectedCatalog.public_id, data },
        {
          onSuccess: () => {
            toast.success('Item atualizado', 'Item do catálogo atualizado com sucesso!');
            setIsModalOpen(false);
            setSelectedCatalog(null);
            setIsEditMode(false);
          },
          onError: (error) => {
            console.error('Erro ao editar item do catálogo:', error);
            toast.error('Erro ao atualizar', 'Não foi possível atualizar o item. Tente novamente.');
          }
        }
      );
    } else {
      // Modo de criação
      createCatalogMutation(data, {
        onSuccess: () => {
          toast.success('Item criado', 'Item do catálogo criado com sucesso!');
          setIsModalOpen(false);
        },
        onError: (error) => {
          console.error('Erro ao criar item do catálogo:', error);
          toast.error('Erro ao criar', 'Não foi possível criar o item. Tente novamente.');
        }
      });
    }
  };

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar catálogo</h3>
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
                  console.log('Item do catálogo selecionado:', item);
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
                onClick={handleNewCatalog}
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Novo Item</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de Catálogo */}
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Carregando...</div>
            </div>
          ) : (
            <>
              <Table<CatalogWithId>
                data={catalogsWithId}
                columns={columns}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                emptyMessage="Nenhum item encontrado no catálogo"
              />
              <Pagination
                currentPage={currentPage}
                totalItems={catalogsData?.total || 0}
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
            ? "Detalhes do Item"
            : isEditMode
            ? "Editar Item"
            : "Criar Novo Item"
        }
      >
        <DynamicForm<CatalogPayload>
          fields={catalogFormFields}
          onSubmit={handleSubmitCatalog}
          onCancel={handleCloseModal}
          isLoading={isCreating || isUpdating}
          submitLabel={isEditMode ? "Salvar Alterações" : "Criar Item"}
          cancelLabel="Cancelar"
          initialValues={selectedCatalog || undefined}
          readOnly={isViewMode}
        />
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir Item"
        message={`Tem certeza que deseja excluir "${catalogToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        isLoading={isDeleting}
        variant="danger"
      />
    </Layout>
  );
};

export default Catalogs;
