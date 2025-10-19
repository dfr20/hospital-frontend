import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../Api/api';
import type { Subcategory, SubcategoryPayload, SubcategoryResponse } from '../Types/Subcategory';

interface UseSubcategoriesInterface {
    fetchSubcategories: (page?: number, size?: number) => ReturnType<typeof useQuery<SubcategoryResponse>>;
    createSubcategory: () => ReturnType<typeof useMutation<Subcategory, Error, SubcategoryPayload>>;
    updateSubcategory: () => ReturnType<typeof useMutation<Subcategory, Error, { id: string; data: SubcategoryPayload }>>;
    deleteSubcategory: (id: string) => Promise<void>;
    getSubcategoryByName: (name: string) => Promise<Subcategory>;
    getSubcategoryById: (id: string) => Promise<Subcategory>;
}

export const useSubcategories = (): UseSubcategoriesInterface => {
    const queryClient = useQueryClient();

    const fetchSubcategories = (page = 1, size = 10) => {
        return useQuery({
            queryKey: ['subcategories', 'list', page, size],
            queryFn: async (): Promise<SubcategoryResponse> => {
                const response = await api.get<SubcategoryResponse>(`/subcategories?page=${page}&size=${size}`);
                return response.data;
            },
        });
    };

    const createSubcategory = () => {
        return useMutation({
            mutationFn: async (data: SubcategoryPayload): Promise<Subcategory> => {
                const response = await api.post<Subcategory>('/subcategories/', data);
                return response.data;
            },
            onSuccess: (newSubcategory) => {
                queryClient.invalidateQueries({
                    queryKey: ['subcategories']
                });

                queryClient.setQueryData(
                    ['subcategory', newSubcategory.public_id],
                    newSubcategory
                );
            },
        });
    };

    const updateSubcategory = () => {
        return useMutation({
            mutationFn: async ({ id, data }: { id: string; data: SubcategoryPayload }): Promise<Subcategory> => {
                const response = await api.put<Subcategory>(`/subcategories/${id}`, data);
                return response.data;
            },
            onSuccess: (updatedSubcategory) => {
                queryClient.invalidateQueries({
                    queryKey: ['subcategories']
                });

                queryClient.setQueryData(
                    ['subcategory', updatedSubcategory.public_id],
                    updatedSubcategory
                );
            },
        });
    };

    const deleteSubcategory = async (id: string): Promise<void> => {
        await api.delete(`/subcategories/${id}`);
        queryClient.invalidateQueries({
            queryKey: ['subcategories']
        });
    };

    const getSubcategoryByName = async (name: string): Promise<Subcategory> => {
        const response = await api.get<Subcategory>(`/subcategories/name/${name}`);
        return response.data;
    };

    const getSubcategoryById = async (id: string): Promise<Subcategory> => {
        const response = await api.get<Subcategory>(`/subcategories/${id}`);
        return response.data;
    };

    return {
        fetchSubcategories,
        createSubcategory,
        updateSubcategory,
        deleteSubcategory,
        getSubcategoryByName,
        getSubcategoryById
    };
};
