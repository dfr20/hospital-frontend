import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../Api/api';
import type {
    Answer,
    AnswerPayload,
    BulkAnswerPayload,
    AnswerUpdatePayload,
    AnswerResponse,
    ApplicableQuestionsResponse
} from '../Types/Answer';

export interface AnswerStatistics {
    total_questions: number;
    answered_questions: number;
    progress_percentage: number;
}

interface UseAnswersInterface {
    fetchAnswersByEvaluation: (evaluationId: string, page?: number, size?: number) => ReturnType<typeof useQuery<AnswerResponse>>;
    fetchAnswersByQuestion: (questionId: string, page?: number, size?: number) => ReturnType<typeof useQuery<AnswerResponse>>;
    fetchAnswerById: (id: string) => ReturnType<typeof useQuery<Answer>>;
    fetchApplicableQuestions: (evaluationId: string) => ReturnType<typeof useQuery<ApplicableQuestionsResponse>>;
    fetchAnswerStatistics: (evaluationId: string) => ReturnType<typeof useQuery<AnswerStatistics>>;
    createAnswer: () => ReturnType<typeof useMutation<Answer, Error, AnswerPayload>>;
    createBulkAnswers: () => ReturnType<typeof useMutation<Answer[], Error, BulkAnswerPayload>>;
    updateAnswer: () => ReturnType<typeof useMutation<Answer, Error, { id: string; data: AnswerUpdatePayload }>>;
    deleteAnswer: (id: string) => Promise<void>;
}

export const useAnswers = (): UseAnswersInterface => {
    const queryClient = useQueryClient();

    const fetchAnswersByEvaluation = (evaluationId: string, page = 1, size = 25) => {
        return useQuery({
            queryKey: ['answers', 'by-evaluation', evaluationId, page, size],
            queryFn: async (): Promise<AnswerResponse> => {
                const response = await api.get<AnswerResponse>(
                    `/answers/evaluation/${evaluationId}?page=${page}&size=${size}`
                );
                return response.data;
            },
            enabled: !!evaluationId,
        });
    };

    const fetchAnswersByQuestion = (questionId: string, page = 1, size = 25) => {
        return useQuery({
            queryKey: ['answers', 'by-question', questionId, page, size],
            queryFn: async (): Promise<AnswerResponse> => {
                const response = await api.get<AnswerResponse>(
                    `/answers/question/${questionId}?page=${page}&size=${size}`
                );
                return response.data;
            },
            enabled: !!questionId,
        });
    };

    const fetchAnswerById = (id: string) => {
        return useQuery({
            queryKey: ['answer', id],
            queryFn: async (): Promise<Answer> => {
                const response = await api.get<Answer>(`/answers/${id}`);
                return response.data;
            },
            enabled: !!id,
        });
    };

    const fetchApplicableQuestions = (evaluationId: string) => {
        return useQuery({
            queryKey: ['applicable-questions', evaluationId],
            queryFn: async (): Promise<ApplicableQuestionsResponse> => {
                const response = await api.get<ApplicableQuestionsResponse>(
                    `/answers/evaluation/${evaluationId}/applicable-questions`
                );
                return response.data;
            },
            enabled: !!evaluationId,
        });
    };

    const fetchAnswerStatistics = (evaluationId: string) => {
        return useQuery({
            queryKey: ['answer-statistics', evaluationId],
            queryFn: async (): Promise<AnswerStatistics> => {
                const response = await api.get<AnswerStatistics>(
                    `/answers/evaluation/${evaluationId}/statistics`
                );
                return response.data;
            },
            enabled: !!evaluationId,
        });
    };

    const createAnswer = () => {
        return useMutation({
            mutationFn: async (data: AnswerPayload): Promise<Answer> => {
                const response = await api.post<Answer>('/answers/', data);
                return response.data;
            },
            onSuccess: (newAnswer) => {
                queryClient.invalidateQueries({
                    queryKey: ['answers']
                });
                queryClient.invalidateQueries({
                    queryKey: ['applicable-questions', newAnswer.evaluation_id]
                });
                queryClient.invalidateQueries({
                    queryKey: ['answer-statistics', newAnswer.evaluation_id]
                });

                queryClient.setQueryData(
                    ['answer', newAnswer.public_id],
                    newAnswer
                );
            },
        });
    };

    const createBulkAnswers = () => {
        return useMutation({
            mutationFn: async (data: BulkAnswerPayload): Promise<Answer[]> => {
                const response = await api.post<Answer[]>('/answers/bulk', data);
                return response.data;
            },
            onSuccess: (newAnswers, variables) => {
                queryClient.invalidateQueries({
                    queryKey: ['answers']
                });
                queryClient.invalidateQueries({
                    queryKey: ['applicable-questions', variables.evaluation_id]
                });
                queryClient.invalidateQueries({
                    queryKey: ['answer-statistics', variables.evaluation_id]
                });
            },
        });
    };

    const updateAnswer = () => {
        return useMutation({
            mutationFn: async ({ id, data }: { id: string; data: AnswerUpdatePayload }): Promise<Answer> => {
                const response = await api.put<Answer>(`/answers/${id}`, data);
                return response.data;
            },
            onSuccess: (updatedAnswer) => {
                queryClient.invalidateQueries({
                    queryKey: ['answers']
                });
                queryClient.invalidateQueries({
                    queryKey: ['applicable-questions', updatedAnswer.evaluation_id]
                });
                queryClient.invalidateQueries({
                    queryKey: ['answer-statistics', updatedAnswer.evaluation_id]
                });

                queryClient.setQueryData(
                    ['answer', updatedAnswer.public_id],
                    updatedAnswer
                );
            },
        });
    };

    const deleteAnswer = async (id: string): Promise<void> => {
        await api.delete(`/answers/${id}`);
        queryClient.invalidateQueries({
            queryKey: ['answers']
        });
        queryClient.invalidateQueries({
            queryKey: ['applicable-questions']
        });
        queryClient.invalidateQueries({
            queryKey: ['answer-statistics']
        });
    };

    return {
        fetchAnswersByEvaluation,
        fetchAnswersByQuestion,
        fetchAnswerById,
        fetchApplicableQuestions,
        fetchAnswerStatistics,
        createAnswer,
        createBulkAnswers,
        updateAnswer,
        deleteAnswer
    };
};
