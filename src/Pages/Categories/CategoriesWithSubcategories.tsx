import React, { useState } from 'react';
import { Layout } from '../../Components/Common/Layout/Layout';
import { Plus, ChevronDown, ChevronUp, Edit, Trash2, FolderOpen, Tag, Filter } from 'lucide-react';
import Pagination from '../../Components/Common/Table/Pagination';
import Modal from '../../Components/Common/Modal/Modal';
import DynamicForm from '../../Components/Common/Modal/DynamicForm';
import ConfirmationModal from '../../Components/Common/Modal/ConfirmationModal';
import { useCategories } from '../../Hooks/useCategories';
import { useSubcategories } from '../../Hooks/useSubcategories';
import { useToast } from '../../Contexts/ToastContext';
import { categoryFormFields } from './CategoryFormConfigs';
import { subcategoryFormFieldsSimple } from '../Subcategories/SubcategoryFormConfigs';
import type { Category } from '../../Types/Category';
import type { Subcategory } from '../../Types/Subcategory';

const CategoriesWithSubcategories: React.FC = () => {
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'category' | 'subcategory'; item: Category | Subcategory } | null>(null);
  const itemsPerPage = 10;

  const { fetchCategoriesWithSubcategories, createCategory, updateCategory, deleteCategory } = useCategories();
  const { createSubcategory, updateSubcategory, deleteSubcategory } = useSubcategories();
  
  const { data, isLoading, error } = fetchCategoriesWithSubcategories(currentPage, itemsPerPage);
  const createCategoryMutation = createCategory();
  const updateCategoryMutation = updateCategory();
  const createSubcategoryMutation = createSubcategory();
  const updateSubcategoryMutation = updateSubcategory();

  // Filtrar categorias baseado no termo de busca
  const filteredCategories = data?.items?.filter((category) => {
    if (!searchTerm) return true;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return (
      category.name.toLowerCase().includes(lowerSearchTerm) ||
      category.description.toLowerCase().includes(lowerSearchTerm) ||
      category.subcategories?.some(sub => 
        sub.name.toLowerCase().includes(lowerSearchTerm) ||
        sub.description.toLowerCase().includes(lowerSearchTerm)
      )
    );
  }) || [];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Category handlers
  const handleCreateCategory = () => {
    setModalMode('create');
    setSelectedCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setModalMode('edit');
    setSelectedCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (formData: Record<string, unknown>) => {
    try {
      if (modalMode === 'create') {
        await createCategoryMutation.mutateAsync(formData as any);
        showToast('success', 'Categoria criada com sucesso!');
      } else if (selectedCategory) {
        await updateCategoryMutation.mutateAsync({
          id: selectedCategory.public_id,
          data: formData as any,
        });
        showToast('success', 'Categoria atualizada com sucesso!');
      }
      setIsCategoryModalOpen(false);
    } catch (error) {
      showToast('error', modalMode === 'create' ? 'Erro ao criar categoria' : 'Erro ao atualizar categoria');
    }
  };

  // Subcategory handlers
  const handleCreateSubcategory = (category: Category) => {
    setModalMode('create');
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    setIsSubcategoryModalOpen(true);
  };

  const handleEditSubcategory = (category: Category, subcategory: Subcategory) => {
    setModalMode('edit');
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
    setIsSubcategoryModalOpen(true);
  };

  const handleSubcategorySubmit = async (formData: Record<string, unknown>) => {
    try {
      if (modalMode === 'create' && selectedCategory) {
        await createSubcategoryMutation.mutateAsync({
          ...formData,
          category_id: selectedCategory.public_id,
        } as any);
        showToast('success', 'Subcategoria criada com sucesso!');
      } else if (selectedSubcategory) {
        await updateSubcategoryMutation.mutateAsync({
          id: selectedSubcategory.public_id,
          data: formData as any,
        });
        showToast('success', 'Subcategoria atualizada com sucesso!');
      }
      setIsSubcategoryModalOpen(false);
    } catch (error) {
      showToast('error', modalMode === 'create' ? 'Erro ao criar subcategoria' : 'Erro ao atualizar subcategoria');
    }
  };

  // Delete handlers
  const handleDeleteClick = (type: 'category' | 'subcategory', item: Category | Subcategory) => {
    setItemToDelete({ type, item });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === 'category') {
        await deleteCategory(itemToDelete.item.public_id);
        showToast('success', 'Categoria removida com sucesso!');
      } else {
        await deleteSubcategory(itemToDelete.item.public_id);
        showToast('success', 'Subcategoria removida com sucesso!');
      }
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      showToast('error', `Erro ao remover ${itemToDelete.type === 'category' ? 'categoria' : 'subcategoria'}`);
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
                placeholder="Buscar categorias ou subcategorias..."
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
                onClick={handleCreateCategory}
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nova Categoria</span>
              </button>
            </div>
          </div>
        </div>

        {/* Categories List */}
        <div>
          {isLoading ? (
            <div className="bg-white rounded-lg shadow-sm flex items-center justify-center h-64">
              <div className="text-gray-500">Carregando...</div>
            </div>
          ) : filteredCategories && filteredCategories.length > 0 ? (
            <>
              <div className="bg-white rounded-lg shadow-sm">
                <div className="divide-y divide-gray-200">
                  {filteredCategories.map((category) => {
                const isExpanded = expandedCategories.has(category.public_id);
                const hasSubcategories = category.subcategories && category.subcategories.length > 0;

                return (
                  <div key={category.public_id} className="hover:bg-gray-50 transition-colors">
                    {/* Category Header */}
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div 
                          className="flex items-center gap-3 flex-1 cursor-pointer"
                          onClick={() => toggleCategory(category.public_id)}
                        >
                          <div className="p-2 bg-teal-100 rounded-lg">
                            <FolderOpen className="w-5 h-5 text-teal-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">{category.name}</h3>
                              {hasSubcategories && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  {category.subcategories!.length} subcategoria{category.subcategories!.length !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{category.description}</p>
                          </div>
                          {hasSubcategories && (
                            <div className="ml-2">
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreateSubcategory(category);
                            }}
                            className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Adicionar Subcategoria"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCategory(category);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar Categoria"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick('category', category);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remover Categoria"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Subcategories List */}
                      {isExpanded && hasSubcategories && (
                        <div className="mt-4 ml-12 space-y-2">
                          {category.subcategories!.map((subcategory) => (
                            <div
                              key={subcategory.public_id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className="p-1.5 bg-teal-50 rounded">
                                  <Tag className="w-4 h-4 text-teal-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 text-sm">{subcategory.name}</h4>
                                  <p className="text-xs text-gray-500">{subcategory.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditSubcategory(category, subcategory);
                                  }}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Editar Subcategoria"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick('subcategory', subcategory);
                                  }}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Remover Subcategoria"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {isExpanded && !hasSubcategories && (
                        <div className="mt-4 ml-12 p-4 bg-gray-50 rounded-lg text-center">
                          <p className="text-sm text-gray-500">Nenhuma subcategoria cadastrada</p>
                          <button
                            onClick={() => handleCreateSubcategory(category)}
                            className="mt-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
                          >
                            Adicionar primeira subcategoria
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
            {!searchTerm && (
              <Pagination
                currentPage={currentPage}
                totalItems={data?.total || 0}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm text-center py-12 text-gray-500">
              <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>{searchTerm ? "Nenhuma categoria encontrada com esse termo" : "Nenhuma categoria encontrada"}</p>
            </div>
          )}
        </div>
      </div>

      {/* Category Modal */}
      <Modal 
        isOpen={isCategoryModalOpen} 
        onClose={() => setIsCategoryModalOpen(false)}
        title={modalMode === 'create' ? 'Nova Categoria' : 'Editar Categoria'}
      >
        <DynamicForm
          fields={categoryFormFields}
          onSubmit={handleCategorySubmit}
          onCancel={() => setIsCategoryModalOpen(false)}
          submitLabel={modalMode === 'create' ? 'Criar' : 'Salvar'}
          initialValues={selectedCategory as any || undefined}
        />
      </Modal>

      {/* Subcategory Modal */}
      <Modal 
        isOpen={isSubcategoryModalOpen} 
        onClose={() => setIsSubcategoryModalOpen(false)}
        title={modalMode === 'create' ? `Nova Subcategoria - ${selectedCategory?.name}` : 'Editar Subcategoria'}
      >
        <DynamicForm
          fields={subcategoryFormFieldsSimple}
          onSubmit={handleSubcategorySubmit}
          onCancel={() => setIsSubcategoryModalOpen(false)}
          submitLabel={modalMode === 'create' ? 'Criar' : 'Salvar'}
          initialValues={selectedSubcategory as any || undefined}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={`Remover ${itemToDelete?.type === 'category' ? 'Categoria' : 'Subcategoria'}`}
        message={`Tem certeza que deseja remover ${itemToDelete?.type === 'category' ? 'a categoria' : 'a subcategoria'} "${itemToDelete?.item.name}"?${
          itemToDelete?.type === 'category' ? ' Todas as subcategorias associadas também serão removidas.' : ''
        }`}
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        variant="danger"
      />
    </Layout>
  );
};

export default CategoriesWithSubcategories;
