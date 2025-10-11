import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../Api/api';
import type { Catalog, CatalogPayload, CatalogResponse } from '../Types/Catalog';

interface useCatalogHook {
    fetchCatalogs: (page?: number, size?: number) => ReturnType<typeof useQuery<CatalogResponse>>;
    fetchCatalogById: (id: string) => ReturnType<typeof useQuery<Catalog>>;
    fetchCatalogByName: (name: string, enabled?: boolean) => ReturnType<typeof useQuery<Catalog[]>>;
    createCatalog: () => ReturnType<typeof useMutation<Catalog, Error, CatalogPayload>>;
    updateCatalog: () => ReturnType<typeof useMutation<Catalog, Error, { id: string; data: Partial<CatalogPayload> }>>;
    deleteCatalog: (id: string) => Promise<void>;
}

export const useCatalog = (): useCatalogHook => {
    const queryClient = useQueryClient();

    const fetchCatalogs = (page = 1, size = 10) => {
        return useQuery({
            queryKey: ['catalogs', 'list', page, size],
            queryFn: async (): Promise<CatalogResponse> => {
                const response = await api.get<CatalogResponse>(`/catalog?page=${page}&size=${size}`);
                return response.data;
            },
        });
    };

    const fetchCatalogById = (id: string): ReturnType<typeof useQuery<Catalog>> => {
        return useQuery({
            queryKey: ['catalog', id],
            queryFn: async (): Promise<Catalog> => {
                const response = await api.get<Catalog>(`/catalog/${id}`);
                return response.data;
            },
            enabled: !!id
        });
    };

    const fetchCatalogByName = (name: string, enabled = true): ReturnType<typeof useQuery<Catalog[]>> => {
        return useQuery({
            queryKey: ['catalogs', 'byName', name],
            queryFn: async (): Promise<Catalog[]> => {
                const response = await api.get<Catalog[]>(`/catalog?name=${name}`);
                return response.data;
            },
            enabled: !!name && enabled
        });
    };

    const createCatalog = () => {
        return useMutation({
            mutationFn: async (data: CatalogPayload): Promise<Catalog> => {
                const response = await api.post<Catalog>('/catalog/', data);
                return response.data;
            },
            onSuccess: (newCatalog) => {
                queryClient.invalidateQueries({
                    queryKey: ['catalogs']
                });

                queryClient.setQueryData(
                    ['catalog', newCatalog.public_id],
                    newCatalog
                );
            },
        });
    };

    const updateCatalog = () => {
        return useMutation({
            mutationFn: async ({ id, data }: { id: string; data: Partial<CatalogPayload> }): Promise<Catalog> => {
                const response = await api.put<Catalog>(`/catalog/${id}`, data);
                return response.data;
            },
            onSuccess: (updatedCatalog) => {
                queryClient.invalidateQueries({
                    queryKey: ['catalogs']
                });

                queryClient.setQueryData(
                    ['catalog', updatedCatalog.public_id],
                    updatedCatalog
                );
            },
        });
    };

    const deleteCatalog = async (id: string): Promise<void> => {
        await api.delete(`/catalog/${id}`);
        queryClient.invalidateQueries({
            queryKey: ['catalogs']
        });
    };

    return {
        fetchCatalogs,
        fetchCatalogById,
        fetchCatalogByName,
        createCatalog,
        updateCatalog,
        deleteCatalog
    };
};
