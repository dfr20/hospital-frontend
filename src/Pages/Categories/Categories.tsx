import React, { useState } from "react";
import { Layout } from "../../Components/Common/Layout/Layout";
import { Filter, Plus } from "lucide-react";
import Table from "../../Components/Common/Table/Table";
import type { Column } from "../../Components/Common/Table/Table";
import Pagination from "../../Components/Common/Table/Pagination";
import Modal from "../../Components/Common/Modal/Modal";
import DynamicForm from "../../Components/Common/Modal/DynamicForm";
import ConfirmationModal from "../../Components/Common/Modal/ConfirmationModal";
import type { Category, CategoryPayload } from "../../Types/Category";
import { useCategories } from "../../Hooks/useCategories";
import { categoryFormFields } from "./CategoryFormConfigs";
import { useToast } from "../../Contexts/ToastContext";
import { getErrorMessage } from "../../Utils/errorHandler";

// Tipo estendido para incluir 'id' necessário para o componente Table
type CategoryWithId = Category & { id: string };

const Categories: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithId | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryWithId | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  const toast = useToast();
  const { fetchCategories, createCategory, updateCategory, deleteCategory } = useCategories();

  const { data: categoriesData, isLoading, error } = fetchCategories(currentPage, itemsPerPage);
  const { mutate: createCategoryMutation, isPending: isCreating } = createCategory();
  const { mutate: updateCategoryMutation, isPending: isUpdating } = updateCategory();

  // Adaptar dados para incluir 'id' baseado em 'public_id'
  const categoriesWithId: CategoryWithId[] = (categoriesData?.items || []).map((category: Category) => ({
    ...category,
    id: category.public_id
  }));

  // Filtrar categorias baseado no termo de busca
  const filteredCategories = categoriesWithId.filter((category) => {
    if (!searchTerm) return true;

    const lowerSearchTerm = searchTerm.toLowerCase();

    return (
      category.name.toLowerCase().includes(lowerSearchTerm) ||
      category.description.toLowerCase().includes(lowerSearchTerm)
    );
  });

  // Definição das colunas da tabela
  const columns: Column<CategoryWithId>[] = [
    {
      key: 'name',
      header: 'Nome',
      render: (category) => (
        <div className="text-sm font-medium text-gray-900">{category.name}</div>
      )
    },
    {
      key: 'description',
      header: 'Descrição',
      hideOnMobile: true,
      render: (category) => (
        <div className="text-sm text-gray-500">{category.description}</div>
      )
    }
  ];

  const handleView = (category: CategoryWithId) => {
    setSelectedCategory(category);
    setIsViewMode(true);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (category: CategoryWithId) => {
    setSelectedCategory(category);
    setIsEditMode(true);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleDelete = (category: CategoryWithId) => {
    setCategoryToDelete(category);
    setIsConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    try {
      await deleteCategory(categoryToDelete.public_id);
      toast.success('Categoria excluída', 'Categoria excluída com sucesso!');
      setIsConfirmationOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast.error('Erro ao excluir', getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmationOpen(false);
    setCategoryToDelete(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNewCategory = () => {
    setSelectedCategory(null);
    setIsViewMode(false);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    setIsViewMode(false);
    setIsEditMode(false);
  };

  const handleSubmitCategory = (data: CategoryPayload) => {
    if (isEditMode && selectedCategory) {
      // Modo de edição
      updateCategoryMutation(
        { id: selectedCategory.public_id, data },
        {
          onSuccess: () => {
            toast.success('Categoria atualizada', 'Categoria atualizada com sucesso!');
            setIsModalOpen(false);
            setSelectedCategory(null);
            setIsEditMode(false);
          },
          onError: (error) => {
            console.error('Erro ao editar categoria:', error);
            toast.error('Erro ao atualizar', getErrorMessage(error));
          }
        }
      );
    } else {
      // Modo de criação
      createCategoryMutation(data, {
        onSuccess: () => {
          toast.success('Categoria criada', 'Categoria criada com sucesso!');
          setIsModalOpen(false);
        },
        onError: (error) => {
          console.error('Erro ao criar categoria:', error);
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar categorias</h3>
            <p className="text-gray-500">Tente novamente mais tarde</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Preparar valores iniciais para o formulário
  const initialValues = selectedCategory ? {
    name: selectedCategory.name,
    description: selectedCategory.description
  } : undefined;

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
                placeholder="Buscar categorias..."
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
                onClick={handleNewCategory}
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nova Categoria</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de Categorias */}
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Carregando...</div>
            </div>
          ) : (
            <>
              <Table<CategoryWithId>
                data={filteredCategories}
                columns={columns}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                emptyMessage={searchTerm ? "Nenhuma categoria encontrada com esse termo" : "Nenhuma categoria encontrada"}
              />
              {!searchTerm && (
                <Pagination
                  currentPage={currentPage}
                  totalItems={categoriesData?.total || 0}
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
            ? "Detalhes da Categoria"
            : isEditMode
            ? "Editar Categoria"
            : "Criar Nova Categoria"
        }
      >
        <DynamicForm<CategoryPayload>
          fields={categoryFormFields}
          onSubmit={handleSubmitCategory}
          onCancel={handleCloseModal}
          isLoading={isCreating || isUpdating}
          submitLabel={isEditMode ? "Salvar Alterações" : "Criar Categoria"}
          cancelLabel="Cancelar"
          initialValues={initialValues}
          readOnly={isViewMode}
        />
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir Categoria"
        message={`Tem certeza que deseja excluir a categoria "${categoryToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        isLoading={isDeleting}
        variant="danger"
      />
    </Layout>
  );
};

export default Categories;
