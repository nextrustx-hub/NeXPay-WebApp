# NeXPay - Documentação Técnica Completa

## 📋 Visão Geral

**NeXPay** é uma plataforma de conta digital institucional moderna para clientes fiduciários (BRL), operando exclusivamente com PIX e oferecendo integrações B2B via API. A plataforma foi projetada para transmitir confiança bancária premium, com UX comparável a Revolut, Wise e Stripe Dashboard.

---

## 🏗️ Arquitetura do Sistema

### Stack Tecnológica

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| Next.js | 16.x | Framework React com App Router |
| TypeScript | 5.x | Tipagem estática |
| Tailwind CSS | 4.x | Styling utility-first |
| shadcn/ui | Latest | Componentes UI |
| Zustand | Latest | Estado global |
| React Query (TanStack) | Latest | Cache e estado servidor |
| Axios | Latest | Cliente HTTP |
| Framer Motion | Latest | Animações |
| next-intl | Latest | Internacionalização |
| next-themes | Latest | Tema light/dark |
| Prisma | Latest | ORM para SQLite |
| Zod | Latest | Validação de schemas |

### Estrutura de Diretórios

```
src/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # Rotas internacionalizadas
│   │   ├── (auth)/               # Grupo de rotas de autenticação
│   │   │   ├── login/            # Página de login
│   │   │   ├── register/         # Página de registro
│   │   │   └── layout.tsx        # Layout autenticação
│   │   ├── (app)/                # Grupo de rotas protegidas
│   │   │   ├── dashboard/        # Dashboard principal
│   │   │   ├── deposit/          # Depósito PIX
│   │   │   ├── withdraw/         # Saque PIX
│   │   │   ├── transactions/     # Extrato/Histórico
│   │   │   ├── api-integrations/ # API & Integrações B2B
│   │   │   ├── profile/          # Perfil do usuário
│   │   │   ├── settings/         # Configurações
│   │   │   └── layout.tsx        # Layout app (sidebar)
│   │   ├── layout.tsx            # Layout raiz locale
│   │   └── page.tsx              # Landing page
│   ├── api/                      # API routes (se necessário)
│   ├── layout.tsx                # Layout raiz
│   └── globals.css               # Estilos globais
├── components/
│   ├── ui/                       # Componentes shadcn/ui
│   ├── layout/                   # Componentes de layout
│   │   ├── app-sidebar.tsx       # Sidebar desktop
│   │   ├── header.tsx            # Header com tema/idioma
│   │   └── mobile-drawer.tsx     # Drawer mobile
│   ├── dashboard/                # Componentes dashboard
│   │   ├── balance-card.tsx      # Card de saldo
│   │   ├── kyc-banner.tsx        # Banner KYC
│   │   ├── quick-actions.tsx     # Ações rápidas
│   │   └── recent-transactions.tsx
│   ├── deposit/                  # Componentes depósito
│   │   ├── amount-input.tsx
│   │   ├── qr-code-display.tsx
│   │   └── status-tracker.tsx
│   ├── withdraw/                 # Componentes saque
│   │   ├── amount-input.tsx
│   │   ├── pix-key-input.tsx
│   │   ├── fee-preview.tsx
│   │   └── confirmation.tsx
│   └── transactions/             # Componentes transações
│       ├── transaction-table.tsx
│       ├── transaction-row.tsx
│       ├── filter-bar.tsx
│       └── loading-skeleton.tsx
├── hooks/                        # Custom hooks
│   ├── use-auth.ts               # Hook de autenticação
│   ├── use-mobile.ts             # Detecção mobile
│   └── use-toast.ts              # Notificações toast
├── lib/
│   ├── axios.ts                  # Cliente Axios configurado
│   ├── api-types.ts              # Tipos TypeScript da API
│   ├── db.ts                     # Cliente Prisma
│   └── utils.ts                  # Utilitários
├── store/
│   └── auth-store.ts             # Zustand store (auth + theme)
├── providers/
│   └── providers.tsx             # Providers wrapper
├── i18n/
│   ├── request.ts                # Configuração next-intl
│   └── routing.ts                # Routing internacionalizado
└── messages/                     # Traduções
    ├── pt-BR.json                # Português Brasil
    ├── en.json                   # English
    ├── fr.json                   # Français
    └── es.json                   # Español
```

