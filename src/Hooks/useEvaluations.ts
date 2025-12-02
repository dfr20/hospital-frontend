import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../Api/api';
import type {
    Evaluation,
    EvaluationPayload,
    EvaluationUpdatePayload,
    EvaluationAssociateUserPayload,
    EvaluationResponse
} from '../Types/Evaluation';

interface UseEvaluationsInterface {
    fetchEvaluationsByPublicAcquisition: (publicAcquisitionId: string, page?: number, size?: number) => ReturnType<typeof useQuery<EvaluationResponse>>;
    fetchEvaluationsBySupplier: (supplierId: string, page?: number, size?: number) => ReturnType<typeof useQuery<EvaluationResponse>>;
    fetchEvaluationsByUser: (userId: string, page?: number, size?: number) => ReturnType<typeof useQuery<EvaluationResponse>>;
    fetchEvaluationsByItem: (itemId: string, page?: number, size?: number) => ReturnType<typeof useQuery<EvaluationResponse>>;
    getEvaluationById: (id: string) => Promise<Evaluation>;
    createEvaluation: () => ReturnType<typeof useMutation<Evaluation, Error, EvaluationPayload>>;
    updateEvaluation: () => ReturnType<typeof useMutation<Evaluation, Error, { id: string; data: EvaluationUpdatePayload }>>;
    deleteEvaluation: (id: string) => Promise<void>;
    associateUser: () => ReturnType<typeof useMutation<Evaluation, Error, { id: string; data: EvaluationAssociateUserPayload }>>;
}

export const useEvaluations = (): UseEvaluationsInterface => {
    const queryClient = useQueryClient();

    const fetchEvaluationsByPublicAcquisition = (publicAcquisitionId: string, page = 1, size = 10) => {
        return useQuery({
            queryKey: ['evaluations', 'by-public-acquisition', publicAcquisitionId, page, size],
            queryFn: async (): Promise<EvaluationResponse> => {
                const response = await api.get<EvaluationResponse>(
                    `/evaluations/by-public-acquisition/${publicAcquisitionId}?page=${page}&size=${size}`
                );
                return response.data;
            },
        });
    };

    const fetchEvaluationsBySupplier = (supplierId: string, page = 1, size = 10) => {
        return useQuery({
            queryKey: ['evaluations', 'by-supplier', supplierId, page, size],
            queryFn: async (): Promise<EvaluationResponse> => {
                const response = await api.get<EvaluationResponse>(
                    `/evaluations/by-supplier/${supplierId}?page=${page}&size=${size}`
                );
                return response.data;
            },
        });
    };

    const fetchEvaluationsByUser = (userId: string, page = 1, size = 10) => {
        return useQuery({
            queryKey: ['evaluations', 'by-user', userId, page, size],
            queryFn: async (): Promise<EvaluationResponse> => {
                const response = await api.get<EvaluationResponse>(
                    `/evaluations/by-user/${userId}?page=${page}&size=${size}`
                );
                return response.data;
            },
        });
    };

    const fetchEvaluationsByItem = (itemId: string, page = 1, size = 10) => {
        return useQuery({
            queryKey: ['evaluations', 'by-item', itemId, page, size],
            queryFn: async (): Promise<EvaluationResponse> => {
                const response = await api.get<EvaluationResponse>(
                    `/items/${itemId}/evaluations?page=${page}&size=${size}`
                );
                return response.data;
            },
            enabled: !!itemId,
        });
    };

    const getEvaluationById = async (id: string): Promise<Evaluation> => {
        const response = await api.get<Evaluation>(`/evaluations/${id}`);
        return response.data;
    };

    const createEvaluation = () => {
        return useMutation({
            mutationFn: async (data: EvaluationPayload): Promise<Evaluation> => {
                const response = await api.post<Evaluation>('/evaluations/', data);
                return response.data;
            },
            onSuccess: (newEvaluation) => {
                queryClient.invalidateQueries({
                    queryKey: ['evaluations']
                });

                queryClient.setQueryData(
                    ['evaluation', newEvaluation.public_id],
                    newEvaluation
                );
            },
        });
    };

    const updateEvaluation = () => {
        return useMutation({
            mutationFn: async ({ id, data }: { id: string; data: EvaluationUpdatePayload }): Promise<Evaluation> => {
                const response = await api.put<Evaluation>(`/evaluations/${id}`, data);
                return response.data;
            },
            onSuccess: (updatedEvaluation) => {
                queryClient.invalidateQueries({
                    queryKey: ['evaluations']
                });

                queryClient.setQueryData(
                    ['evaluation', updatedEvaluation.public_id],
                    updatedEvaluation
                );
            },
        });
    };

    const deleteEvaluation = async (id: string): Promise<void> => {
        await api.delete(`/evaluations/${id}`);
        queryClient.invalidateQueries({
            queryKey: ['evaluations']
        });
    };

    const associateUser = () => {
        return useMutation({
            mutationFn: async ({ id, data }: { id: string; data: EvaluationAssociateUserPayload }): Promise<Evaluation> => {
                const response = await api.post<Evaluation>(`/evaluations/${id}/associate-user`, data);
                return response.data;
            },
            onSuccess: (updatedEvaluation) => {
                queryClient.invalidateQueries({
                    queryKey: ['evaluations']
                });

                queryClient.setQueryData(
                    ['evaluation', updatedEvaluation.public_id],
                    updatedEvaluation
                );
            },
        });
    };

    return {
        fetchEvaluationsByPublicAcquisition,
        fetchEvaluationsBySupplier,
        fetchEvaluationsByUser,
        fetchEvaluationsByItem,
        getEvaluationById,
        createEvaluation,
        updateEvaluation,
        deleteEvaluation,
        associateUser
    };
};
