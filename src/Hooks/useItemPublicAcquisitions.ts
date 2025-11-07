import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../Api/api';
import type { 
    ItemPublicAcquisitionResponse, 
    ItemPublicAcquisition,
    ItemPublicAcquisitionPayload,
    ItemPublicAcquisitionUpdatePayload 
} from '../Types/ItemPublicAcquisition';

interface UseItemPublicAcquisitionsInterface {
    fetchItemsByPublicAcquisition: (publicAcquisitionId: string, page?: number, size?: number) => ReturnType<typeof useQuery<ItemPublicAcquisitionResponse>>;
    createItemPublicAcquisition: () => ReturnType<typeof useMutation<ItemPublicAcquisition, Error, ItemPublicAcquisitionPayload>>;
    updateItemPublicAcquisition: () => ReturnType<typeof useMutation<ItemPublicAcquisition, Error, { id: string; data: ItemPublicAcquisitionUpdatePayload }>>;
    deleteItemPublicAcquisition: () => ReturnType<typeof useMutation<void, Error, string>>;
}

export const useItemPublicAcquisitions = (): UseItemPublicAcquisitionsInterface => {
    const queryClient = useQueryClient();

    const fetchItemsByPublicAcquisition = (publicAcquisitionId: string, page = 1, size = 10) => {
        return useQuery({
            queryKey: ['itemPublicAcquisitions', publicAcquisitionId, page, size],
            queryFn: async (): Promise<ItemPublicAcquisitionResponse> => {
                const response = await api.get<ItemPublicAcquisitionResponse>(
                    `/item-public-acquisitions/by-public-acquisition/${publicAcquisitionId}?page=${page}&size=${size}`
                );
                return response.data;
            },
            enabled: !!publicAcquisitionId,
        });
    };

    const createItemPublicAcquisition = () => {
        return useMutation({
            mutationFn: async (data: ItemPublicAcquisitionPayload): Promise<ItemPublicAcquisition> => {
                const response = await api.post<ItemPublicAcquisition>('/item-public-acquisitions/', data);
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: ['itemPublicAcquisitions']
                });
            },
        });
    };

    const updateItemPublicAcquisition = () => {
        return useMutation({
            mutationFn: async ({ id, data }: { id: string; data: ItemPublicAcquisitionUpdatePayload }): Promise<ItemPublicAcquisition> => {
                const response = await api.put<ItemPublicAcquisition>(`/item-public-acquisitions/${id}`, data);
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: ['itemPublicAcquisitions']
                });
            },
        });
    };

    const deleteItemPublicAcquisition = () => {
        return useMutation({
            mutationFn: async (id: string): Promise<void> => {
                await api.delete(`/item-public-acquisitions/${id}`);
            },
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: ['itemPublicAcquisitions']
                });
            },
        });
    };

    return {
        fetchItemsByPublicAcquisition,
        createItemPublicAcquisition,
        updateItemPublicAcquisition,
        deleteItemPublicAcquisition,
    };
};
