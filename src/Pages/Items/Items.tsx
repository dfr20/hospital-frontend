import React, { useState } from "react";
import { Layout } from "../../Components/Common/Layout/Layout";
import { Filter, Plus } from "lucide-react";
import Table from "../../Components/Common/Table/Table";
import type { Column } from "../../Components/Common/Table/Table";
import Pagination from "../../Components/Common/Table/Pagination";
import Modal from "../../Components/Common/Modal/Modal";
import ConfirmationModal from "../../Components/Common/Modal/ConfirmationModal";
import type { Item, ItemPayload } from "../../Types/Item";
import { useItems } from "../../Hooks/useItems";
import { useSubcategories } from "../../Hooks/useSubcategories";
import { useToast } from "../../Contexts/ToastContext";
import { getErrorMessage } from "../../Utils/errorHandler";
import ItemForm from "./ItemForm";

// Tipo estendido para incluir 'id' necessário para o componente Table
type ItemWithId = Item & { id: string };

const Items: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemWithId | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ItemWithId | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchingSimilar, setIsSearchingSimilar] = useState(false);
  const itemsPerPage = 10;

  const toast = useToast();
  const { fetchItems, createItem, updateItem, deleteItem, searchItemsBySimilarName } = useItems();
  const { fetchSubcategories } = useSubcategories();

  const itemsQuery = fetchItems(currentPage, itemsPerPage);
  const { data: itemsData, isLoading, error } = itemsQuery;
  const { mutate: createItemMutation, isPending: isCreating } = createItem();
  const { mutate: updateItemMutation, isPending: isUpdating } = updateItem();

  // Buscar subcategorias para popular o select
  const subcategoriesQuery = fetchSubcategories(1, 25);
  const { data: subcategoriesData, isLoading: isLoadingSubcategories } = subcategoriesQuery;

  // Adaptar dados para incluir 'id' (subcategory já vem do backend)
  const itemsWithId: ItemWithId[] = (itemsData?.items || []).map((item: Item) => ({
    ...item,
    id: item.public_id,
  }));

  // Filtrar items baseado no termo de busca (busca local)
  const filteredItems = itemsWithId.filter((item) => {
    if (!searchTerm) return true;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(lowerSearchTerm) ||
      item.description.toLowerCase().includes(lowerSearchTerm) ||
      item.internal_code.toLowerCase().includes(lowerSearchTerm) ||
      item.similar_names.some(name => name.toLowerCase().includes(lowerSearchTerm)) ||
      (item.subcategory?.name && item.subcategory.name.toLowerCase().includes(lowerSearchTerm))
    );
  });

  // Definição das colunas da tabela
  const columns: Column<ItemWithId>[] = [
    {
      key: 'name',
      header: 'Nome',
      render: (item) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{item.name}</div>
          <div className="text-xs text-gray-500">{item.internal_code}</div>
        </div>
      )
    },
    {
      key: 'description',
      header: 'Descrição',
      hideOnMobile: true,
      render: (item) => (
        <div className="text-sm text-gray-600 max-w-md truncate">
          {item.description}
        </div>
      )
    },
    {
      key: 'subcategory',
      header: 'Subcategoria',
      hideOnMobile: true,
      render: (item) => (
        <div className="text-sm text-gray-700">
          {item.subcategory?.name || 'N/A'}
        </div>
      )
    },
    {
      key: 'sample',
      header: 'Amostra',
      hideOnMobile: true,
      render: (item) => (
        <div className="text-sm text-gray-600">
          {item.sample}
        </div>
      )
    },
    {
      key: 'has_catalog',
      header: 'Catálogo',
      hideOnTablet: true,
      render: (item) => (
        <div className="text-sm">
          {item.has_catalog ? (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Sim</span>
          ) : (
            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Não</span>
          )}
        </div>
      )
    }
  ];

  const handleView = (item: ItemWithId) => {
    setSelectedItem(item);
    setIsViewMode(true);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (item: ItemWithId) => {
    setSelectedItem(item);
    setIsEditMode(true);
    setIsViewMode(false);
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
    // Verificar se existem subcategorias cadastradas
    console.log('Subcategories data:', subcategoriesData);
    console.log('Is loading:', isLoadingSubcategories);

    if (isLoadingSubcategories) {
      toast.info('Aguarde', 'Carregando subcategorias...');
      return;
    }

    if (!subcategoriesData?.items || subcategoriesData.items.length === 0) {
      toast.warning(
        'Nenhuma subcategoria cadastrada',
        'É necessário cadastrar ao menos uma subcategoria antes de criar items.'
      );
      return;
    }

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
      // Modo de edição
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
            console.error('Erro ao editar item:', error);
            toast.error('Erro ao atualizar', getErrorMessage(error));
          }
        }
      );
    } else {
      // Modo de criação
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

  // Busca por nome similar via API
  const handleSearchSimilar = async () => {
    if (!searchTerm.trim()) {
      toast.info('Digite um termo', 'Digite um nome para buscar itens similares.');
      return;
    }

    setIsSearchingSimilar(true);
    try {
      const results = await searchItemsBySimilarName(searchTerm);
      toast.success('Busca concluída', `Encontrados ${results.length} item(ns) similar(es).`);
      // Aqui você poderia atualizar o estado para mostrar apenas os resultados
    } catch (error) {
      console.error('Erro ao buscar itens similares:', error);
      toast.error('Erro na busca', getErrorMessage(error));
    } finally {
      setIsSearchingSimilar(false);
    }
  };

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar items</h3>
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
                placeholder="Buscar por nome, código, subcategoria ou nomes similares..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-2">
              <button
                onClick={handleSearchSimilar}
                disabled={isSearchingSimilar}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {isSearchingSimilar ? 'Buscando...' : 'Buscar Similar'}
                </span>
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

        {/* Tabela de Items */}
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Carregando...</div>
            </div>
          ) : (
            <>
              <Table<ItemWithId>
                data={filteredItems}
                columns={columns}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                emptyMessage={searchTerm ? "Nenhum item encontrado com esse termo" : "Nenhum item encontrado"}
              />
              {!searchTerm && (
                <Pagination
                  currentPage={currentPage}
                  totalItems={itemsData?.total || 0}
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
            ? "Detalhes do Item"
            : isEditMode
            ? "Editar Item"
            : "Criar Novo Item"
        }
      >
        <ItemForm
          onSubmit={handleSubmitItem}
          onCancel={handleCloseModal}
          isLoading={isCreating || isUpdating}
          initialValues={selectedItem || undefined}
          readOnly={isViewMode}
          subcategories={subcategoriesData?.items || []}
          isLoadingSubcategories={isLoadingSubcategories}
        />
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
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

export default Items;
