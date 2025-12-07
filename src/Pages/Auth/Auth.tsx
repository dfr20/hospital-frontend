import React, { useEffect, useState } from 'react';
import { CircleUser, KeyRound, Hospital, Eye, EyeOff } from 'lucide-react';
import backgroundImage from '../../assets/auth-bg/costa.png';
import { useAuth } from '../../Contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Erro ao fazer login';
      setError(errorMessage);
      // Não limpa os campos de email e senha para o usuário tentar novamente
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-gray-50">
      <div className="hidden md:flex md:w-1/2 items-center justify-center bg-cover bg-center relative" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className="absolute inset-0 bg-gradient-to-tl from-teal-300 to-transparent"></div>
      </div>

      <div className="flex-1 md:w-1/2 flex flex-col items-center justify-center p-4 md:-mt-20">
        <div className="flex flex-col items-center space-y-2 mb-6 md:mb-8">
          <Hospital size={32} className="text-teal-300 mb-2" />
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 text-center">Sistema de Hospital</h2>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-[400px] space-y-4 md:space-y-6 p-6 md:p-8 rounded-2xl shadow-lg bg-white">
          <p className="text-base md:text-lg text-center text-gray-700">Entre com as credenciais</p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded border border-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="relative">
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-3 md:p-2 rounded w-full pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent text-base"
              disabled={isLoading}
            />
            <CircleUser className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-3 md:p-2 rounded w-full pl-3 pr-20 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent text-base"
              disabled={isLoading}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="cursor-pointer bg-teal-300 text-white p-3 md:p-2 rounded w-full hover:bg-teal-400 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 text-base font-medium"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;