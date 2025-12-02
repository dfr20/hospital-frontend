import React, { useState } from 'react';
import Modal from './Modal';
import { useUsers } from '../../../Hooks/useUsers';
import type { User } from '../../../Types/User';

interface AssociateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (userId: string) => void;
    pregoeiroId?: string; // ID do Pregoeiro da licitação para filtrar
    isLoading?: boolean;
}

const AssociateUserModal: React.FC<AssociateUserModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    pregoeiroId,
    isLoading = false
}) => {
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    const { searchUsers } = useUsers();
    const { data: usersData } = searchUsers(userSearchTerm);

    const handleUserSelect = (user: User) => {
        setSelectedUser(user);
        setUserSearchTerm(user.name);
        setShowUserDropdown(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedUser) {
            alert('Por favor, selecione um usuário');
            return;
        }

        onSubmit(selectedUser.public_id);
        handleClose();
    };

    const handleClose = () => {
        setUserSearchTerm('');
        setSelectedUser(null);
        setShowUserDropdown(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Associar Usuário à Avaliação">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                    <p className="mb-2">Regras de associação:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                        <li><strong>Gerente/Administrador/Desenvolvedor</strong> podem associar qualquer usuário (incluindo <strong>Pregoeiro</strong>)</li>
                        <li><strong>Pregoeiro</strong> pode associar <strong>Avaliador Técnico</strong></li>
                        <li><strong>Avaliador Técnico</strong> pode associar <strong>Avaliador Funcional</strong></li>
                    </ul>
                </div>

                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Selecione o Usuário *
                    </label>
                    <input
                        type="text"
                        value={userSearchTerm}
                        onChange={(e) => {
                            setUserSearchTerm(e.target.value);
                            setShowUserDropdown(true);
                            if (!e.target.value) {
                                setSelectedUser(null);
                            }
                        }}
                        onFocus={() => setShowUserDropdown(true)}
                        placeholder="Digite para buscar usuário..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    {showUserDropdown && usersData && usersData.items.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                            {usersData.items
                                .filter((user: User) => user.public_id !== pregoeiroId)
                                .map((user: User) => (
                                    <div
                                        key={user.public_id}
                                        onClick={() => handleUserSelect(user)}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    >
                                        <div className="font-medium">{user.name}</div>
                                        <div className="text-sm text-gray-600">{user.email}</div>
                                        {user.role && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                {user.role.name}
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                {selectedUser && (
                    <div className="bg-teal-50 p-3 rounded-lg border border-teal-200">
                        <div className="text-sm font-medium text-gray-700 mb-1">Usuário selecionado:</div>
                        <div className="text-sm font-medium text-gray-900">{selectedUser.name}</div>
                        <div className="text-xs text-gray-600">{selectedUser.email}</div>
                        {selectedUser.role && (
                            <div className="text-xs text-gray-500 mt-1">
                                Função: {selectedUser.role.name}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading || !selectedUser}
                        className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                    >
                        {isLoading ? 'Associando...' : 'Associar Usuário'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AssociateUserModal;
