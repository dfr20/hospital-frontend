import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../Components/Common/Layout/Layout";
import { Filter, Plus, ChevronDown, ChevronUp, Users, Building2 } from "lucide-react";
import Pagination from "../../Components/Common/Table/Pagination";
import Modal from "../../Components/Common/Modal/Modal";
import ConfirmationModal from "../../Components/Common/Modal/ConfirmationModal";
import type { Item, ItemPayload } from "../../Types/Item";
import type { Evaluation } from "../../Types/Evaluation";
import { useItems } from "../../Hooks/useItems";
import { useSubcategories } from "../../Hooks/useSubcategories";
import { useEvaluations } from "../../Hooks/useEvaluations";
import { useToast } from "../../Contexts/ToastContext";
import { getErrorMessage } from "../../Utils/errorHandler";
import ItemForm from "./ItemForm";

type ItemWithId = Item & { id: string };

const ItemsWithEvaluations: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemWithId | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ItemWithId | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const itemsPerPage = 10;

  const toast = useToast();
  const { fetchItems, createItem, updateItem, deleteItem } = useItems();
  const { fetchSubcategories } = useSubcategories();
  const { fetchEvaluationsByItem } = useEvaluations();

  const itemsQuery = fetchItems(currentPage, itemsPerPage);
  const { data: itemsData, isLoading, error } = itemsQuery;
  const { mutate: createItemMutation, isPending: isCreating } = createItem();
  const { mutate: updateItemMutation, isPending: isUpdating } = updateItem();

  const subcategoriesQuery = fetchSubcategories(1, 25);
  const { data: subcategoriesData, isLoading: isLoadingSubcategories } = subcategoriesQuery;

  const itemsWithId: ItemWithId[] = (itemsData?.items || []).map((item: Item) => ({
    ...item,
    id: item.public_id,
  }));

  const filteredItems = itemsWithId.filter((item) => {
    if (!searchTerm) return true;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(lowerSearchTerm) ||
      item.description.toLowerCase().includes(lowerSearchTerm) ||
      item.internal_code.toLowerCase().includes(lowerSearchTerm)
    );
  });

  const toggleItemExpand = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleEdit = (item: ItemWithId) => {
    setSelectedItem(item);
    setIsEditMode(true);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleView = (item: ItemWithId) => {
    setSelectedItem(item);
    setIsViewMode(true);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleDelete = (item: ItemWithId) => {
    setItemToDelete(item);
    setIsConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deleteItem(itemToDelete.public_id);
      toast.success('Item excluído', 'Item excluído com sucesso!');
      setIsConfirmationOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      toast.error('Erro ao excluir', getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmationOpen(false);
    setItemToDelete(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNewItem = () => {
    setSelectedItem(null);
    setIsViewMode(false);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setIsViewMode(false);
    setIsEditMode(false);
  };

  const handleSubmitItem = (data: ItemPayload) => {
    if (isEditMode && selectedItem) {
      updateItemMutation(
        { id: selectedItem.public_id, data },
        {
          onSuccess: () => {
            toast.success('Item atualizado', 'Item atualizado com sucesso!');
            setIsModalOpen(false);
            setSelectedItem(null);
            setIsEditMode(false);
          },
          onError: (error) => {
            console.error('Erro ao atualizar item:', error);
            toast.error('Erro ao atualizar', getErrorMessage(error));
          }
        }
      );
    } else {
      createItemMutation(data, {
        onSuccess: () => {
          toast.success('Item criado', 'Item criado com sucesso!');
          setIsModalOpen(false);
        },
        onError: (error) => {
          console.error('Erro ao criar item:', error);
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar itens</h3>
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
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar itens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filtrar</span>
              </button>
              <button
                onClick={handleNewItem}
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Novo Item</span>
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Itens */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Carregando...</div>
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="space-y-3">
                {filteredItems.map((item) => {
                  const isExpanded = expandedItems.has(item.public_id);
                  return (
                    <ItemCard
                      key={item.public_id}
                      item={item}
                      isExpanded={isExpanded}
                      onToggle={() => toggleItemExpand(item.public_id)}
                      onEdit={() => handleEdit(item)}
                      onView={() => handleView(item)}
                      onDelete={() => handleDelete(item)}
                      fetchEvaluationsByItem={fetchEvaluationsByItem}
                      navigate={navigate}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                {searchTerm ? "Nenhum item encontrado com esse termo" : "Nenhum item encontrado"}
              </div>
            )}

            {!searchTerm && itemsData && itemsData.total > itemsPerPage && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalItems={itemsData.total}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>

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
        {isLoadingSubcategories ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Carregando subcategorias...</div>
          </div>
        ) : (
          <ItemForm
            onSubmit={handleSubmitItem}
            onCancel={handleCloseModal}
            isLoading={isCreating || isUpdating}
            initialValues={selectedItem ? {
              name: selectedItem.name,
              description: selectedItem.description,
              internal_code: selectedItem.internal_code,
              presentation: selectedItem.presentation,
              similar_names: selectedItem.similar_names || [],
              requires_sample: selectedItem.requires_sample,
              subcategory_id: selectedItem.subcategory?.public_id || ''
            } : undefined}
            subcategories={subcategoriesData?.items || []}
            readOnly={isViewMode}
          />
        )}
      </Modal>

      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir Item"
        message={`Tem certeza que deseja excluir o item "${itemToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        isLoading={isDeleting}
        variant="danger"
      />
    </Layout>
  );
};

interface ItemCardProps {
  item: ItemWithId;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  fetchEvaluationsByItem: (itemId: string, page?: number, size?: number) => any;
  navigate: (path: string) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({
  item,
  isExpanded,
  onToggle,
  onEdit,
  onView,
  onDelete,
  fetchEvaluationsByItem,
  navigate
}) => {
  const { data: evaluationsData, isLoading: isLoadingEvaluations } = fetchEvaluationsByItem(
    isExpanded ? item.public_id : '',
    1,
    25
  );

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:border-teal-300 transition-colors">
      {/* Header do Item */}
      <div
        className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div>
                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                <div className="text-xs text-gray-500">Código: {item.internal_code}</div>
              </div>
              {item.requires_sample && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Amostra
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
            >
              Ver
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="px-3 py-1 text-sm text-teal-600 hover:text-teal-800"
            >
              Editar
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
            >
              Excluir
            </button>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500 ml-2" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500 ml-2" />
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo Expandido - Avaliações */}
      {isExpanded && (
        <div className="p-4 bg-white border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Avaliações deste Item
          </h4>
          {isLoadingEvaluations ? (
            <div className="text-center py-8">
              <div className="text-sm text-gray-500">Carregando avaliações...</div>
            </div>
          ) : evaluationsData?.items && evaluationsData.items.length > 0 ? (
            <div className="space-y-3">
              {evaluationsData.items.map((evaluation: Evaluation) => (
                <div
                  key={evaluation.public_id}
                  onClick={() => navigate(`/public-acquisitions/${evaluation.public_acquisition.public_id}`)}
                  className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors hover:border-teal-300"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        <span className="text-xs text-gray-500">Licitação:</span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {evaluation.public_acquisition.code}
                      </div>
                      <div className="text-xs text-gray-600">
                        {evaluation.public_acquisition.title}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Fornecedor:</div>
                      <div className="text-sm font-medium text-gray-900">
                        {evaluation.supplier.name}
                      </div>
                      {evaluation.is_holder && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                          Detentor
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-xs text-gray-500">Avaliadores:</span>
                      </div>
                      <div className="text-sm text-gray-900">
                        {evaluation.users.length} {evaluation.users.length === 1 ? 'usuário' : 'usuários'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">Nenhuma avaliação encontrada para este item</p>
            </div>
          )}
          {evaluationsData && evaluationsData.total > 0 && (
            <div className="mt-3 text-xs text-gray-600 text-right">
              Total: {evaluationsData.total} {evaluationsData.total === 1 ? 'avaliação' : 'avaliações'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ItemsWithEvaluations;
