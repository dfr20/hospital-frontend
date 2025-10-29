import React, { useState } from "react";
import { Layout } from "../../Components/Common/Layout/Layout";
import { Filter, Plus } from "lucide-react";
import Table from "../../Components/Common/Table/Table";
import type { Column } from "../../Components/Common/Table/Table";
import Pagination from "../../Components/Common/Table/Pagination";
import Modal from "../../Components/Common/Modal/Modal";
import DynamicForm from "../../Components/Common/Modal/DynamicForm";
import ConfirmationModal from "../../Components/Common/Modal/ConfirmationModal";
import type { Supplier, SupplierPayload } from "../../Types/Supplier";
import { useSuppliers } from "../../Hooks/useSuppliers";
import { supplierFormFields } from "./SupplierFormConfigs";
import { useToast } from "../../Contexts/ToastContext";
import { getErrorMessage } from "../../Utils/errorHandler";

// Tipo estendido para incluir 'id' necessário para o componente Table
type SupplierWithId = Supplier & { id: string };

const Suppliers: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierWithId | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<SupplierWithId | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  const toast = useToast();
  const { fetchSuppliers, createSupplier, updateSupplier, deleteSupplier } = useSuppliers();

  const { data: suppliersData, isLoading, error } = fetchSuppliers(currentPage, itemsPerPage);
  const { mutate: createSupplierMutation, isPending: isCreating } = createSupplier();
  const { mutate: updateSupplierMutation, isPending: isUpdating } = updateSupplier();

  // Adaptar dados para incluir 'id' baseado em 'public_id'
  const suppliersWithId: SupplierWithId[] = (suppliersData?.items || []).map((supplier: Supplier) => ({
    ...supplier,
    id: supplier.public_id
  }));

  // Filtrar fornecedores baseado no termo de busca
  const filteredSuppliers = suppliersWithId.filter((supplier) => {
    if (!searchTerm) return true;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return (
      supplier.name.toLowerCase().includes(lowerSearchTerm) ||
      supplier.document.toLowerCase().includes(lowerSearchTerm) ||
      supplier.email.toLowerCase().includes(lowerSearchTerm) ||
      supplier.phone.toLowerCase().includes(lowerSearchTerm)
    );
  });

  // Definição das colunas da tabela
  const columns: Column<SupplierWithId>[] = [
    {
      key: 'name',
      header: 'Nome',
      render: (supplier) => (
        <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
      )
    },
    {
      key: 'document',
      header: 'Documento',
      hideOnMobile: true,
      render: (supplier) => (
        <div className="text-sm text-gray-500">
          <div className="font-medium">{supplier.document_type}</div>
          <div>{supplier.document}</div>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      hideOnTablet: true,
      render: (supplier) => (
        <div className="text-sm text-gray-500">{supplier.email}</div>
      )
    },
    {
      key: 'phone',
      header: 'Telefone',
      hideOnMobile: true,
      render: (supplier) => (
        <div className="text-sm text-gray-500">{supplier.phone}</div>
      )
    }
  ];

  const handleView = (supplier: SupplierWithId) => {
    setSelectedSupplier(supplier);
    setIsViewMode(true);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (supplier: SupplierWithId) => {
    setSelectedSupplier(supplier);
    setIsEditMode(true);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleDelete = (supplier: SupplierWithId) => {
    setSupplierToDelete(supplier);
    setIsConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!supplierToDelete) return;

    setIsDeleting(true);
    try {
      await deleteSupplier(supplierToDelete.public_id);
      toast.success('Fornecedor excluído', 'Fornecedor excluído com sucesso!');
      setIsConfirmationOpen(false);
      setSupplierToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir fornecedor:', error);
      toast.error('Erro ao excluir', getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmationOpen(false);
    setSupplierToDelete(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNewSupplier = () => {
    setSelectedSupplier(null);
    setIsViewMode(false);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSupplier(null);
    setIsViewMode(false);
    setIsEditMode(false);
  };

  const handleSubmitSupplier = (data: SupplierPayload) => {
    if (isEditMode && selectedSupplier) {
      // Modo de edição
      updateSupplierMutation(
        { id: selectedSupplier.public_id, data },
        {
          onSuccess: () => {
            toast.success('Fornecedor atualizado', 'Fornecedor atualizado com sucesso!');
            setIsModalOpen(false);
            setSelectedSupplier(null);
            setIsEditMode(false);
          },
          onError: (error) => {
            console.error('Erro ao editar fornecedor:', error);
            toast.error('Erro ao atualizar', getErrorMessage(error));
          }
        }
      );
    } else {
      // Modo de criação
      createSupplierMutation(data, {
        onSuccess: () => {
          toast.success('Fornecedor criado', 'Fornecedor criado com sucesso!');
          setIsModalOpen(false);
        },
        onError: (error) => {
          console.error('Erro ao criar fornecedor:', error);
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar fornecedores</h3>
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
                placeholder="Buscar fornecedores..."
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
                onClick={handleNewSupplier}
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Novo Fornecedor</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de Fornecedores */}
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Carregando...</div>
            </div>
          ) : (
            <>
              <Table<SupplierWithId>
                data={filteredSuppliers}
                columns={columns}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                emptyMessage={searchTerm ? "Nenhum fornecedor encontrado com esse termo" : "Nenhum fornecedor encontrado"}
              />
              {!searchTerm && (
                <Pagination
                  currentPage={currentPage}
                  totalItems={suppliersData?.total || 0}
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
            ? "Detalhes do Fornecedor"
            : isEditMode
            ? "Editar Fornecedor"
            : "Criar Novo Fornecedor"
        }
      >
        <DynamicForm<SupplierPayload>
          fields={supplierFormFields}
          onSubmit={handleSubmitSupplier}
          onCancel={handleCloseModal}
          isLoading={isCreating || isUpdating}
          submitLabel={isEditMode ? "Salvar Alterações" : "Criar Fornecedor"}
          cancelLabel="Cancelar"
          initialValues={selectedSupplier ? {
            name: selectedSupplier.name,
            document_type: selectedSupplier.document_type,
            document: selectedSupplier.document,
            email: selectedSupplier.email,
            phone: selectedSupplier.phone
          } : undefined}
          readOnly={isViewMode}
        />
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir Fornecedor"
        message={`Tem certeza que deseja excluir o fornecedor "${supplierToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        isLoading={isDeleting}
        variant="danger"
      />
    </Layout>
  );
};

export default Suppliers;