---

## 🌐 API Backend

### Base URL
```
https://api-wallet.nextrustx.com/api/v1
```

### Autenticação
Todas as requisições autenticadas requerem header:
```
Authorization: Bearer <token>
```

### Endpoints Implementados

#### 🔐 Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/auth/register` | Registrar novo usuário (tier: WHITE) |
| POST | `/auth/login` | Autenticar usuário |
| POST | `/auth/logout` | Encerrar sessão |
| GET | `/auth/me` | Obter dados do usuário |
| POST | `/auth/change-password` | Alterar senha |

**Payload de Registro:**
```typescript
{
  fullName: string;
  cpf: string;           // 11 dígitos
  birthDate: string;     // YYYY-MM-DD
  email: string;
  password: string;
  tier: 'WHITE';         // Sempre WHITE para conta standard
}
```

**Resposta de Autenticação:**
```typescript
{
  success: boolean;
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      name: string;
      phone?: string;
      document?: string;
      status: 'active' | 'inactive' | 'pending_verification' | 'suspended';
      kycLevel: 'none' | 'basic' | 'advanced';
      createdAt: string;
      updatedAt: string;
    };
    refreshToken?: string;
    expiresIn?: number;
  };
}
```

#### 💰 Wallet / Saldo

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/wallet/balance` | Obter saldo atual |

**Resposta:**
```typescript
{
  success: boolean;
  data: {
    available: number;   // Saldo disponível
    pending: number;     // Saldo pendente
    frozen: number;      // Saldo bloqueado
    currency: string;    // "BRL"
    lastUpdated: string;
  };
}
```

#### 📥 Depósito PIX

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/wallet/deposit/fiat` | Criar depósito PIX |
| GET | `/wallet/deposit/status/:id` | Status do depósito |

**Payload de Depósito:**
```typescript
{
  amount: number;
  currency: 'BRL';
}
```

**Resposta:**
```typescript
{
  success: boolean;
  data: {
    transactionId: string;
    pixCode: string;      // Código copia e cola
    pixQrCode?: string;   // Base64 QR Code
    amount: number;
    expiresAt: string;
  };
}
```

#### 📤 Saque PIX

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/quotes/simulate` | Simular taxas de saque |
| POST | `/wallet/withdraw/fiat` | Executar saque |

**Payload de Simulação:**
```
GET /quotes/simulate?type=withdraw&amount=1000&currencyFiat=BRL
```

**Resposta da Simulação:**
```typescript
{
  requestedAmount: number;
  fee: number;
  netAmount: number;
  currency: string;
}
```

**Payload de Saque:**
```typescript
{
  amount: number;
  currency: 'BRL';
  pixKey: string;
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
}
```

#### 📜 Transações

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/transactions` | Listar transações |
| GET | `/transactions/:id` | Detalhes da transação |

**Query Parameters:**
```
?page=1&limit=10&type=deposit&status=completed&startDate=2024-01-01&endDate=2024-12-31&sortBy=createdAt&sortOrder=desc
```

#### 🔑 API Keys (B2B)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/b2b/api-keys` | Listar chaves API |
| POST | `/b2b/api-keys/generate` | Gerar nova chave |
| DELETE | `/b2b/api-keys/:id` | Revogar chave |

**Payload de Geração:**
```typescript
{
  name: string;
  permissions?: string[];
  expiresIn?: number;  // dias
}
```

