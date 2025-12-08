import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../Api/api';
import type {
    Question,
    QuestionPayload,
    QuestionUpdatePayload,
    QuestionResponse
} from '../Types/Question';

interface UseQuestionsInterface {
    fetchQuestions: (page?: number, size?: number) => ReturnType<typeof useQuery<QuestionResponse>>;
    fetchQuestionsByRole: (role: string, page?: number, size?: number) => ReturnType<typeof useQuery<QuestionResponse>>;
    fetchQuestionById: (id: string) => ReturnType<typeof useQuery<Question>>;
    createQuestion: () => ReturnType<typeof useMutation<Question, Error, QuestionPayload>>;
    updateQuestion: () => ReturnType<typeof useMutation<Question, Error, { id: string; data: QuestionUpdatePayload }>>;
    deleteQuestion: (id: string) => Promise<void>;
}

export const useQuestions = (): UseQuestionsInterface => {
    const queryClient = useQueryClient();

    const fetchQuestions = (page = 1, size = 10) => {
        return useQuery({
            queryKey: ['questions', page, size],
            queryFn: async (): Promise<QuestionResponse> => {
                const response = await api.get<QuestionResponse>(
                    `/questions?page=${page}&size=${size}`
                );
                return response.data;
            },
        });
    };

    const fetchQuestionsByRole = (role: string, page = 1, size = 10) => {
        return useQuery({
            queryKey: ['questions', 'by-role', role, page, size],
            queryFn: async (): Promise<QuestionResponse> => {
                const response = await api.get<QuestionResponse>(
                    `/questions/by-role/${role}?page=${page}&size=${size}`
                );
                return response.data;
            },
            enabled: !!role,
        });
    };

    const fetchQuestionById = (id: string) => {
        return useQuery({
            queryKey: ['question', id],
            queryFn: async (): Promise<Question> => {
                const response = await api.get<Question>(`/questions/${id}`);
                return response.data;
            },
            enabled: !!id,
        });
    };

    const createQuestion = () => {
        return useMutation({
            mutationFn: async (data: QuestionPayload): Promise<Question> => {
                console.log('useQuestions - Enviando POST para /questions/');
                console.log('useQuestions - Payload completo:', JSON.stringify(data, null, 2));
                const response = await api.post<Question>('/questions/', data);
                console.log('useQuestions - Resposta do backend:', response.data);
                return response.data;
            },
            onSuccess: (newQuestion) => {
                queryClient.invalidateQueries({
                    queryKey: ['questions']
                });

                queryClient.setQueryData(
                    ['question', newQuestion.public_id],
                    newQuestion
                );
            },
        });
    };

    const updateQuestion = () => {
        return useMutation({
            mutationFn: async ({ id, data }: { id: string; data: QuestionUpdatePayload }): Promise<Question> => {
                console.log('useQuestions - Enviando PUT para /questions/' + id);
                console.log('useQuestions - Payload completo:', JSON.stringify(data, null, 2));
                const response = await api.put<Question>(`/questions/${id}`, data);
                console.log('useQuestions - Resposta do backend:', response.data);
                return response.data;
            },
            onSuccess: (updatedQuestion) => {
                queryClient.invalidateQueries({
                    queryKey: ['questions']
                });

                queryClient.setQueryData(
                    ['question', updatedQuestion.public_id],
                    updatedQuestion
                );
            },
        });
    };

    const deleteQuestion = async (id: string): Promise<void> => {
        await api.delete(`/questions/${id}`);
        queryClient.invalidateQueries({
            queryKey: ['questions']
        });
    };

    return {
        fetchQuestions,
        fetchQuestionsByRole,
        fetchQuestionById,
        createQuestion,
        updateQuestion,
        deleteQuestion
    };
};
