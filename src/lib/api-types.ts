// ============================================
// NeXPay API Types - Backend V2 Contract
// ============================================

// ============================================
// User & Authentication Types
// ============================================

export type Tier = 'WHITE' | 'BLACK';
export type KycStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  name: string;
  cpf?: string;
  role: Tier;
  kyc_status: KycStatus;
  webhook_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  success: boolean;
  access_token: string;
  tier: Tier;
  user?: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  tier?: Tier;
}

export interface MeResponse {
  success: boolean;
  data: {
    user: User;
  };
}

// ============================================
// Wallet & Balance Types
// ============================================

export interface Balances {
  BRL: number;
  EUR: number;
  USDT: number;
  BTC: number;
}

export interface BalanceResponse {
  success: boolean;
  balances: Balances;
}

// ============================================
// Transaction Types
// ============================================

export type TransactionType = 'deposit' | 'withdraw' | 'swap';
export type TransactionMethod = 'pix' | 'bank_transfer' | 'crypto';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'processing';

export interface Transaction {
  id: string;
  type: TransactionType;
  method: TransactionMethod;
  currency_from: string;
  amount_from: string;
  currency_to?: string;
  amount_to?: string;
  status: TransactionStatus;
  created_at: string;
  updated_at?: string;
  pix_key?: string;
  description?: string;
}

export interface TransactionListResponse {
  success: boolean;
  data: {
    transactions: Transaction[];
  };
}

export interface TransactionsQueryParams {
  limit?: number;
  type?: TransactionType;
}

// ============================================
// Deposit Types
// ============================================

export interface DepositRequest {
  amount: number;
  currency: 'BRL';
}

export interface DepositResponse {
  success: boolean;
  type: 'PIX_DYNAMIC';
  qr_code: string;       // Base64 QR Code
  copy_paste: string;    // PIX code
  transactionId: string;
}

export interface DepositStatusResponse {
  success: boolean;
  data: {
    status: 'pending' | 'completed';
  };
}

// ============================================
// Withdraw Types
// ============================================

export interface WithdrawRequest {
  amount: number;
  currency: 'BRL';
  pix_key: string;
}

export interface WithdrawResponse {
  success: boolean;
  transactionId: string;
  message: string;
}

// ============================================
// Swap Types
// ============================================

export interface SwapRequest {
  from: 'BRL' | 'EUR' | 'USDT' | 'BTC';
  to: 'BRL' | 'EUR' | 'USDT' | 'BTC';
  amount: number;
}

export interface SwapResponse {
  success: boolean;
  from_amount: number;
  to_amount: number;
  fee_applied: string;
  transaction_id: string;
}

// ============================================
// API Key Types (B2B)
// ============================================

export interface APIKey {
  id: string;
  key: string;           // Masked: sk_live_...1234
  is_active: boolean;
  created_at?: string;
  last_used_at?: string;
}

export interface APIKeyListResponse {
  success: boolean;
  data: APIKey[];
}

export interface CreateAPIKeyResponse {
  success: boolean;
  data: {
    key: string;         // Full key shown only once: sk_live_xyz...
    id: string;
  };
}

// ============================================
// Webhook Types (B2B)
// ============================================

export interface WebhookConfigRequest {
  webhook_url: string;
}

export interface WebhookConfigResponse {
  success: boolean;
  webhook_url: string;
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

// ============================================
// Common Types
// ============================================

export interface MessageResponse {
  success: boolean;
  message: string;
}