#### 🔗 Webhooks (B2B)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/b2b/webhooks` | Listar webhooks |
| POST | `/b2b/webhooks/config` | Configurar webhook |
| PUT | `/b2b/webhooks/:id` | Atualizar webhook |
| DELETE | `/b2b/webhooks/:id` | Remover webhook |
| POST | `/b2b/webhooks/:id/test` | Testar webhook |

**Payload de Webhook:**
```typescript
{
  webhook_url: string;
  events: ('deposit_completed' | 'withdraw_completed' | 'withdraw_failed' | 'balance_updated')[];
  secret?: string;
}
```

---

## 🎨 Design System

### Tema Visual

#### Light Mode (Predominante)
- **Fundo**: off-white / cinza muito claro (`bg-background`)
- **Cards**: brancos com sombra suave
- **Bordas**: subtis (`border-border`)
- **Texto escuro**: elegante (`text-foreground`)
- **Acentos**: 
  - Verde confiança (`emerald-500`)
  - Verde confirmação (`teal-600`)
  - Âmbar para pendentes (`amber-500`)

#### Dark Mode (Alternativo)
- **Fundo**: carvão / navy escuro
- **Painéis**: escuros com contraste limpo
- **Premium, sóbrio, moderno**

### Paleta de Cores

```css
/* Cores principais */
--primary: emerald-500;        /* Ações principais */
--primary-hover: emerald-600;
--secondary: teal-600;        /* Gradientes */
--accent: amber-500;          /* Alertas/pendentes */
--success: emerald-500;
--warning: amber-500;
--error: red-500;
--info: blue-500;

/* Gradientes */
--gradient-primary: from-emerald-500 to-teal-600;
```

### Tipografia

```css
/* Hierarquia */
text-3xl font-bold     /* Títulos principais */
text-2xl font-bold     /* Títulos de página */
text-xl font-semibold  /* Subtítulos */
text-lg font-medium    /* Headers de card */
text-base              /* Texto corpo */
text-sm                /* Texto secundário */
text-xs                /* Labels, badges */
```

### Componentes UI (shadcn/ui)

| Componente | Uso |
|------------|-----|
| Button | CTAs, ações |
| Card | Containers de conteúdo |
| Input | Campos de formulário |
| Select | Dropdowns, filtros |
| Badge | Status, labels |
| Dialog | Modais |
| Sheet | Drawers |
| Skeleton | Loading states |
| Toast/Sonner | Notificações |
| Avatar | Perfil usuário |
| Switch | Toggle configurações |
| Tabs | Navegação interna |
| Form | Formulários com validação |

### Animações (Framer Motion)

```typescript
// Variantes padrão
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Princípios:
// - Rápidas (< 300ms)
// - Elegantes e discretas
// - Sem animações infantis
// - Hover subtil
// - Feedback imediato
```

---

## 🔐 Fluxo de Autenticação

### Registro
1. Usuário preenche: Nome, CPF, Data Nascimento, Email, Senha
2. Validações frontend:
   - CPF válido (algoritmo brasileiro)
   - Maior de 18 anos
   - Email válido
   - Senha mínima 8 caracteres
   - Força da senha exibida
3. Payload enviado com `tier: "WHITE"`
4. Token armazenado no Zustand + localStorage
5. Redirecionamento para Dashboard

### Login
1. Usuário informa Email + Senha
2. Validação frontend
3. Requisição POST `/auth/login`
4. Token armazenado no Zustand (persistido)
5. Redirecionamento para Dashboard

### Logout
1. Requisição POST `/auth/logout` (opcional)
2. Limpeza do Zustand store
3. Redirecionamento para Login

### Proteção de Rotas
- Middleware verifica token
- Interceptor Axios injeta Bearer token
- 401/403 redireciona para login
- Sessão expirada detectada automaticamente

---

## 🌍 Internacionalização

### Idiomas Suportados
- **pt-BR**: Português Brasil (padrão)
- **en**: English
- **fr**: Français
- **es**: Español

