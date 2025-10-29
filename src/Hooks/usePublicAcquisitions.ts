import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../Api/api';
import type { PublicAcquisition, PublicAcquisitionPayload, PublicAcquisitionResponse } from '../Types/PublicAcquisition';

interface UsePublicAcquisitionsInterface {
    fetchPublicAcquisitions: (page?: number, size?: number) => ReturnType<typeof useQuery<PublicAcquisitionResponse>>;
    createPublicAcquisition: () => ReturnType<typeof useMutation<PublicAcquisition, Error, PublicAcquisitionPayload>>;
    updatePublicAcquisition: () => ReturnType<typeof useMutation<PublicAcquisition, Error, { id: string; data: PublicAcquisitionPayload }>>;
    deletePublicAcquisition: (id: string) => Promise<void>;
    getPublicAcquisitionByName: (name: string) => Promise<PublicAcquisition>;
    getPublicAcquisitionById: (id: string) => Promise<PublicAcquisition>;
}

export const usePublicAcquisitions = (): UsePublicAcquisitionsInterface => {
    const queryClient = useQueryClient();

    const fetchPublicAcquisitions = (page = 1, size = 10) => {
        return useQuery({
            queryKey: ['publicAcquisitions', 'list', page, size],
            queryFn: async (): Promise<PublicAcquisitionResponse> => {
                const response = await api.get<PublicAcquisitionResponse>(`/public-acquisitions?page=${page}&size=${size}`);
                return response.data;
            },
        });
    };

    const createPublicAcquisition = () => {
        return useMutation({
            mutationFn: async (data: PublicAcquisitionPayload): Promise<PublicAcquisition> => {
                const response = await api.post<PublicAcquisition>('/public-acquisitions/', data);
                return response.data;
            },
            onSuccess: (newPublicAcquisition) => {
                queryClient.invalidateQueries({
                    queryKey: ['publicAcquisitions']
                });

                queryClient.setQueryData(
                    ['publicAcquisition', newPublicAcquisition.public_id],
                    newPublicAcquisition
                );
            },
        });
    };

    const updatePublicAcquisition = () => {
        return useMutation({
            mutationFn: async ({ id, data }: { id: string; data: PublicAcquisitionPayload }): Promise<PublicAcquisition> => {
                const response = await api.put<PublicAcquisition>(`/public-acquisitions/${id}`, data);
                return response.data;
            },
            onSuccess: (updatedPublicAcquisition) => {
                queryClient.invalidateQueries({
                    queryKey: ['publicAcquisitions']
                });

                queryClient.setQueryData(
                    ['publicAcquisition', updatedPublicAcquisition.public_id],
                    updatedPublicAcquisition
                );
            },
        });
    };

    const deletePublicAcquisition = async (id: string): Promise<void> => {
        await api.delete(`/public-acquisitions/${id}`);
        queryClient.invalidateQueries({
            queryKey: ['publicAcquisitions']
        });
    };

    const getPublicAcquisitionByName = async (name: string): Promise<PublicAcquisition> => {
        const response = await api.get<PublicAcquisition>(`/public-acquisitions/name/${name}`);
        return response.data;
    };

    const getPublicAcquisitionById = async (id: string): Promise<PublicAcquisition> => {
        const response = await api.get<PublicAcquisition>(`/public-acquisitions/${id}`);
        return response.data;
    };

    return {
        fetchPublicAcquisitions,
        createPublicAcquisition,
        updatePublicAcquisition,
        deletePublicAcquisition,
        getPublicAcquisitionByName,
        getPublicAcquisitionById
    };
};
