import React, { useState } from "react";
import { Layout } from "../../Components/Common/Layout/Layout";
import { Filter, Plus } from "lucide-react";
import Table from "../../Components/Common/Table/Table";
import type { Column } from "../../Components/Common/Table/Table";
import Pagination from "../../Components/Common/Table/Pagination";
import Modal from "../../Components/Common/Modal/Modal";
import DynamicForm from "../../Components/Common/Modal/DynamicForm";
import ConfirmationModal from "../../Components/Common/Modal/ConfirmationModal";
import type { User, UserPayload } from "../../Types/User";
import { useUsers } from "../../Hooks/useUsers";
import { userFormFields } from "./UserFormConfigs";
import { useToast } from "../../Contexts/ToastContext";
import { getErrorMessage } from "../../Utils/errorHandler";

// Tipo estendido para incluir 'id' necessário para o componente Table
type UserWithId = User & { id: string };

const Users: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithId | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithId | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  const {
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    fetchRoles,
    fetchJobTitles,
    fetchHospitals
  } = useUsers();

  const toast = useToast();

  const { data: usersData, isLoading, error } = fetchUsers(currentPage, itemsPerPage);
  const { mutate: createUserMutation, isPending: isCreating } = createUser();
  const { mutate: updateUserMutation, isPending: isUpdating } = updateUser();

  // Buscar dados para os selects
  const { data: roles } = fetchRoles();
  const { data: jobTitles } = fetchJobTitles();
  const { data: hospitals } = fetchHospitals();

  // Adaptar dados para incluir 'id' baseado em 'public_id'
  const usersWithId: UserWithId[] = (usersData?.items || []).map((user: User) => ({
    ...user,
    id: user.public_id
  }));

  // Filtrar usuários baseado no termo de busca
  const filteredUsers = usersWithId.filter((user) => {
    if (!searchTerm) return true;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(lowerSearchTerm) ||
      user.email.toLowerCase().includes(lowerSearchTerm) ||
      user.phone.toLowerCase().includes(lowerSearchTerm) ||
      user.role.name.toLowerCase().includes(lowerSearchTerm) ||
      user.job_title.title.toLowerCase().includes(lowerSearchTerm) ||
      user.hospital.name.toLowerCase().includes(lowerSearchTerm)
    );
  });

  // Atualizar campos do formulário com as opções dinâmicas
  const formFieldsWithOptions = userFormFields.map(field => {
    if (field.name === 'role_id') {
      return {
        ...field,
        options: Array.isArray(roles) ? roles.map(role => ({ value: role.public_id, label: role.name })) : []
      };
    }
    if (field.name === 'job_title_id') {
      return {
        ...field,
        options: Array.isArray(jobTitles) ? jobTitles.map(jobTitle => ({ value: jobTitle.public_id, label: jobTitle.title })) : []
      };
    }
    if (field.name === 'hospital_id') {
      return {
        ...field,
        options: Array.isArray(hospitals) ? hospitals.map(hospital => ({ value: hospital.public_id, label: hospital.name })) : []
      };
    }
    return field;
  });

  // Definição das colunas da tabela
  const columns: Column<UserWithId>[] = [
    {
      key: 'name',
      header: 'Nome',
      render: (user) => (
        <div className="text-sm font-medium text-gray-900">{user.name}</div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      hideOnMobile: true,
      render: (user) => (
        <div className="text-sm text-gray-500">{user.email}</div>
      )
    },
    {
      key: 'phone',
      header: 'Telefone',
      hideOnTablet: true,
      render: (user) => (
        <div className="text-sm text-gray-500">{user.phone}</div>
      )
    },
    {
      key: 'role',
      header: 'Função',
      hideOnMobile: true,
      render: (user) => (
        <div className="text-sm text-gray-500">{user.role.name}</div>
      )
    },
    {
      key: 'job_title',
      header: 'Cargo',
      hideOnTablet: true,
      render: (user) => (
        <div className="text-sm text-gray-500">{user.job_title.title}</div>
      )
    },
    {
      key: 'hospital',
      header: 'Hospital',
      hideOnTablet: true,
      render: (user) => (
        <div className="text-sm text-gray-500">{user.hospital.name}</div>
      )
    }
  ];

  const handleView = (user: UserWithId) => {
    setSelectedUser(user);
    setIsViewMode(true);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (user: UserWithId) => {
    setSelectedUser(user);
    setIsEditMode(true);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleDelete = (user: UserWithId) => {
    setUserToDelete(user);
    setIsConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      await deleteUser(userToDelete.public_id);
      toast.success('Usuário excluído', `O usuário "${userToDelete.name}" foi excluído com sucesso.`);
      setIsConfirmationOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast.error('Erro ao excluir', getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmationOpen(false);
    setUserToDelete(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNewUser = () => {
    setSelectedUser(null);
    setIsViewMode(false);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setIsViewMode(false);
    setIsEditMode(false);
  };

  const handleSubmitUser = (data: UserPayload) => {
    if (isEditMode && selectedUser) {
      // Modo de edição
      updateUserMutation(
        { id: selectedUser.public_id, data },
        {
          onSuccess: () => {
            toast.success('Usuário atualizado', `O usuário "${data.name}" foi atualizado com sucesso.`);
            setIsModalOpen(false);
            setSelectedUser(null);
            setIsEditMode(false);
          },
          onError: (error) => {
            console.error('Erro ao editar usuário:', error);
            toast.error('Erro ao editar', getErrorMessage(error));
          }
        }
      );
    } else {
      // Modo de criação
      createUserMutation(data, {
        onSuccess: () => {
          toast.success('Usuário cadastrado', `O usuário "${data.name}" foi cadastrado com sucesso.`);
          setIsModalOpen(false);
        },
        onError: (error) => {
          console.error('Erro ao criar usuário:', error);
          toast.error('Erro ao cadastrar', getErrorMessage(error));
        }
      });
    }
  };

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar usuários</h3>
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
                placeholder="Buscar usuários..."
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
                onClick={handleNewUser}
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Novo Usuário</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de Usuários */}
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Carregando...</div>
            </div>
          ) : (
            <>
              <Table<UserWithId>
                data={filteredUsers}
                columns={columns}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                emptyMessage={searchTerm ? "Nenhum usuário encontrado com esse termo" : "Nenhum usuário encontrado"}
              />
              {!searchTerm && (
                <Pagination
                  currentPage={currentPage}
                  totalItems={usersData?.total || 0}
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
            ? "Detalhes do Usuário"
            : isEditMode
            ? "Editar Usuário"
            : "Criar Novo Usuário"
        }
      >
        <DynamicForm<UserPayload>
          fields={formFieldsWithOptions}
          onSubmit={handleSubmitUser}
          onCancel={handleCloseModal}
          isLoading={isCreating || isUpdating}
          submitLabel={isEditMode ? "Salvar Alterações" : "Criar Usuário"}
          cancelLabel="Cancelar"
          initialValues={selectedUser ? {
            name: selectedUser.name,
            email: selectedUser.email,
            phone: selectedUser.phone,
            password: '',
            role_id: selectedUser.role.public_id,
            job_title_id: selectedUser.job_title.public_id,
            hospital_id: selectedUser.hospital.public_id
          } : undefined}
          readOnly={isViewMode}
        />
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir Usuário"
        message={`Tem certeza que deseja excluir o usuário "${userToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        isLoading={isDeleting}
        variant="danger"
      />
    </Layout>
  );
};

export default Users;
