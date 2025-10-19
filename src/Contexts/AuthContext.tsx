import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, UserMeResponse } from '../Types/User';
import api from '../Api/api';

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
 
interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem('access_token')
  );
  const [, setRefreshToken] = useState<string | null>(
    localStorage.getItem('refresh_token')
  );
  const [isLoading, setIsLoading] = useState(true);

  const saveTokens = (authResponse: AuthResponse) => {
    setAccessToken(authResponse.access_token);
    setRefreshToken(authResponse.refresh_token);
    localStorage.setItem('access_token', authResponse.access_token);
    localStorage.setItem('refresh_token', authResponse.refresh_token);
  };

  const clearTokens = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  };


  const fetchUserData = async (): Promise<void> => {
    try {
      const response = await api.get('/users/me');
      const userData: UserMeResponse = response.data;
      setUser(userData);
      // Salva os dados do usuário no localStorage para uso nas permissões
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      clearTokens();
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/', {
        email,
        password
      });

      const authData: AuthResponse = response.data;
      saveTokens(authData);
      
      await fetchUserData();
    } catch (error) {
      clearTokens();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearTokens();
  };

  useEffect(() => {
    const initializeAuth = async () => {
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      await fetchUserData();
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);


  const value: AuthContextType = {
    user,
    accessToken,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user && !!accessToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};