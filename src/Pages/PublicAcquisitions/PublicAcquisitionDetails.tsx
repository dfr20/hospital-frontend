import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../Components/Common/Layout/Layout";
import { ArrowLeft, Package, ChevronDown, ChevronUp, Plus, Edit, Trash2 } from "lucide-react";
import Pagination from "../../Components/Common/Table/Pagination";
import ItemPublicAcquisitionModal from "../../Components/Common/Modal/ItemPublicAcquisitionModal";
import ConfirmationModal from "../../Components/Common/Modal/ConfirmationModal";
import { useItemPublicAcquisitions } from "../../Hooks/useItemPublicAcquisitions";
import { useToast } from "../../Contexts/ToastContext";
import type { ItemPublicAcquisition } from "../../Types/ItemPublicAcquisition";

const PublicAcquisitionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<ItemPublicAcquisition | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ItemPublicAcquisition | null>(null);
  const itemsPerPage = 10;

  const { fetchItemsByPublicAcquisition, createItemPublicAcquisition, updateItemPublicAcquisition, deleteItemPublicAcquisition } = useItemPublicAcquisitions();
  const { data, isLoading, error } = fetchItemsByPublicAcquisition(id || '', currentPage, itemsPerPage);
  const createMutation = createItemPublicAcquisition();
  const updateMutation = updateItemPublicAcquisition();
  const deleteMutation = deleteItemPublicAcquisition();

  const toggleItem = (itemId: string) => {
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAssociateItem = () => {
    setModalMode('create');
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item: ItemPublicAcquisition) => {
    setModalMode('edit');
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (item: ItemPublicAcquisition) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteMutation.mutateAsync(itemToDelete.public_id);
      showToast('success', 'Associação removida com sucesso!');
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      showToast('error', 'Erro ao remover associação');
    }
  };

  const handleModalSubmit = async (formData: {
    item_id?: string;
    supplier_id: string;
    is_holder: boolean;
  }) => {
    try {
      if (modalMode === 'create') {
        await createMutation.mutateAsync({
          item_id: formData.item_id!,
          public_acquisition_id: id!,
          supplier_id: formData.supplier_id,
          is_holder: formData.is_holder,
        });
        showToast('success', 'Item associado com sucesso!');
      } else if (modalMode === 'edit' && selectedItem) {
        await updateMutation.mutateAsync({
          id: selectedItem.public_id,
          data: {
            supplier_id: formData.supplier_id,
            is_holder: formData.is_holder,
          },
        });
        showToast('success', 'Associação atualizada com sucesso!');
      }
      setIsModalOpen(false);
    } catch (error) {
      showToast(
        'error',
        modalMode === 'create' ? 'Erro ao associar item' : 'Erro ao atualizar associação'
      );
    }
  };

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar itens</h3>
            <p className="text-gray-500">Tente novamente mais tarde</p>
            <button
              onClick={() => navigate('/public-acquisitions')}
              className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              Voltar para Licitações
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const firstItem = data?.items?.[0];
  const publicAcquisition = firstItem?.public_acquisition;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header com informações da licitação */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <button
            onClick={() => navigate('/public-acquisitions')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Licitações</span>
          </button>

          {publicAcquisition && (
            <div className="border-t pt-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-teal-100 rounded-lg">
                  <Package className="w-6 h-6 text-teal-600" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {publicAcquisition.title}
                  </h1>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Código:</span>
                      <p className="font-medium text-gray-900">{publicAcquisition.code}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Ano:</span>
                      <p className="font-medium text-gray-900">{publicAcquisition.year}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Total de Itens:</span>
                      <p className="font-medium text-gray-900">{data?.total || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lista de Itens */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Itens da Licitação</h2>
            <button
              onClick={handleAssociateItem}
              className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Associar Item</span>
            </button>
          </div>

          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Carregando...</div>
              </div>
            ) : data?.items && data.items.length > 0 ? (
              <div className="space-y-3">
                {data.items.map((item: ItemPublicAcquisition) => {
                  const isExpanded = expandedItems.has(item.public_id);
                  
                  return (
                    <div
                      key={item.public_id}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:border-teal-300 transition-colors"
                    >
                      {/* Header do Item - Sempre visível */}
                      <div
                        className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => toggleItem(item.public_id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.item.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                Código: {item.item.internal_code}
                              </div>
                            </div>
                            <div className="hidden md:block">
                              <div className="text-sm text-gray-700">
                                {item.supplier.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.supplier.document}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.is_holder ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Detentor
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Não Detentor
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Conteúdo Expandido */}
                      {isExpanded && (
                        <div className="p-4 bg-white border-t border-gray-200">
                          <div className="flex justify-end gap-2 mb-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditItem(item);
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                              <span>Editar</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(item);
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Remover</span>
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                Informações do Item
                              </h4>
                              <dl className="space-y-2">
                                <div>
                                  <dt className="text-xs text-gray-500">Descrição:</dt>
                                  <dd className="text-sm text-gray-900">{item.item.description}</dd>
                                </div>
                                <div>
                                  <dt className="text-xs text-gray-500">Apresentação:</dt>
                                  <dd className="text-sm text-gray-900">{item.item.presentation}</dd>
                                </div>
                                {item.item.similar_names && item.item.similar_names.length > 0 && (
                                  <div>
                                    <dt className="text-xs text-gray-500">Nomes Similares:</dt>
                                    <dd className="text-sm text-gray-900">
                                      {item.item.similar_names.join(', ')}
                                    </dd>
                                  </div>
                                )}
                              </dl>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                Informações do Fornecedor
                              </h4>
                              <dl className="space-y-2">
                                <div>
                                  <dt className="text-xs text-gray-500">Nome:</dt>
                                  <dd className="text-sm text-gray-900">{item.supplier.name}</dd>
                                </div>
                                <div>
                                  <dt className="text-xs text-gray-500">{item.supplier.document_type}:</dt>
                                  <dd className="text-sm text-gray-900">{item.supplier.document}</dd>
                                </div>
                                <div>
                                  <dt className="text-xs text-gray-500">Email:</dt>
                                  <dd className="text-sm text-gray-900">{item.supplier.email}</dd>
                                </div>
                                <div>
                                  <dt className="text-xs text-gray-500">Telefone:</dt>
                                  <dd className="text-sm text-gray-900">{item.supplier.phone}</dd>
                                </div>
                              </dl>
                            </div>
                          </div>

                          {/* Área para futuras avaliações */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">
                              Avaliações
                            </h4>
                            <p className="text-sm text-gray-500 italic">
                              Nenhuma avaliação registrada ainda.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Nenhum item encontrado nesta licitação
              </div>
            )}

            {data && data.total > itemsPerPage && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalItems={data.total}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para Associar/Editar Item */}
      <ItemPublicAcquisitionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        mode={modalMode}
        initialData={selectedItem ? {
          item_id: selectedItem.item.public_id,
          item_name: selectedItem.item.name,
          supplier_id: selectedItem.supplier.public_id,
          supplier_name: selectedItem.supplier.name,
          is_holder: selectedItem.is_holder,
        } : undefined}
      />

      {/* Modal de Confirmação para Deletar */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Remover Associação"
        message={`Tem certeza que deseja remover a associação do item "${itemToDelete?.item.name}" com o fornecedor "${itemToDelete?.supplier.name}"?`}
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        variant="danger"
      />
    </Layout>
  );
};

export default PublicAcquisitionDetails;