### Estrutura de URLs
```
/pt-BR/dashboard
/en/dashboard
/fr/dashboard
/es/dashboard
```

### Uso de Traduções
```typescript
import { useTranslations } from 'next-intl';

const t = useTranslations('dashboard');
<h1>{t('title')}</h1>
```

### Arquivos de Mensagens
Cada idioma tem arquivo JSON completo em `/src/messages/`:
- `pt-BR.json`
- `en.json`
- `fr.json`
- `es.json`

---

## 📱 Responsividade

### Breakpoints (Tailwind)
```css
sm: 640px    /* Mobile landscape */
md: 768px    /* Tablet */
lg: 1024px   /* Desktop */
xl: 1280px   /* Large desktop */
```

### Adaptações por Dispositivo

#### Desktop (>= 1024px)
- Sidebar fixa colapsável
- Header com todas as ações
- Tabelas completas
- Cards lado a lado

#### Tablet (768px - 1023px)
- Sidebar recolhida por padrão
- Layout adaptado
- Tabelas com scroll horizontal

#### Mobile (< 768px)
- Drawer lateral (hamburger menu)
- Cards em coluna única
- Formulários full-width
- Botões touch-friendly (min 44px)

---

## 🔄 Estado Global (Zustand)

### Auth Store
```typescript
interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}
```

### Theme Store
```typescript
interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
}

interface ThemeActions {
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}
```

### Persistência
- localStorage para auth e theme
- Selectores otimizados para performance

---

## 🎯 Funcionalidades por Página

### Dashboard
- **Saldo disponível** (API: `/wallet/balance`)
- **Saldo pendente** (API: `/wallet/balance`)
- **Ações rápidas**: Depósito / Saque
- **Últimas transações** (API: `/transactions?limit=5`)
- **Banner KYC** (se status === 'PENDING')

### Depósito PIX
1. Input de valor (mín: R$ 10)
2. Geração de QR Code (API: `/wallet/deposit/fiat`)
3. Exibição do código copia e cola
4. Polling de status (API: `/wallet/deposit/status/:id`)
5. Confirmação visual

### Saque PIX
1. Input de valor (mín: R$ 20)
2. Seleção de tipo de chave PIX
3. Input da chave PIX
4. Simulação de taxas (API: `/quotes/simulate`)
5. Preview de fees e valor líquido
6. Confirmação e execução (API: `/wallet/withdraw/fiat`)

### Extrato/Transações
- Filtros por: tipo, status, período
- Tabela paginada (API: `/transactions`)
- Detalhes em modal
- Badges de status coloridos
- Download de comprovante (futuro)

### API & Integrações (B2B)
- **API Keys**:
  - Listar chaves (API: `/b2b/api-keys`)
  - Gerar nova chave (API: `/b2b/api-keys/generate`)
  - Revogar chave (API: `/b2b/api-keys/:id`)
  - Chave exibida apenas uma vez
- **Webhooks**:
  - Listar webhooks (API: `/b2b/webhooks`)
  - Configurar URL (API: `/b2b/webhooks/config`)
  - Testar webhook (API: `/b2b/webhooks/:id/test`)
  - Seleção de eventos

### Perfil
- Informações pessoais (API: `/auth/me`)
- Avatar com iniciais
- Atualização de dados
- Status de verificação KYC

### Configurações
- Idioma
- Fuso horário
- Tema (light/dark/system)
- Autenticação 2FA (preparado)
- Alteração de senha (preparado)
- Gerenciamento de sessões (preparado)
- Exclusão de conta

---

## ⚠️ Regras Críticas (REGRA ZERO)

### PROIBIDO
- ❌ Mock data
- ❌ Arrays estáticos simulando histórico
- ❌ Cálculos financeiros fictícios no frontend
- ❌ Números hardcoded para saldos, extratos, taxas

