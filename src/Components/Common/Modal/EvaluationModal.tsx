import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useSuppliers } from '../../../Hooks/useSuppliers';
import { useUsers } from '../../../Hooks/useUsers';
import type { Item } from '../../../Types/Item';
import type { Supplier } from '../../../Types/Supplier';
import type { User } from '../../../Types/User';

interface EvaluationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        item_ids?: string[];
        supplier_id?: string;
        is_holder: boolean;
        user_ids: string[];
    }) => void;
    mode: 'create' | 'edit';
    publicAcquisitionItems?: Item[]; // Items from the PublicAcquisition
    pregoeiroId?: string; // ID do Pregoeiro da licitação para filtrar
    initialData?: {
        item_id?: string;
        item_name?: string;
        supplier_id?: string;
        supplier_name?: string;
        is_holder?: boolean;
        users?: User[];
        items?: Item[];
    };
}

const EvaluationModal: React.FC<EvaluationModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    mode,
    publicAcquisitionItems = [],
    pregoeiroId,
    initialData
}) => {
    const [selectedItems, setSelectedItems] = useState<Item[]>(initialData?.items || []);
    const [supplierSearchTerm, setSupplierSearchTerm] = useState(initialData?.supplier_name || '');
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [selectedUsers, setSelectedUsers] = useState<User[]>(initialData?.users || []);
    const [isHolder, setIsHolder] = useState(initialData?.is_holder || false);
    const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    const { searchSuppliers } = useSuppliers();
    const { searchUsers } = useUsers();

    const { data: suppliersData } = searchSuppliers(supplierSearchTerm);
    const { data: usersData } = searchUsers(userSearchTerm);

    useEffect(() => {
        if (initialData?.items) {
            setSelectedItems(initialData.items);
        }
        if (initialData?.supplier_id && initialData?.supplier_name) {
            setSelectedSupplier({
                public_id: initialData.supplier_id,
                name: initialData.supplier_name,
            } as Supplier);
        }
        if (initialData?.users) {
            setSelectedUsers(initialData.users);
        }
        if (initialData?.is_holder !== undefined) {
            setIsHolder(initialData.is_holder);
        }
    }, [initialData]);

    const handleItemSelect = (item: Item) => {
        if (!selectedItems.find(i => i.public_id === item.public_id)) {
            setSelectedItems([...selectedItems, item]);
        }
    };

    const handleRemoveItem = (itemId: string) => {
        setSelectedItems(selectedItems.filter(i => i.public_id !== itemId));
    };

    const handleSupplierSelect = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setSupplierSearchTerm(supplier.name);
        setShowSupplierDropdown(false);
    };

    const handleUserSelect = (user: User) => {
        if (!selectedUsers.find(u => u.public_id === user.public_id)) {
            setSelectedUsers([...selectedUsers, user]);
        }
        setUserSearchTerm('');
        setShowUserDropdown(false);
    };

    const handleRemoveUser = (userId: string) => {
        setSelectedUsers(selectedUsers.filter(u => u.public_id !== userId));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === 'create' && selectedItems.length === 0) {
            alert('Por favor, selecione pelo menos um item');
            return;
        }

        if (mode === 'create' && !selectedSupplier) {
            alert('Por favor, selecione um fornecedor');
            return;
        }

        if (selectedUsers.length === 0) {
            alert('Por favor, selecione pelo menos um usuário avaliador');
            return;
        }

        onSubmit({
            ...(mode === 'create' && selectedItems.length > 0 ? { item_ids: selectedItems.map(i => i.public_id) } : {}),
            ...(mode === 'create' && selectedSupplier ? { supplier_id: selectedSupplier.public_id } : {}),
            is_holder: isHolder,
            user_ids: selectedUsers.map(u => u.public_id),
        });

        handleClose();
    };

    const handleClose = () => {
        setSelectedItems([]);
        setSupplierSearchTerm('');
        setUserSearchTerm('');
        setSelectedSupplier(null);
        setSelectedUsers([]);
        setIsHolder(false);
        setShowSupplierDropdown(false);
        setShowUserDropdown(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={mode === 'create' ? 'Criar Avaliação' : 'Editar Avaliação'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Itens - apenas em modo create */}
                {mode === 'create' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Itens da Licitação *
                        </label>
                        <div className="border border-gray-300 rounded-md p-3 max-h-60 overflow-y-auto">
                            {publicAcquisitionItems.length > 0 ? (
                                <div className="space-y-2">
                                    {publicAcquisitionItems.map((item) => (
                                        <label
                                            key={item.public_id}
                                            className="flex items-start p-2 hover:bg-gray-50 rounded cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.some(i => i.public_id === item.public_id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        handleItemSelect(item);
                                                    } else {
                                                        handleRemoveItem(item.public_id);
                                                    }
                                                }}
                                                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded mt-1"
                                            />
                                            <div className="ml-3 flex-1">
                                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                <div className="text-xs text-gray-600">Código: {item.internal_code}</div>
                                                {item.description && (
                                                    <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                                                )}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">
                                    Nenhum item disponível nesta licitação
                                </p>
                            )}
                        </div>
                        {selectedItems.length > 0 && (
                            <p className="text-xs text-gray-600 mt-1">
                                {selectedItems.length} {selectedItems.length === 1 ? 'item selecionado' : 'itens selecionados'}
                            </p>
                        )}
                    </div>
                )}

                {/* Itens - modo edit (readonly) */}
                {mode === 'edit' && initialData?.items && initialData.items.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Itens
                        </label>
                        <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
                            <div className="space-y-2">
                                {initialData.items.map((item) => (
                                    <div key={item.public_id} className="text-sm">
                                        <div className="font-medium text-gray-900">{item.name}</div>
                                        <div className="text-xs text-gray-600">Código: {item.internal_code}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Fornecedor - apenas em modo create */}
                {mode === 'create' && (
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fornecedor *
                        </label>
                        <input
                            type="text"
                            value={supplierSearchTerm}
                            onChange={(e) => {
                                setSupplierSearchTerm(e.target.value);
                                setShowSupplierDropdown(true);
                                if (!e.target.value) {
                                    setSelectedSupplier(null);
                                }
                            }}
                            onFocus={() => setShowSupplierDropdown(true)}
                            placeholder="Digite para buscar um fornecedor..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        {showSupplierDropdown && suppliersData && suppliersData.items.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                {suppliersData.items.map((supplier: Supplier) => (
                                    <div
                                        key={supplier.public_id}
                                        onClick={() => handleSupplierSelect(supplier)}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    >
                                        <div className="font-medium">{supplier.name}</div>
                                        {supplier.document && (
                                            <div className="text-sm text-gray-600">
                                                {supplier.document_type}: {supplier.document}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Fornecedor - modo edit (readonly) */}
                {mode === 'edit' && initialData?.supplier_name && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fornecedor
                        </label>
                        <input
                            type="text"
                            value={initialData.supplier_name}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                        />
                    </div>
                )}

                {/* Checkbox Detentor - apenas em modo create */}
                {mode === 'create' && (
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="is_holder"
                            checked={isHolder}
                            onChange={(e) => setIsHolder(e.target.checked)}
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        />
                        <label htmlFor="is_holder" className="ml-2 block text-sm text-gray-900">
                            Fornecedor é detentor deste item
                        </label>
                    </div>
                )}

                {/* Usuários Avaliadores */}
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Usuários Avaliadores *
                    </label>
                    <input
                        type="text"
                        value={userSearchTerm}
                        onChange={(e) => {
                            setUserSearchTerm(e.target.value);
                            setShowUserDropdown(true);
                        }}
                        onFocus={() => setShowUserDropdown(true)}
                        placeholder="Digite para buscar usuários..."
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
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                {/* Lista de usuários selecionados */}
                {selectedUsers.length > 0 && (
                    <div className="border border-gray-200 rounded-md p-3">
                        <div className="text-sm font-medium text-gray-700 mb-2">
                            Usuários selecionados ({selectedUsers.length})
                        </div>
                        <div className="space-y-2">
                            {selectedUsers.map((user) => (
                                <div
                                    key={user.public_id}
                                    className="flex items-center justify-between bg-gray-50 p-2 rounded"
                                >
                                    <div>
                                        <div className="text-sm font-medium">{user.name}</div>
                                        <div className="text-xs text-gray-600">{user.email}</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveUser(user.public_id)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                        Remover
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                        {mode === 'create' ? 'Criar Avaliação' : 'Salvar Alterações'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EvaluationModal;
