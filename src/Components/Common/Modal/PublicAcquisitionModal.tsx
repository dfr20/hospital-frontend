import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useItems } from '../../../Hooks/useItems';
import { useUsers } from '../../../Hooks/useUsers';
import type { Item } from '../../../Types/Item';
import type { User } from '../../../Types/User';

interface PublicAcquisitionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        code: string;
        title: string;
        year: number;
        user_id: string;
        item_ids: string[];
    }) => void;
    mode: 'create' | 'edit' | 'view';
    initialData?: {
        code?: string;
        title?: string;
        year?: number;
        user_id?: string;
        items?: Item[];
    };
    isLoading?: boolean;
}

const PublicAcquisitionModal: React.FC<PublicAcquisitionModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    mode,
    initialData,
    isLoading = false
}) => {
    const [code, setCode] = useState(initialData?.code || '');
    const [title, setTitle] = useState(initialData?.title || '');
    const [year, setYear] = useState(initialData?.year?.toString() || '');
    const [selectedUserId, setSelectedUserId] = useState(initialData?.user_id || '');
    const [itemSearchTerm, setItemSearchTerm] = useState('');
    const [selectedItems, setSelectedItems] = useState<Item[]>(initialData?.items || []);
    const [showItemDropdown, setShowItemDropdown] = useState(false);

    const { searchItems } = useItems();
    const { fetchPregoeiros } = useUsers();

    const { data: itemsData } = searchItems(itemSearchTerm);
    const { data: pregoeirosData } = fetchPregoeiros(1, 25);

    useEffect(() => {
        if (initialData) {
            setCode(initialData.code || '');
            setTitle(initialData.title || '');
            setYear(initialData.year?.toString() || '');
            setSelectedUserId(initialData.user_id || '');
            setSelectedItems(initialData.items || []);
        }
    }, [initialData]);

    const handleItemSelect = (item: Item) => {
        if (!selectedItems.find(i => i.public_id === item.public_id)) {
            setSelectedItems([...selectedItems, item]);
        }
        setItemSearchTerm('');
        setShowItemDropdown(false);
    };

    const handleRemoveItem = (itemId: string) => {
        setSelectedItems(selectedItems.filter(i => i.public_id !== itemId));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!code.trim()) {
            alert('Por favor, preencha o código da licitação');
            return;
        }

        if (!title.trim()) {
            alert('Por favor, preencha o título da licitação');
            return;
        }

        if (!year.trim() || isNaN(parseInt(year))) {
            alert('Por favor, preencha um ano válido');
            return;
        }

        if (!selectedUserId) {
            alert('Por favor, selecione um pregoeiro');
            return;
        }

        if (mode === 'create' && selectedItems.length === 0) {
            alert('Por favor, selecione pelo menos um item');
            return;
        }

        onSubmit({
            code: code.trim(),
            title: title.trim(),
            year: parseInt(year),
            user_id: selectedUserId,
            item_ids: selectedItems.map(i => i.public_id),
        });

        handleClose();
    };

    const handleClose = () => {
        setCode('');
        setTitle('');
        setYear('');
        setSelectedUserId('');
        setItemSearchTerm('');
        setSelectedItems([]);
        setShowItemDropdown(false);
        onClose();
    };

    const isReadOnly = mode === 'view';

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={
                mode === 'view'
                    ? 'Detalhes da Licitação'
                    : mode === 'edit'
                    ? 'Editar Licitação'
                    : 'Criar Nova Licitação'
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Código */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código *
                    </label>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Ex: 001/2024"
                    />
                </div>

                {/* Título */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título *
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Ex: Aquisição de Medicamentos"
                    />
                </div>

                {/* Ano */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ano *
                    </label>
                    <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Ex: 2024"
                        min="2000"
                        max="2100"
                    />
                </div>

                {/* Pregoeiro */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pregoeiro *
                    </label>
                    <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                        <option value="">Selecione um pregoeiro</option>
                        {pregoeirosData?.items.map((pregoeiro: User) => (
                            <option key={pregoeiro.public_id} value={pregoeiro.public_id}>
                                {pregoeiro.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Itens - apenas em modo create */}
                {mode === 'create' && (
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Itens da Licitação *
                        </label>
                        <input
                            type="text"
                            value={itemSearchTerm}
                            onChange={(e) => {
                                setItemSearchTerm(e.target.value);
                                setShowItemDropdown(true);
                            }}
                            onFocus={() => setShowItemDropdown(true)}
                            placeholder="Digite para buscar itens..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        {showItemDropdown && itemsData && itemsData.items.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                {itemsData.items.map((item: Item) => (
                                    <div
                                        key={item.public_id}
                                        onClick={() => handleItemSelect(item)}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    >
                                        <div className="font-medium">{item.name}</div>
                                        {item.description && (
                                            <div className="text-sm text-gray-600">{item.description}</div>
                                        )}
                                        <div className="text-xs text-gray-500">Código: {item.internal_code}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Lista de itens selecionados */}
                {selectedItems.length > 0 && (
                    <div className="border border-gray-200 rounded-md p-3">
                        <div className="text-sm font-medium text-gray-700 mb-2">
                            Itens selecionados ({selectedItems.length})
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {selectedItems.map((item) => (
                                <div
                                    key={item.public_id}
                                    className="flex items-center justify-between bg-gray-50 p-2 rounded"
                                >
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">{item.name}</div>
                                        <div className="text-xs text-gray-600">Código: {item.internal_code}</div>
                                    </div>
                                    {mode === 'create' && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(item.public_id)}
                                            className="text-red-600 hover:text-red-800 text-sm ml-2"
                                        >
                                            Remover
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!isReadOnly && (
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
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Salvando...' : mode === 'edit' ? 'Salvar Alterações' : 'Criar Licitação'}
                        </button>
                    </div>
                )}

                {isReadOnly && (
                    <div className="flex justify-end pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                        >
                            Fechar
                        </button>
                    </div>
                )}
            </form>
        </Modal>
    );
};

export default PublicAcquisitionModal;
