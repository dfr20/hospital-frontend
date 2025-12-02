import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../Api/api';
import type { User, UserPayload, UserResponse } from '../Types/User';
import type { Role } from '../Types/Role';
import type { JobTitle } from '../Types/JobTitle';
import type { Hospital } from '../Types/Hospital';

interface Nationality {
  value: string;
  label: string;
}

interface useUsersHook {
    fetchUsers: (page?: number, size?: number, enabled?: boolean) => ReturnType<typeof useQuery<UserResponse>>;
    fetchPregoeiros: (page?: number, size?: number) => ReturnType<typeof useQuery<UserResponse>>;
    fetchUserById: (id: string) => ReturnType<typeof useQuery<User>>;
    searchUsers: (searchTerm: string) => ReturnType<typeof useQuery<UserResponse>>;
    fetchNationalities: () => ReturnType<typeof useQuery<Nationality[]>>;
    fetchRoles: () => ReturnType<typeof useQuery<Role[]>>;
    fetchJobTitles: () => ReturnType<typeof useQuery<JobTitle[]>>;
    fetchHospitals: () => ReturnType<typeof useQuery<Hospital[]>>;
    createUser: () => ReturnType<typeof useMutation<User, Error, UserPayload>>;
    updateUser: () => ReturnType<typeof useMutation<User, Error, { id: string; data: Partial<UserPayload> }>>;
    deleteUser: (id: string) => Promise<void>;
}

export const useUsers = (): useUsersHook => {
    const queryClient = useQueryClient();

    const fetchUsers = (page = 1, size = 10, enabled = true) => {
        return useQuery({
            queryKey: ['users', 'list', page, size],
            queryFn: async (): Promise<UserResponse> => {
                const response = await api.get<UserResponse>(`/users?page=${page}&size=${size}`);
                return response.data;
            },
            enabled: enabled
        });
    };

    const fetchPregoeiros = (page = 1, size = 10) => {
        return useQuery({
            queryKey: ['users', 'pregoeiros', page, size],
            queryFn: async (): Promise<UserResponse> => {
                try {
                    console.log('Buscando pregoeiros na rota: /users/pregoeiros/list');
                    const response = await api.get<UserResponse>(`/users/pregoeiros/list?page=${page}&size=${size}`);
                    console.log('Resposta pregoeiros:', response.data);
                    return response.data;
                } catch (error: any) {
                    console.error('Erro ao buscar pregoeiros:', error);
                    console.error('Detalhes do erro:', error.response?.data);
                    throw error;
                }
            },
            retry: false,
        });
    };

    const fetchUserById = (id: string): ReturnType<typeof useQuery<User>> => {
        return useQuery({
            queryKey: ['user', id],
            queryFn: async (): Promise<User> => {
                const response = await api.get<User>(`/users/${id}`);
                return response.data;
            },
            enabled: !!id
        });
    };

    const searchUsers = (searchTerm: string): ReturnType<typeof useQuery<UserResponse>> => {
        return useQuery({
            queryKey: ['users', 'search', searchTerm],
            queryFn: async (): Promise<UserResponse> => {
                const response = await api.get<UserResponse>(`/users/search/${searchTerm}`);
                return response.data;
            },
            enabled: searchTerm.length > 0
        });
    };

    const fetchNationalities = (): ReturnType<typeof useQuery<Nationality[]>> => {
        return useQuery({
            queryKey: ['nationalities'],
            queryFn: async (): Promise<Nationality[]> => {
                const response = await api.get<Nationality[]>('/nationalities');
                return response.data;
            },
        });
    };

    const fetchRoles = (): ReturnType<typeof useQuery<Role[]>> => {
        return useQuery({
            queryKey: ['roles'],
            queryFn: async (): Promise<Role[]> => {
                const response = await api.get('/roles');
                // Se a resposta for um objeto paginado, retorna items, senão retorna data
                if (response.data?.items) {
                    return response.data.items;
                }
                return response.data;
            },
        });
    };

    const fetchJobTitles = (): ReturnType<typeof useQuery<JobTitle[]>> => {
        return useQuery({
            queryKey: ['jobTitles'],
            queryFn: async (): Promise<JobTitle[]> => {
                const response = await api.get('/job-titles');
                // Se a resposta for um objeto paginado, retorna items, senão retorna data
                if (response.data?.items) {
                    return response.data.items;
                }
                return response.data;
            },
        });
    };

    const fetchHospitals = (): ReturnType<typeof useQuery<Hospital[]>> => {
        return useQuery({
            queryKey: ['hospitals', 'all'],
            queryFn: async (): Promise<Hospital[]> => {
                const response = await api.get('/hospitals');
                // Se a resposta for um objeto paginado, retorna items, senão retorna data
                if (response.data?.items) {
                    return response.data.items;
                }
                return response.data;
            },
        });
    };

    const createUser = () => {
        return useMutation({
            mutationFn: async (data: UserPayload): Promise<User> => {
                const response = await api.post<User>('/users/', data);
                return response.data;
            },
            onSuccess: (newUser) => {
                queryClient.invalidateQueries({
                    queryKey: ['users']
                });

                queryClient.setQueryData(
                    ['user', newUser.public_id],
                    newUser
                );
            },
        });
    };

    const updateUser = () => {
        return useMutation({
            mutationFn: async ({ id, data }: { id: string; data: Partial<UserPayload> }): Promise<User> => {
                const response = await api.put<User>(`/users/${id}`, data);
                return response.data;
            },
            onSuccess: (updatedUser) => {
                queryClient.invalidateQueries({
                    queryKey: ['users']
                });

                queryClient.setQueryData(
                    ['user', updatedUser.public_id],
                    updatedUser
                );
            },
        });
    };

    const deleteUser = async (id: string): Promise<void> => {
        await api.delete(`/users/${id}`);
        queryClient.invalidateQueries({
            queryKey: ['users']
        });
    };

    return {
        fetchUsers,
        fetchPregoeiros,
        fetchUserById,
        searchUsers,
        fetchNationalities,
        fetchRoles,
        fetchJobTitles,
        fetchHospitals,
        createUser,
        updateUser,
        deleteUser
    };
};
