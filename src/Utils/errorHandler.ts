import { AxiosError } from 'axios';

interface ApiErrorResponse {
  message?: string;
  detail?: string | Array<{ type: string; loc: string[]; msg: string; input: any }>;
  error?: string;
  errors?: Record<string, string[]>;
}

/**
 * Extrai a mensagem de erro de uma resposta de API
 * @param error - Erro capturado do Axios ou erro genérico
 * @returns Mensagem de erro formatada para exibição ao usuário
 */
export const getErrorMessage = (error: unknown): string => {
  // Se for um AxiosError
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    // Verificar se há dados na resposta
    if (axiosError.response?.data) {
      const data = axiosError.response.data;

      // Tentar diferentes formatos de mensagem de erro
      if (data.message) {
        return data.message;
      }

      if (data.detail) {
        // Se detail for um array (formato FastAPI/Pydantic)
        if (Array.isArray(data.detail)) {
          const firstError = data.detail[0];
          if (firstError && firstError.msg) {
            return firstError.msg;
          }
        }
        // Se detail for uma string
        if (typeof data.detail === 'string') {
          return data.detail;
        }
      }

      if (data.error) {
        return data.error;
      }

      // Se houver erros de validação
      if (data.errors && typeof data.errors === 'object') {
        const firstError = Object.values(data.errors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          return firstError[0];
        }
      }
    }

    // Mensagens baseadas no status HTTP
    if (axiosError.response?.status) {
      switch (axiosError.response.status) {
        case 400:
          return 'Dados inválidos. Verifique as informações e tente novamente.';
        case 401:
          return 'Não autorizado. Faça login novamente.';
        case 403:
          return 'Você não tem permissão para realizar esta ação.';
        case 404:
          return 'Recurso não encontrado.';
        case 409:
          return 'Conflito: este recurso já existe.';
        case 422:
          return 'Dados inválidos. Verifique os campos obrigatórios.';
        case 500:
          return 'Erro interno do servidor. Tente novamente mais tarde.';
        case 502:
          return 'Serviço temporariamente indisponível. Tente novamente.';
        case 503:
          return 'Serviço em manutenção. Tente novamente mais tarde.';
        default:
          return `Erro na requisição (${axiosError.response.status}).`;
      }
    }

    // Se não há resposta (erro de rede)
    if (axiosError.request && !axiosError.response) {
      return 'Erro de conexão. Verifique sua internet e tente novamente.';
    }
  }

  // Se for um erro padrão do JavaScript
  if (error instanceof Error) {
    return error.message;
  }

  // Fallback genérico
  return 'Ocorreu um erro inesperado. Tente novamente.';
};
