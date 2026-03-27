import { useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore, selectUser, selectIsAuthenticated, selectIsLoading, selectToken } from '@/store/auth-store';
import { api } from '@/lib/axios';
import type {
  LoginRequest,
  AuthResponse,
  RegisterRequest,
  User,
  Balance,
  BalanceResponse,
  Transaction,
  TransactionListResponse,
  TransactionsQueryParams,
} from '@/lib/api-types';

// ============================================
// Main Auth Hook
// ============================================

export function useAuth() {
  const store = useAuthStore();
  const user = useAuthStore(selectUser);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);
  const token = useAuthStore(selectToken);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest): Promise<AuthResponse> => {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        store.setAuth(data.data.token, data.data.user);
      }
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterRequest): Promise<AuthResponse> => {
      const response = await api.post<AuthResponse>('/auth/register', userData);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        store.setAuth(data.data.token, data.data.user);
      }
    },
  });

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Optionally call logout endpoint to invalidate token on server
      await api.post('/auth/logout');
    } catch {
      // Ignore errors on logout
    } finally {
      store.logout();
    }
  }, [store]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get<{ success: boolean; data: User }>('/auth/me');
      if (response.data.success && response.data.data) {
        store.setUser(response.data.data);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, [store]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    token,
    
    // Actions
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    refreshUser,
    
    // Mutation states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    
    // Reset mutations
    resetLogin: loginMutation.reset,
    resetRegister: registerMutation.reset,
  };
}

// ============================================
// Balance Hook
// ============================================

export function useBalance() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const token = useAuthStore(selectToken);

  const query = useQuery({
    queryKey: ['balance', token],
    queryFn: async (): Promise<Balance | null> => {
      const response = await api.get<BalanceResponse>('/wallet/balance');
      return response.data.success ? response.data.data : null;
    },
    enabled: isAuthenticated && !!token,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // Consider stale after 10 seconds
  });

  return {
    balance: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

// ============================================
// Profile Hook
// ============================================

export function useProfile() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const store = useAuthStore();

  const query = useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<User | null> => {
      const response = await api.get<{ success: boolean; data: User }>('/auth/me');
      return response.data.success ? response.data.data : null;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<User>): Promise<User> => {
      const response = await api.patch<{ success: boolean; data: User }>('/auth/me', data);
      return response.data.data;
    },
    onSuccess: (user) => {
      store.setUser(user);
    },
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    
    // Update
    updateProfile: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
  };
}

// ============================================
// Password Change Hook
// ============================================

export function useChangePassword() {
  const mutation = useMutation({
    mutationFn: async (data: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }): Promise<void> => {
      await api.post('/auth/change-password', data);
    },
  });

  return {
    changePassword: mutation.mutate,
    isChanging: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}

// ============================================
// Auth Check Hook (for protected routes)
// ============================================

export function useAuthCheck() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);
  const token = useAuthStore(selectToken);
  const store = useAuthStore();

  // If we have a token but user data is missing, try to fetch it
  useQuery({
    queryKey: ['auth-check'],
    queryFn: async (): Promise<User | null> => {
      const response = await api.get<{ success: boolean; data: User }>('/auth/me');
      if (response.data.success && response.data.data) {
        store.setUser(response.data.data);
        return response.data.data;
      }
      return null;
    },
    enabled: !!token && !isAuthenticated,
    retry: false,
    staleTime: Infinity,
  });

  return {
    isAuthenticated,
    isLoading,
    hasToken: !!token,
  };
}

// ============================================
// Transactions Hook
// ============================================

export function useTransactions(params?: TransactionsQueryParams) {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  const query = useQuery({
    queryKey: ['transactions', params],
    queryFn: async (): Promise<{ transactions: Transaction[]; total: number } | null> => {
      const response = await api.get<TransactionListResponse>('/transactions', {
        params: {
          limit: params?.limit || 10,
          page: params?.page || 1,
          type: params?.type,
          status: params?.status,
          startDate: params?.startDate,
          endDate: params?.endDate,
          sortBy: params?.sortBy || 'createdAt',
          sortOrder: params?.sortOrder || 'desc',
        },
      });
      
      if (response.data.success && response.data.data) {
        return {
          transactions: response.data.data.transactions,
          total: response.data.data.pagination.total,
        };
      }
      return null;
    },
    enabled: isAuthenticated,
    staleTime: 30000, // 30 seconds
  });

  return {
    transactions: query.data?.transactions || [],
    total: query.data?.total || 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
