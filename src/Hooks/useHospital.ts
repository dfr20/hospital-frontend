import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../Api/api';
import type { Hospital, HospitalPayload, HospitalResponse } from '../Types/Hospital';

interface useHospitalHook {
    fetchHospitals: (page?: number, size?: number) => ReturnType<typeof useQuery<HospitalResponse>>;
    fetchHospitalById: (id: string) => ReturnType<typeof useQuery<Hospital>>;
    fetchHospitalByName: (name: string) => ReturnType<typeof useQuery<Hospital[]>>;
    fetchHospitalByCity: (city: string) => ReturnType<typeof useQuery<Hospital[]>>;
    fetchHospitalByNationality: (nationality: string) => ReturnType<typeof useQuery<Hospital[]>>;
    createHospital: () => ReturnType<typeof useMutation<Hospital, Error, HospitalPayload>>;
    updateHospital: () => ReturnType<typeof useMutation<Hospital, Error, { id: string; data: Partial<HospitalPayload> }>>;
    deleteHospital: (id: string) => Promise<void>;
}

export const useHospital = (): useHospitalHook => {
    const queryClient = useQueryClient();

    const fetchHospitals = (page = 1, size = 10) => {
        return useQuery({
            queryKey: ['hospitals', 'list', page, size],
            queryFn: async (): Promise<HospitalResponse> => {
                const response = await api.get<HospitalResponse>(`/hospitals?page=${page}&size=${size}`);
                return response.data;
            },
        });
    };

    const fetchHospitalById = (id: string): ReturnType<typeof useQuery<Hospital>> => {
        return useQuery({
            queryKey: ['hospital', id],
            queryFn: async (): Promise<Hospital> => {
                const response = await api.get<Hospital>(`/hospitals/${id}`);
                return response.data;
            },
            enabled: !!id
        });
    };

    const fetchHospitalByName = (name: string): ReturnType<typeof useQuery<Hospital[]>> => {
        return useQuery({
            queryKey: ['hospitals', 'byName', name],
            queryFn: async (): Promise<Hospital[]> => {
                const response = await api.get<Hospital[]>(`/hospitals?name=${name}`);
                return response.data;
            },
            enabled: !!name
        });
    };

    const fetchHospitalByCity = (city: string): ReturnType<typeof useQuery<Hospital[]>> => {
        return useQuery({
            queryKey: ['hospitals', 'byCity', city],
            queryFn: async (): Promise<Hospital[]> => {
                const response = await api.get<Hospital[]>(`/hospitals?city=${city}`);
                return response.data;
            },
            enabled: !!city
        });
    };

    const fetchHospitalByNationality = (nationality: string): ReturnType<typeof useQuery<Hospital[]>> => {
        return useQuery({
            queryKey: ['hospitals', 'byNationality', nationality],
            queryFn: async (): Promise<Hospital[]> => {
                const response = await api.get<Hospital[]>(`/hospitals?nationality=${nationality}`);
                return response.data;
            },
            enabled: !!nationality
        });
    };

    const createHospital = () => {
        return useMutation({
            mutationFn: async (data: HospitalPayload): Promise<Hospital> => {
                const response = await api.post<Hospital>('/hospitals/', data);
                return response.data;
            },
            onSuccess: (newHospital) => {
                queryClient.invalidateQueries({
                    queryKey: ['hospitals']
                });

                queryClient.setQueryData(
                    ['hospital', newHospital.public_id],
                    newHospital
                );
            },
        });
    };

    const updateHospital = () => {
        return useMutation({
            mutationFn: async ({ id, data }: { id: string; data: Partial<HospitalPayload> }): Promise<Hospital> => {
                const response = await api.put<Hospital>(`/hospitals/${id}`, data);
                return response.data;
            },
            onSuccess: (updatedHospital) => {
                queryClient.invalidateQueries({
                    queryKey: ['hospitals']
                });

                queryClient.setQueryData(
                    ['hospital', updatedHospital.public_id],
                    updatedHospital
                );
            },
        });
    };

    const deleteHospital = async (id: string): Promise<void> => {
        await api.delete(`/hospitals/${id}`);
        queryClient.invalidateQueries({
            queryKey: ['hospitals']
        });
    };

    return {
        fetchHospitals,
        fetchHospitalById,
        fetchHospitalByName,
        fetchHospitalByCity,
        fetchHospitalByNationality,
        createHospital,
        updateHospital,
        deleteHospital
    };
};
