import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../Api/api';
import type { JobTitle, JobTitlePayload, JobTitleResponse } from '../Types/JobTitle';

interface useJobTitlesHook {
    fetchJobTitles: (page?: number, size?: number) => ReturnType<typeof useQuery<JobTitleResponse>>;
    fetchJobTitleById: (id: string) => ReturnType<typeof useQuery<JobTitle>>;
    fetchJobTitleByTitle: (title: string, enabled?: boolean) => ReturnType<typeof useQuery<JobTitle[]>>;
    fetchJobTitleByDepartment: (department: string) => ReturnType<typeof useQuery<JobTitle[]>>;
    fetchJobTitleBySeniority: (seniority: string) => ReturnType<typeof useQuery<JobTitle[]>>;
    createJobTitle: () => ReturnType<typeof useMutation<JobTitle, Error, JobTitlePayload>>;
    updateJobTitle: () => ReturnType<typeof useMutation<JobTitle, Error, { id: string; data: Partial<JobTitlePayload> }>>;
    deleteJobTitle: (id: string) => Promise<void>;
}

export const useJobTitles = (): useJobTitlesHook => {
    const queryClient = useQueryClient();

    const fetchJobTitles = (page = 1, size = 10) => {
        return useQuery({
            queryKey: ['jobTitles', 'list', page, size],
            queryFn: async (): Promise<JobTitleResponse> => {
                const response = await api.get<JobTitleResponse>(`/job-titles?page=${page}&size=${size}`);
                return response.data;
            },
        });
    };

    const fetchJobTitleById = (id: string): ReturnType<typeof useQuery<JobTitle>> => {
        return useQuery({
            queryKey: ['jobTitle', id],
            queryFn: async (): Promise<JobTitle> => {
                const response = await api.get<JobTitle>(`/job-titles/${id}`);
                return response.data;
            },
            enabled: !!id
        });
    };

    const fetchJobTitleByTitle = (title: string, enabled = true): ReturnType<typeof useQuery<JobTitle[]>> => {
        return useQuery({
            queryKey: ['jobTitles', 'byTitle', title],
            queryFn: async (): Promise<JobTitle[]> => {
                const response = await api.get<JobTitle[]>(`/job-titles?title=${title}`);
                return response.data;
            },
            enabled: !!title && enabled
        });
    };

    const fetchJobTitleByDepartment = (department: string): ReturnType<typeof useQuery<JobTitle[]>> => {
        return useQuery({
            queryKey: ['jobTitles', 'byDepartment', department],
            queryFn: async (): Promise<JobTitle[]> => {
                const response = await api.get<JobTitle[]>(`/job-titles?department=${department}`);
                return response.data;
            },
            enabled: !!department
        });
    };

    const fetchJobTitleBySeniority = (seniority: string): ReturnType<typeof useQuery<JobTitle[]>> => {
        return useQuery({
            queryKey: ['jobTitles', 'bySeniority', seniority],
            queryFn: async (): Promise<JobTitle[]> => {
                const response = await api.get<JobTitle[]>(`/job-titles?seniority=${seniority}`);
                return response.data;
            },
            enabled: !!seniority
        });
    };

    const createJobTitle = () => {
        return useMutation({
            mutationFn: async (data: JobTitlePayload): Promise<JobTitle> => {
                const response = await api.post<JobTitle>('/job-titles/', data);
                return response.data;
            },
            onSuccess: (newJobTitle) => {
                queryClient.invalidateQueries({
                    queryKey: ['jobTitles']
                });

                queryClient.setQueryData(
                    ['jobTitle', newJobTitle.public_id],
                    newJobTitle
                );
            },
        });
    };

    const updateJobTitle = () => {
        return useMutation({
            mutationFn: async ({ id, data }: { id: string; data: Partial<JobTitlePayload> }): Promise<JobTitle> => {
                const response = await api.put<JobTitle>(`/job-titles/${id}`, data);
                return response.data;
            },
            onSuccess: (updatedJobTitle) => {
                queryClient.invalidateQueries({
                    queryKey: ['jobTitles']
                });

                queryClient.setQueryData(
                    ['jobTitle', updatedJobTitle.public_id],
                    updatedJobTitle
                );
            },
        });
    };

    const deleteJobTitle = async (id: string): Promise<void> => {
        await api.delete(`/job-titles/${id}`);
        queryClient.invalidateQueries({
            queryKey: ['jobTitles']
        });
    };

    return {
        fetchJobTitles,
        fetchJobTitleById,
        fetchJobTitleByTitle,
        fetchJobTitleByDepartment,
        fetchJobTitleBySeniority,
        createJobTitle,
        updateJobTitle,
        deleteJobTitle
    };
};
