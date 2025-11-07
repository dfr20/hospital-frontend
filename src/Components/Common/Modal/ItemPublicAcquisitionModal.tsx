import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useItems } from '../../../Hooks/useItems';
import { useSuppliers } from '../../../Hooks/useSuppliers';
import type { Item } from '../../../Types/Item';
import type { Supplier } from '../../../Types/Supplier';

interface ItemPublicAcquisitionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        item_id?: string;
        supplier_id: string;
        is_holder: boolean;
    }) => void;
    mode: 'create' | 'edit';
    initialData?: {
        item_id?: string;
        item_name?: string;
        supplier_id?: string;
        supplier_name?: string;
        is_holder?: boolean;
    };
}

const ItemPublicAcquisitionModal: React.FC<ItemPublicAcquisitionModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    mode,
    initialData
}) => {
    const [itemSearchTerm, setItemSearchTerm] = useState(initialData?.item_name || '');
    const [supplierSearchTerm, setSupplierSearchTerm] = useState(initialData?.supplier_name || '');
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [isHolder, setIsHolder] = useState(initialData?.is_holder || false);
    const [showItemDropdown, setShowItemDropdown] = useState(false);
    const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);

    const { searchItems } = useItems();
    const { searchSuppliers } = useSuppliers();

    const { data: itemsData } = searchItems(itemSearchTerm);
    const { data: suppliersData } = searchSuppliers(supplierSearchTerm);

    useEffect(() => {
        if (initialData?.item_id && initialData?.item_name) {
            setSelectedItem({
                public_id: initialData.item_id,
                name: initialData.item_name,
            } as Item);
        }
        if (initialData?.supplier_id && initialData?.supplier_name) {
            setSelectedSupplier({
                public_id: initialData.supplier_id,
                name: initialData.supplier_name,
            } as Supplier);
        }
    }, [initialData]);

    const handleItemSelect = (item: Item) => {
        setSelectedItem(item);
        setItemSearchTerm(item.name);
        setShowItemDropdown(false);
    };

    const handleSupplierSelect = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setSupplierSearchTerm(supplier.name);
        setShowSupplierDropdown(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedSupplier) {
            alert('Por favor, selecione um fornecedor');
            return;
        }

        if (mode === 'create' && !selectedItem) {
            alert('Por favor, selecione um item');
            return;
        }

        onSubmit({
            ...(mode === 'create' && selectedItem ? { item_id: selectedItem.public_id } : {}),
            supplier_id: selectedSupplier.public_id,
            is_holder: isHolder,
        });

        handleClose();
    };

    const handleClose = () => {
        setItemSearchTerm('');
        setSupplierSearchTerm('');
        setSelectedItem(null);
        setSelectedSupplier(null);
        setIsHolder(false);
        setShowItemDropdown(false);
        setShowSupplierDropdown(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={mode === 'create' ? 'Associar Item' : 'Editar Associação'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'create' && (
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Item *
                        </label>
                        <input
                            type="text"
                            value={itemSearchTerm}
                            onChange={(e) => {
                                setItemSearchTerm(e.target.value);
                                setShowItemDropdown(true);
                                if (!e.target.value) {
                                    setSelectedItem(null);
                                }
                            }}
                            onFocus={() => setShowItemDropdown(true)}
                            placeholder="Digite para buscar um item..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {mode === 'edit' && initialData?.item_name && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Item
                        </label>
                        <input
                            type="text"
                            value={initialData.item_name}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                        />
                    </div>
                )}

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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="is_holder"
                        checked={isHolder}
                        onChange={(e) => setIsHolder(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_holder" className="ml-2 block text-sm text-gray-900">
                        Detentor
                    </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        {mode === 'create' ? 'Associar' : 'Salvar'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ItemPublicAcquisitionModal;
