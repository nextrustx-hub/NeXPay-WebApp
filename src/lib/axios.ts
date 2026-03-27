import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { useAuthStore } from '@/store/auth-store';
import type { APIError } from './api-types';

// API Base URL - can be configured via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-wallet.nextrustx.com/api/v1';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Inject Bearer token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from auth store
    const token = useAuthStore.getState().token;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add locale to headers if available
    if (typeof window !== 'undefined') {
      const locale = document.documentElement.lang || 'pt-BR';
      config.headers['Accept-Language'] = locale;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<APIError>) => {
    const { response } = error;
    
    // Handle 401 Unauthorized
    if (response?.status === 401) {
      // Clear auth state
      useAuthStore.getState().logout();
      
      // Redirect to login if not already there
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const locale = currentPath.split('/')[1];
        const isValidLocale = ['pt-BR', 'fr', 'en', 'es'].includes(locale);
        const basePath = isValidLocale ? `/${locale}` : '';
        
        // Only redirect if not on login page
        if (!currentPath.includes('/login')) {
          window.location.href = `${basePath}/login?session_expired=true`;
        }
      }
    }
    
    // Handle 403 Forbidden
    if (response?.status === 403) {
      // User doesn't have permission - could show a toast or redirect
      console.error('Access forbidden:', response.data);
    }
    
    // Standardize error message
    const errorMessage = getErrorMessage(error);
    
    // Create a standardized error object
    const standardizedError = new Error(errorMessage) as Error & {
      code?: string;
      status?: number;
      details?: Record<string, string[]>;
    };
    
    standardizedError.code = response?.data?.error?.code || 'UNKNOWN_ERROR';
    standardizedError.status = response?.status;
    standardizedError.details = response?.data?.error?.details;
    
    return Promise.reject(standardizedError);
  }
);

// Helper function to extract error message
function getErrorMessage(error: AxiosError<APIError>): string {
  const { response } = error;
  
  // API returned an error response
  if (response?.data?.error) {
    const { message, code } = response.data.error;
    
    // Check for specific error codes
    switch (code) {
      case 'VALIDATION_ERROR':
        return formatValidationErrors(response.data.error.details || {});
      case 'UNAUTHORIZED':
        return 'Sua sessão expirou. Por favor, faça login novamente.';
      case 'FORBIDDEN':
        return 'Você não tem permissão para realizar esta ação.';
      case 'NOT_FOUND':
        return 'Recurso não encontrado.';
      case 'RATE_LIMIT_EXCEEDED':
        return 'Muitas requisições. Por favor, aguarde um momento.';
      case 'INSUFFICIENT_FUNDS':
        return 'Saldo insuficiente para realizar esta operação.';
      case 'INVALID_PIX_KEY':
        return 'Chave PIX inválida.';
      case 'LIMIT_EXCEEDED':
        return 'Limite de operação excedido.';
      default:
        return message || 'Ocorreu um erro inesperado.';
    }
  }
  
  // Network error
  if (error.code === 'ERR_NETWORK' || !response) {
    return 'Erro de conexão. Verifique sua conexão com a internet.';
  }
  
  // Timeout error
  if (error.code === 'ECONNABORTED') {
    return 'A requisição demorou muito. Tente novamente.';
  }
  
  // Server error
  if (response?.status && response.status >= 500) {
    return 'Erro no servidor. Por favor, tente novamente mais tarde.';
  }
  
  return 'Ocorreu um erro inesperado. Tente novamente.';
}

// Helper function to format validation errors
function formatValidationErrors(details: Record<string, string[]>): string {
  const messages: string[] = [];
  
  for (const [field, errors] of Object.entries(details)) {
    const fieldName = formatFieldName(field);
    messages.push(`${fieldName}: ${errors.join(', ')}`);
  }
  
  return messages.join('\n');
}

// Helper function to format field names
function formatFieldName(field: string): string {
  const fieldNames: Record<string, string> = {
    email: 'E-mail',
    password: 'Senha',
    name: 'Nome',
    phone: 'Telefone',
    document: 'Documento',
    amount: 'Valor',
    pixKey: 'Chave PIX',
    bankCode: 'Código do banco',
    agency: 'Agência',
    account: 'Conta',
  };
  
  return fieldNames[field] || field;
}

// Export helper functions for use in components
export { getErrorMessage };

// API helper functions
export const apiClient = {
  get: <T>(url: string, params?: Record<string, unknown>) => 
    api.get<T>(url, { params }),
    
  post: <T>(url: string, data?: unknown) => 
    api.post<T>(url, data),
    
  put: <T>(url: string, data?: unknown) => 
    api.put<T>(url, data),
    
  patch: <T>(url: string, data?: unknown) => 
    api.patch<T>(url, data),
    
  delete: <T>(url: string) => 
    api.delete<T>(url),
};

export default api;
