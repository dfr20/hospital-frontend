import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../Api/api';
import type {
  Item,
  ItemPayload,
  ItemResponse,
} from '../Types/Item';

interface UseItemsInterface {
    fetchItems: (page?: number, size?: number) => ReturnType<typeof useQuery<ItemResponse>>;
    searchItems: (searchTerm: string) => ReturnType<typeof useQuery<ItemResponse>>;
    createItem: () => ReturnType<typeof useMutation<Item, Error, ItemPayload>>;
    updateItem: () => ReturnType<typeof useMutation<Item, Error, { id: string; data: ItemPayload }>>;
    deleteItem: (id: string) => Promise<void>;
    getItemByName: (name: string) => Promise<Item>;
    getItemById: (id: string) => Promise<Item>;
    searchItemsBySimilarName: (name: string) => Promise<Item[]>;
}

export const useItems = (): UseItemsInterface => {
    const queryClient = useQueryClient();

    const fetchItems = (page = 1, size = 10) => {
        return useQuery({
            queryKey: ['items', 'list', page, size],
            queryFn: async (): Promise<ItemResponse> => {
                const response = await api.get<ItemResponse>(`/items?page=${page}&size=${size}`);
                return response.data;
            },
        });
    };

    const searchItems = (searchTerm: string) => {
        return useQuery({
            queryKey: ['items', 'search', searchTerm],
            queryFn: async (): Promise<ItemResponse> => {
                const response = await api.get<ItemResponse>(`/items/?unified=${encodeURIComponent(searchTerm)}`);
                return response.data;
            },
            enabled: searchTerm.length >= 2,
        });
    };

    const createItem = () => {
        return useMutation({
            mutationFn: async (data: ItemPayload): Promise<Item> => {
                const response = await api.post<Item>('/items/', data);
                return response.data;
            },
            onSuccess: (newItem) => {
                queryClient.invalidateQueries({
                    queryKey: ['items']
                });

                queryClient.setQueryData(
                    ['item', newItem.public_id],
                    newItem
                );
            },
        });
    };

    const updateItem = () => {
        return useMutation({
            mutationFn: async ({ id, data }: { id: string; data: ItemPayload }): Promise<Item> => {
                const response = await api.put<Item>(`/items/${id}`, data);
                return response.data;
            },
            onSuccess: (updatedItem) => {
                queryClient.invalidateQueries({
                    queryKey: ['items']
                });

                queryClient.setQueryData(
                    ['item', updatedItem.public_id],
                    updatedItem
                );
            },
        });
    };

    const deleteItem = async (id: string): Promise<void> => {
        await api.delete(`/items/${id}`);
        queryClient.invalidateQueries({
            queryKey: ['items']
        });
    };

    const getItemByName = async (name: string): Promise<Item> => {
        const response = await api.get<Item>(`/items/name/${name}`);
        return response.data;
    };

    const getItemById = async (id: string): Promise<Item> => {
        const response = await api.get<Item>(`/items/${id}`);
        return response.data;
    };

    const searchItemsBySimilarName = async (name: string): Promise<Item[]> => {
        const response = await api.get<Item[]>(`/items/similar/${name}`);
        return response.data;
    };

    return {
        fetchItems,
        searchItems,
        createItem,
        updateItem,
        deleteItem,
        getItemByName,
        getItemById,
        searchItemsBySimilarName
    };
};
