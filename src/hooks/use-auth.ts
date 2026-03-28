import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { api } from '@/lib/axios';
import type {
  LoginRequest,
  AuthResponse,
  RegisterRequest,
  User,
  MeResponse,
  Balances,
  BalanceResponse,
  Transaction,
  TransactionListResponse,
  TransactionsQueryParams,
  DepositRequest,
  DepositResponse,
  DepositStatusResponse,
  WithdrawRequest,
  WithdrawResponse,
  SwapRequest,
  SwapResponse,
  APIKey,
  APIKeyListResponse,
  CreateAPIKeyResponse,
  WebhookConfigRequest,
  WebhookConfigResponse,
} from '@/lib/api-types';

// ============================================
// Auth Selectors
// ============================================
const selectUser = (state: ReturnType<typeof useAuthStore.getState>) => state.user;
const selectIsAuthenticated = (state: ReturnType<typeof useAuthStore.getState>) => state.isAuthenticated;
const selectIsLoading = (state: ReturnType<typeof useAuthStore.getState>) => state.isLoading;
const selectToken = (state: ReturnType<typeof useAuthStore.getState>) => state.token;

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
      if (data.success && data.access_token) {
        // Fetch user data after login
        api.get<MeResponse>('/auth/me').then((meResponse) => {
          if (meResponse.data.success && meResponse.data.data?.user) {
            store.setAuth(data.access_token, meResponse.data.data.user);
          }
        });
      }
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterRequest): Promise<AuthResponse> => {
      const response = await api.post<AuthResponse>('/auth/register', {
        ...userData,
        tier: userData.tier || 'WHITE',
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.access_token) {
        // Fetch user data after registration
        api.get<MeResponse>('/auth/me').then((meResponse) => {
          if (meResponse.data.success && meResponse.data.data?.user) {
            store.setAuth(data.access_token, meResponse.data.data.user);
          }
        });
      }
    },
  });

  // Logout function
  const logout = useCallback(async () => {
    try {
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
      const response = await api.get<MeResponse>('/auth/me');
      if (response.data.success && response.data.data?.user) {
        store.setUser(response.data.data.user);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, [store]);

  return {
    user,
    isAuthenticated,
    isLoading,
    token,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    refreshUser,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
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
    queryFn: async (): Promise<Balances | null> => {
      const response = await api.get<BalanceResponse>('/wallet/balance');
      return response.data.success ? response.data.balances : null;
    },
    enabled: isAuthenticated && !!token,
    refetchInterval: 30000,
    staleTime: 10000,
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
      const response = await api.get<MeResponse>('/auth/me');
      return response.data.success ? response.data.data.user : null;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
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
          type: params?.type,
        },
      });
      
      if (response.data.success && response.data.data) {
        return {
          transactions: response.data.data.transactions,
          total: response.data.data.transactions.length,
        };
      }
      return null;
    },
    enabled: isAuthenticated,
    staleTime: 30000,
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

// ============================================
// Deposit Hook
// ============================================
export function useDeposit() {
  const createDepositMutation = useMutation({
    mutationFn: async (data: DepositRequest): Promise<DepositResponse> => {
      const response = await api.post<DepositResponse>('/wallet/deposit/fiat', data);
      return response.data;
    },
  });

  const checkStatusMutation = useMutation({
    mutationFn: async (transactionId: string): Promise<DepositStatusResponse> => {
      const response = await api.get<DepositStatusResponse>(`/wallet/deposit/status/${transactionId}`);
      return response.data;
    },
  });

  return {
    createDeposit: createDepositMutation.mutate,
    isCreating: createDepositMutation.isPending,
    depositData: createDepositMutation.data,
    depositError: createDepositMutation.error,
    checkStatus: checkStatusMutation.mutate,
    isCheckingStatus: checkStatusMutation.isPending,
    statusData: checkStatusMutation.data,
  };
}

// ============================================
// Withdraw Hook
// ============================================
export function useWithdraw() {
  const withdrawMutation = useMutation({
    mutationFn: async (data: WithdrawRequest): Promise<WithdrawResponse> => {
      const response = await api.post<WithdrawResponse>('/wallet/withdraw/fiat', data);
      return response.data;
    },
  });

  return {
    withdraw: withdrawMutation.mutate,
    isWithdrawing: withdrawMutation.isPending,
    withdrawData: withdrawMutation.data,
    withdrawError: withdrawMutation.error,
  };
}

// ============================================
// Swap Hook
// ============================================
export function useSwap() {
  const swapMutation = useMutation({
    mutationFn: async (data: SwapRequest): Promise<SwapResponse> => {
      const response = await api.post<SwapResponse>('/wallet/swap', data);
      return response.data;
    },
  });

  return {
    swap: swapMutation.mutate,
    isSwapping: swapMutation.isPending,
    swapData: swapMutation.data,
    swapError: swapMutation.error,
  };
}

// ============================================
// API Keys Hook
// ============================================
export function useAPIKeys() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async (): Promise<APIKey[]> => {
      const response = await api.get<APIKeyListResponse>('/b2b/api-keys');
      return response.data.success ? response.data.data : [];
    },
    enabled: isAuthenticated,
    staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: async (name?: string): Promise<CreateAPIKeyResponse> => {
      const response = await api.post<CreateAPIKeyResponse>('/b2b/api-keys/generate', { name });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (keyId: string) => {
      await api.delete(`/b2b/api-keys/${keyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });

  return {
    apiKeys: data || [],
    isLoading,
    isFetching,
    error,
    refetch,
    createKey: createMutation.mutate,
    isCreating: createMutation.isPending,
    createdKey: createMutation.data,
    createError: createMutation.error,
    revokeKey: revokeMutation.mutate,
    isRevoking: revokeMutation.isPending,
  };
}

// ============================================
// Webhook Hook
// ============================================
export function useWebhook() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['webhook'],
    queryFn: async (): Promise<WebhookConfigResponse | null> => {
      const response = await api.get<WebhookConfigResponse>('/b2b/webhooks');
      return response.data.success ? response.data : null;
    },
    enabled: isAuthenticated,
    staleTime: 60000,
  });

  const configMutation = useMutation({
    mutationFn: async (webhookUrl: string): Promise<WebhookConfigResponse> => {
      const response = await api.post<WebhookConfigResponse>('/b2b/webhooks/config', {
        webhook_url: webhookUrl,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhook'] });
    },
  });

  const testMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/b2b/webhooks/test');
      return response.data;
    },
  });

  return {
    webhook: data,
    isLoading,
    error,
    refetch,
    configWebhook: configMutation.mutate,
    isConfiguring: configMutation.isPending,
    configError: configMutation.error,
    testWebhook: testMutation.mutate,
    isTesting: testMutation.isPending,
  };
}

// ============================================
// Auth Check Hook
// ============================================
export function useAuthCheck() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);
  const token = useAuthStore(selectToken);
  const store = useAuthStore();

  useQuery({
    queryKey: ['auth-check'],
    queryFn: async (): Promise<User | null> => {
      const response = await api.get<MeResponse>('/auth/me');
      if (response.data.success && response.data.data?.user) {
        store.setUser(response.data.data.user);
        return response.data.data.user;
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
