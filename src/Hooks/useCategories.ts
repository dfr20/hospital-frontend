import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../Api/api';
import type { Category, CategoryPayload, CategoryResponse } from '../Types/Category';

interface UseCategoriesInterface {
    fetchCategories: (page?: number, size?: number) => ReturnType<typeof useQuery<CategoryResponse>>;
    fetchCategoriesWithSubcategories: (page?: number, size?: number) => ReturnType<typeof useQuery<CategoryResponse>>;
    createCategory: () => ReturnType<typeof useMutation<Category, Error, CategoryPayload>>;
    updateCategory: () => ReturnType<typeof useMutation<Category, Error, { id: string; data: CategoryPayload }>>;
    deleteCategory: (id: string) => Promise<void>;
    getCategoryByName: (name: string) => Promise<Category>;
    getCategoryById: (id: string) => Promise<Category>;
}

export const useCategories = (): UseCategoriesInterface => {
    const queryClient = useQueryClient();

    const fetchCategories = (page = 1, size = 10) => {
        return useQuery({
            queryKey: ['categories', 'list', page, size],
            queryFn: async (): Promise<CategoryResponse> => {
                const response = await api.get<CategoryResponse>(`/categories?page=${page}&size=${size}`);
                return response.data;
            },
        });
    };

    const fetchCategoriesWithSubcategories = (page = 1, size = 10) => {
        return useQuery({
            queryKey: ['categories', 'with-subcategories', page, size],
            queryFn: async (): Promise<CategoryResponse> => {
                const response = await api.get<CategoryResponse>(`/categories/with-subcategories?page=${page}&size=${size}`);
                return response.data;
            },
        });
    };

    const createCategory = () => {
        return useMutation({
            mutationFn: async (data: CategoryPayload): Promise<Category> => {
                const response = await api.post<Category>('/categories/', data);
                return response.data;
            },
            onSuccess: (newCategory) => {
                queryClient.invalidateQueries({
                    queryKey: ['categories']
                });

                queryClient.setQueryData(
                    ['category', newCategory.public_id],
                    newCategory
                );
            },
        });
    };

    const updateCategory = () => {
        return useMutation({
            mutationFn: async ({ id, data }: { id: string; data: CategoryPayload }): Promise<Category> => {
                const response = await api.put<Category>(`/categories/${id}`, data);
                return response.data;
            },
            onSuccess: (updatedCategory) => {
                queryClient.invalidateQueries({
                    queryKey: ['categories']
                });

                queryClient.setQueryData(
                    ['category', updatedCategory.public_id],
                    updatedCategory
                );
            },
        });
    };

    const deleteCategory = async (id: string): Promise<void> => {
        await api.delete(`/categories/${id}`);
        queryClient.invalidateQueries({
            queryKey: ['categories']
        });
    };

    const getCategoryByName = async (name: string): Promise<Category> => {
        const response = await api.get<Category>(`/categories/name/${name}`);
        return response.data;
    };

    const getCategoryById = async (id: string): Promise<Category> => {
        const response = await api.get<Category>(`/categories/${id}`);
        return response.data;
    };

    return {
        fetchCategories,
        fetchCategoriesWithSubcategories,
        createCategory,
        updateCategory,
        deleteCategory,
        getCategoryByName,
        getCategoryById
    };
};
