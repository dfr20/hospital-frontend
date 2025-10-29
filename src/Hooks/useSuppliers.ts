import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../Api/api';
import type { Supplier, SupplierPayload, SupplierResponse } from '../Types/Supplier';

interface UseSuppliersInterface {
    fetchSuppliers: (page?: number, size?: number) => ReturnType<typeof useQuery<SupplierResponse>>;
    createSupplier: () => ReturnType<typeof useMutation<Supplier, Error, SupplierPayload>>;
    updateSupplier: () => ReturnType<typeof useMutation<Supplier, Error, { id: string; data: SupplierPayload }>>;
    deleteSupplier: (id: string) => Promise<void>;
    getSupplierByName: (name: string) => Promise<Supplier>;
    getSupplierById: (id: string) => Promise<Supplier>;
}

export const useSuppliers = (): UseSuppliersInterface => {
    const queryClient = useQueryClient();

    const fetchSuppliers = (page = 1, size = 10) => {
        return useQuery({
            queryKey: ['suppliers', 'list', page, size],
            queryFn: async (): Promise<SupplierResponse> => {
                const response = await api.get<SupplierResponse>(`/suppliers?page=${page}&size=${size}`);
                return response.data;
            },
        });
    };

    const createSupplier = () => {
        return useMutation({
            mutationFn: async (data: SupplierPayload): Promise<Supplier> => {
                const response = await api.post<Supplier>('/suppliers/', data);
                return response.data;
            },
            onSuccess: (newSupplier) => {
                queryClient.invalidateQueries({
                    queryKey: ['suppliers']
                });

                queryClient.setQueryData(
                    ['supplier', newSupplier.public_id],
                    newSupplier
                );
            },
        });
    };

    const updateSupplier = () => {
        return useMutation({
            mutationFn: async ({ id, data }: { id: string; data: SupplierPayload }): Promise<Supplier> => {
                const response = await api.put<Supplier>(`/suppliers/${id}`, data);
                return response.data;
            },
            onSuccess: (updatedSupplier) => {
                queryClient.invalidateQueries({
                    queryKey: ['suppliers']
                });

                queryClient.setQueryData(
                    ['supplier', updatedSupplier.public_id],
                    updatedSupplier
                );
            },
        });
    };

    const deleteSupplier = async (id: string): Promise<void> => {
        await api.delete(`/suppliers/${id}`);
        queryClient.invalidateQueries({
            queryKey: ['suppliers']
        });
    };

    const getSupplierByName = async (name: string): Promise<Supplier> => {
        const response = await api.get<Supplier>(`/suppliers/name/${name}`);
        return response.data;
    };

    const getSupplierById = async (id: string): Promise<Supplier> => {
        const response = await api.get<Supplier>(`/suppliers/${id}`);
        return response.data;
    };

    return {
        fetchSuppliers,
        createSupplier,
        updateSupplier,
        deleteSupplier,
        getSupplierByName,
        getSupplierById
    };
};
