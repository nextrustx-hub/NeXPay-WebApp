// ============================================
// User & Authentication Types
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  document?: string;
  documentType?: 'cpf' | 'cnpj';
  status: 'active' | 'inactive' | 'pending_verification' | 'suspended';
  kycLevel: 'none' | 'basic' | 'advanced';
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
    refreshToken?: string;
    expiresIn?: number;
  };
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  document?: string;
  documentType?: 'cpf' | 'cnpj';
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

// ============================================
// Wallet & Balance Types
// ============================================

export interface Wallet {
  id: string;
  userId: string;
  status: 'active' | 'frozen' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface Balance {
  available: number;
  pending: number;
  frozen: number;
  currency: string;
  lastUpdated: string;
}

export interface BalanceResponse {
  success: boolean;
  data: Balance;
}

// ============================================
// Transaction Types
// ============================================

export type TransactionType = 
  | 'deposit' 
  | 'withdraw' 
  | 'transfer' 
  | 'pix_received' 
  | 'pix_sent';

export type TransactionStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'cancelled';

export interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  fee: number;
  netAmount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, unknown>;
  pixCode?: string;
  pixQrCode?: string;
  expiresAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionListResponse {
  success: boolean;
  data: {
    transactions: Transaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface TransactionDetailsResponse {
  success: boolean;
  data: Transaction;
}

export interface TransactionsQueryParams {
  page?: number;
  limit?: number;
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// Deposit Types
// ============================================

export interface DepositRequest {
  amount: number;
  method: 'pix' | 'bank_transfer';
  metadata?: Record<string, unknown>;
}

export interface DepositResponse {
  success: boolean;
  data: {
    transactionId: string;
    pixCode?: string;
    pixQrCode?: string;
    amount: number;
    expiresAt: string;
  };
  message?: string;
}

// ============================================
// Withdraw Types
// ============================================

export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';

export interface WithdrawRequest {
  amount: number;
  method: 'pix' | 'bank_account';
  pixKey?: string;
  pixKeyType?: PixKeyType;
  bankInfo?: {
    bankCode: string;
    bankName: string;
    agency: string;
    account: string;
    accountType: 'checking' | 'savings';
    document: string;
    name: string;
  };
}

export interface WithdrawSimulateResponse {
  success: boolean;
  data: {
    amount: number;
    fee: number;
    netAmount: number;
    estimatedArrival: string;
  };
}

export interface WithdrawResponse {
  success: boolean;
  data: {
    transactionId: string;
    status: TransactionStatus;
    amount: number;
    fee: number;
    netAmount: number;
    estimatedArrival?: string;
  };
  message?: string;
}

// ============================================
// API Key Types
// ============================================

export interface APIKey {
  id: string;
  name: string;
  key: string;
  prefix: string;
  status: 'active' | 'revoked';
  permissions: string[];
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
  revokedAt?: string;
}

export interface APIKeyListResponse {
  success: boolean;
  data: APIKey[];
}

export interface CreateAPIKeyRequest {
  name: string;
  permissions?: string[];
  expiresIn?: number; // days
}

export interface CreateAPIKeyResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    key: string; // Only shown once
    createdAt: string;
  };
  message?: string;
}

// ============================================
// Webhook Types
// ============================================

export type WebhookEvent = 
  | 'deposit_completed' 
  | 'withdraw_completed' 
  | 'withdraw_failed' 
  | 'balance_updated';

export interface WebhookConfig {
  id: string;
  url: string;
  secret: string;
  events: WebhookEvent[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  lastTriggeredAt?: string;
  failureCount: number;
}

export interface WebhookListResponse {
  success: boolean;
  data: WebhookConfig[];
}

export interface CreateWebhookRequest {
  url: string;
  events: WebhookEvent[];
  secret?: string;
}

export interface UpdateWebhookRequest {
  url?: string;
  events?: WebhookEvent[];
  status?: 'active' | 'inactive';
}

export interface WebhookTestResponse {
  success: boolean;
  data: {
    sent: boolean;
    statusCode?: number;
    responseTime?: number;
    error?: string;
  };
}

// ============================================
// Error Types
// ============================================

export interface APIError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface ValidationError {
  success: false;
  error: {
    code: 'VALIDATION_ERROR';
    message: string;
    details: Record<string, string[]>;
  };
}

// ============================================
// Common Response Types
// ============================================

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface MessageResponse {
  success: boolean;
  message: string;
}
