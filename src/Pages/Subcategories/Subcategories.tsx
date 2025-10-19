import React, { useState, useMemo } from "react";
import { Layout } from "../../Components/Common/Layout/Layout";
import { Filter, Plus } from "lucide-react";
import Table from "../../Components/Common/Table/Table";
import type { Column } from "../../Components/Common/Table/Table";
import Pagination from "../../Components/Common/Table/Pagination";
import Modal from "../../Components/Common/Modal/Modal";
import DynamicForm from "../../Components/Common/Modal/DynamicForm";
import ConfirmationModal from "../../Components/Common/Modal/ConfirmationModal";
import type { Subcategory, SubcategoryPayload } from "../../Types/Subcategory";
import { useSubcategories } from "../../Hooks/useSubcategories";
import { useCategories } from "../../Hooks/useCategories";
import { subcategoryFormFields } from "./SubcategoryFormConfigs";
import { useToast } from "../../Contexts/ToastContext";
import { getErrorMessage } from "../../Utils/errorHandler";
import type { FieldConfig } from "../../Components/Common/Modal/DynamicForm";

// Tipo estendido para incluir 'id' necessário para o componente Table
type SubcategoryWithId = Subcategory & { id: string };

const Subcategories: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<SubcategoryWithId | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<SubcategoryWithId | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  const toast = useToast();
  const { fetchSubcategories, createSubcategory, updateSubcategory, deleteSubcategory } = useSubcategories();
  const { fetchCategories } = useCategories();

  const { data: subcategoriesData, isLoading, error } = fetchSubcategories(currentPage, itemsPerPage);
  const { data: categoriesData } = fetchCategories(1, 100); // Buscar todas as categorias para o dropdown
  const { mutate: createSubcategoryMutation, isPending: isCreating } = createSubcategory();
  const { mutate: updateSubcategoryMutation, isPending: isUpdating } = updateSubcategory();

  // Adaptar dados para incluir 'id' baseado em 'public_id'
  const subcategoriesWithId: SubcategoryWithId[] = (subcategoriesData?.items || []).map((subcategory: Subcategory) => ({
    ...subcategory,
    id: subcategory.public_id
  }));

  // Criar mapa de categorias para exibição
  const categoriesMap = useMemo(() => {
    if (!categoriesData?.items) return {};
    return categoriesData.items.reduce((acc, cat) => {
      acc[cat.public_id] = cat.name;
      return acc;
    }, {} as Record<string, string>);
  }, [categoriesData]);

  // Configurar opções de categorias dinamicamente
  const formFieldsWithCategories: FieldConfig[] = useMemo(() => {
    return subcategoryFormFields.map(field => {
      if (field.name === 'category_id') {
        return {
          ...field,
          options: categoriesData?.items.map(cat => ({
            value: cat.public_id,
            label: cat.name
          })) || []
        };
      }
      return field;
    });
  }, [categoriesData]);

  // Filtrar subcategorias baseado no termo de busca
  const filteredSubcategories = subcategoriesWithId.filter((subcategory) => {
    if (!searchTerm) return true;

    const lowerSearchTerm = searchTerm.toLowerCase();
    const categoryName = categoriesMap[subcategory.category_public_id]?.toLowerCase() || '';

    return (
      subcategory.name.toLowerCase().includes(lowerSearchTerm) ||
      subcategory.description.toLowerCase().includes(lowerSearchTerm) ||
      categoryName.includes(lowerSearchTerm)
    );
  });

  // Definição das colunas da tabela
  const columns: Column<SubcategoryWithId>[] = [
    {
      key: 'name',
      header: 'Nome',
      render: (subcategory) => (
        <div className="text-sm font-medium text-gray-900">{subcategory.name}</div>
      )
    },
    {
      key: 'description',
      header: 'Descrição',
      hideOnMobile: true,
      render: (subcategory) => (
        <div className="text-sm text-gray-500">{subcategory.description}</div>
      )
    },
    {
      key: 'category_public_id',
      header: 'Categoria',
      hideOnTablet: true,
      render: (subcategory) => (
        <div className="text-sm text-gray-500">
          {categoriesMap[subcategory.category_public_id] || 'N/A'}
        </div>
      )
    }
  ];

  const handleView = (subcategory: SubcategoryWithId) => {
    setSelectedSubcategory(subcategory);
    setIsViewMode(true);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (subcategory: SubcategoryWithId) => {
    setSelectedSubcategory(subcategory);
    setIsEditMode(true);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleDelete = (subcategory: SubcategoryWithId) => {
    setSubcategoryToDelete(subcategory);
    setIsConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!subcategoryToDelete) return;

    setIsDeleting(true);
    try {
      await deleteSubcategory(subcategoryToDelete.public_id);
      toast.success('Subcategoria excluída', 'Subcategoria excluída com sucesso!');
      setIsConfirmationOpen(false);
      setSubcategoryToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir subcategoria:', error);
      toast.error('Erro ao excluir', getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmationOpen(false);
    setSubcategoryToDelete(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNewSubcategory = () => {
    setSelectedSubcategory(null);
    setIsViewMode(false);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSubcategory(null);
    setIsViewMode(false);
    setIsEditMode(false);
  };

  const handleSubmitSubcategory = (data: SubcategoryPayload) => {
    if (isEditMode && selectedSubcategory) {
      // Modo de edição
      updateSubcategoryMutation(
        { id: selectedSubcategory.public_id, data },
        {
          onSuccess: () => {
            toast.success('Subcategoria atualizada', 'Subcategoria atualizada com sucesso!');
            setIsModalOpen(false);
            setSelectedSubcategory(null);
            setIsEditMode(false);
          },
          onError: (error) => {
            console.error('Erro ao editar subcategoria:', error);
            toast.error('Erro ao atualizar', getErrorMessage(error));
          }
        }
      );
    } else {
      // Modo de criação
      createSubcategoryMutation(data, {
        onSuccess: () => {
          toast.success('Subcategoria criada', 'Subcategoria criada com sucesso!');
          setIsModalOpen(false);
        },
        onError: (error) => {
          console.error('Erro ao criar subcategoria:', error);
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar subcategorias</h3>
            <p className="text-gray-500">Tente novamente mais tarde</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Preparar valores iniciais para o formulário
  const initialValues = selectedSubcategory ? {
    ...selectedSubcategory,
    category_id: selectedSubcategory.category_public_id
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
                placeholder="Buscar subcategorias..."
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
                onClick={handleNewSubcategory}
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nova Subcategoria</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de Subcategorias */}
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Carregando...</div>
            </div>
          ) : (
            <>
              <Table<SubcategoryWithId>
                data={filteredSubcategories}
                columns={columns}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                emptyMessage={searchTerm ? "Nenhuma subcategoria encontrada com esse termo" : "Nenhuma subcategoria encontrada"}
              />
              {!searchTerm && (
                <Pagination
                  currentPage={currentPage}
                  totalItems={subcategoriesData?.total || 0}
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
            ? "Detalhes da Subcategoria"
            : isEditMode
            ? "Editar Subcategoria"
            : "Criar Nova Subcategoria"
        }
      >
        <DynamicForm<SubcategoryPayload>
          fields={formFieldsWithCategories}
          onSubmit={handleSubmitSubcategory}
          onCancel={handleCloseModal}
          isLoading={isCreating || isUpdating}
          submitLabel={isEditMode ? "Salvar Alterações" : "Criar Subcategoria"}
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
        title="Excluir Subcategoria"
        message={`Tem certeza que deseja excluir a subcategoria "${subcategoryToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        isLoading={isDeleting}
        variant="danger"
      />
    </Layout>
  );
};

export default Subcategories;