### OBRIGATÓRIO
- ✅ Dados consumidos via API
- ✅ Skeleton loaders durante carregamento
- ✅ Estados vazios elegantes
- ✅ Mensagens de erro institucionais
- ✅ Componentes preparados para dados reais

---

## 📊 Tipos TypeScript

### User
```typescript
interface User {
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
```

### Balance
```typescript
interface Balance {
  available: number;
  pending: number;
  frozen: number;
  currency: string;
  lastUpdated: string;
}
```

### Transaction
```typescript
interface Transaction {
  id: string;
  walletId: string;
  type: 'deposit' | 'withdraw' | 'transfer' | 'pix_received' | 'pix_sent';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
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
```

### API Key
```typescript
interface APIKey {
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
```

### Webhook
```typescript
interface WebhookConfig {
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

type WebhookEvent = 
  | 'deposit_completed' 
  | 'withdraw_completed' 
  | 'withdraw_failed' 
  | 'balance_updated';
```

---

## 🚀 Performance

### Otimizações Aplicadas
- Lazy loading de componentes pesados
- Skeleton loaders em vez de spinners
- Cache React Query (staleTime: 30s)
- Seletores Zustand otimizados
- Animações com GPU (transform)
- Imagens otimizadas automaticamente

### Métricas Alvo
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1

---

## 🔒 Segurança

### Frontend
- Tokens JWT em localStorage (httpOnly recomendado no futuro)
- Interceptores para 401/403
- Logout automático em sessão expirada
- Validação de inputs com Zod
- Sanitização de dados de formulário

### API
- HTTPS obrigatório
- Bearer token authentication
- Rate limiting (backend)
- CORS configurado

---

## 📝 Notas de Implementação

### Status Atual do Projeto

#### ✅ Implementado e Operacional
1. Estrutura Next.js 16 com App Router
2. Sistema de internacionalização (4 idiomas)
3. Tema Light/Dark com persistência
4. Layout responsivo (desktop/mobile)
5. Sidebar colapsável + drawer mobile
6. Autenticação conectada à API
7. Registro com validação completa (CPF, idade, etc.)
8. Depósito PIX com QR Code e polling
9. Saque PIX com simulação de taxas
10. Componentes UI shadcn/ui completos
11. Zustand store para auth e theme
12. Axios com interceptors
13. React Query para cache

#### ✅ Correções Realizadas (Janeiro 2025)
1. **Dashboard**: ✅ Corrigido - agora usa `useBalance` e `useTransactions` hooks
2. **Transações**: ✅ Corrigido - agora usa `useTransactions` hook com filtros e paginação
3. **API & Integrações**: ✅ Corrigido - conectado aos endpoints B2B reais
4. **KYC Banner**: ✅ Implementado - exibido quando `user.status === 'pending_verification'`

#### 🔮 Preparado para Futuro
1. 2FA (interface pronta)
2. Alteração de senha (interface pronta)
3. Gerenciamento de sessões
4. Upload de documentos KYC

---

## 🚀 Deploy no Vercel

### Variáveis de Ambiente Obrigatórias

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `NEXT_PUBLIC_API_URL` | `https://api-wallet.nextrustx.com/api/v1` | URL base da API backend |

### Variáveis Opcionais

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `NEXTAUTH_SECRET` | `(gerar com openssl rand -base64 32)` | Secret para NextAuth.js |
| `NEXTAUTH_URL` | `https://app.nextrustx.com` | URL da aplicação em produção |

### Domínio de Produção
- **URL**: https://app.nextrustx.com
- **API**: https://api-wallet.nextrustx.com/api/v1

### Passos para Deploy

1. Importar repositório no Vercel: `nextrustx-hub/NeXPay-WebApp`
2. Configurar variáveis de ambiente
3. Deploy automático

---

*Documentação gerada em: Janeiro 2025*  
*Versão do documento: 2.0*  
*Repositório: https://github.com/nextrustx-hub/NeXPay-WebApp*
