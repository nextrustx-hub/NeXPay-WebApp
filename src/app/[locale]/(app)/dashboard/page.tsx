'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Sparkles,
  Shield,
  Zap,
} from 'lucide-react';
import { useBalance, useTransactions } from '@/hooks/use-auth';
import { useAuthStore } from '@/store/auth-store';
import type { Transaction, Balances } from '@/lib/api-types';

// Format currency
function formatCurrency(value: number, currency: string = 'BRL'): string {
  if (currency === 'BRL') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }
  if (currency === 'EUR') {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  }
  if (currency === 'USDT') {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`;
  }
  if (currency === 'BTC') {
    return `₿ ${value.toFixed(8)} BTC`;
  }
  return `${value} ${currency}`;
}

// Format date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Get status icon and color
function getStatusDisplay(status: string) {
  switch (status) {
    case 'completed':
      return {
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
        color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        label: 'Concluído',
      };
    case 'pending':
      return {
        icon: <Clock className="h-4 w-4 text-amber-400" />,
        color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        label: 'Pendente',
      };
    case 'processing':
      return {
        icon: <Loader2 className="h-4 w-4 text-cyan-400 animate-spin" />,
        color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
        label: 'Processando',
      };
    case 'failed':
    case 'cancelled':
      return {
        icon: <AlertCircle className="h-4 w-4 text-red-400" />,
        color: 'bg-red-500/20 text-red-400 border-red-500/30',
        label: status === 'failed' ? 'Falhou' : 'Cancelado',
      };
    default:
      return {
        icon: null,
        color: '',
        label: status,
      };
  }
}

// Transaction row skeleton
function TransactionRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 bg-white/10" />
          <Skeleton className="h-3 w-24 bg-white/10" />
        </div>
      </div>
      <div className="text-right space-y-2">
        <Skeleton className="h-4 w-20 bg-white/10" />
        <Skeleton className="h-3 w-16 bg-white/10" />
      </div>
    </div>
  );
}

// Empty state for transactions
function EmptyTransactions() {
  const t = useTranslations('dashboard');
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#00E6C3]/20 to-[#00FFD1]/10 flex items-center justify-center mb-4 border border-[#00E6C3]/20">
        <Wallet className="h-8 w-8 text-[#00E6C3]" />
      </div>
      <p className="text-white/60">{t('noTransactions') || 'Nenhuma transação encontrada'}</p>
      <p className="text-sm text-white/40 mt-1">Suas transações aparecerão aqui</p>
    </div>
  );
}

// KYC Banner Component
function KYCBanner() {
  const { user } = useAuthStore();

  // Only show if KYC is pending
  if (user?.kyc_status !== 'PENDING') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent p-4"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent" />
      
      <div className="relative flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/30">
          <Shield className="h-5 w-5 text-amber-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-amber-300">
            Verificação em Análise
          </h3>
          <p className="text-sm text-amber-200/70 mt-1">
            Sua conta está sob análise KYC. O seu limite operacional atual é de{' '}
            <span className="font-semibold text-amber-300">R$ 1.000,00</span>.
          </p>
        </div>
        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 border">
          Pendente
        </Badge>
      </div>
    </motion.div>
  );
}

// Balance Card Component
function BalanceCard({
  title,
  value,
  currency,
  icon,
  gradient,
  isLoading,
  delay = 0,
}: {
  title: string;
  value: number;
  currency: string;
  icon: React.ReactNode;
  gradient: string;
  isLoading: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card className={`relative overflow-hidden border-0 bg-gradient-to-br ${gradient} backdrop-blur-xl`}>
        {/* Gradient border effect */}
        <div className="absolute inset-0 rounded-lg border border-white/10" />
        
        {/* Glow effect */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#00FFFF]/10 rounded-full blur-3xl" />
        
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
          <CardTitle className="text-sm font-medium text-white/80">
            {title}
          </CardTitle>
          <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
            {icon}
          </div>
        </CardHeader>
        <CardContent className="relative">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-32 bg-white/10" />
              <Skeleton className="h-3 w-24 bg-white/10" />
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold text-white tracking-tight">
                {formatCurrency(value, currency)}
              </div>
              <p className="text-xs text-white/50 mt-1">
                Saldo disponível
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Recent Transaction Row
function TransactionRow({ transaction }: { transaction: Transaction }) {
  const t = useTranslations('transactions');
  const isDeposit = transaction.type === 'deposit';
  const statusDisplay = getStatusDisplay(transaction.status);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Depósito PIX';
      case 'withdraw':
        return 'Saque PIX';
      case 'swap':
        return 'Troca de Moeda';
      default:
        return type;
    }
  };

  const amount = parseFloat(transaction.amount_from) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 hover:border-[#00E6C3]/30"
    >
      <div className="flex items-center gap-3">
        <div
          className={`h-10 w-10 rounded-full flex items-center justify-center border ${
            isDeposit
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}
        >
          {isDeposit ? (
            <ArrowDownCircle className="h-5 w-5 text-emerald-400" />
          ) : (
            <ArrowUpCircle className="h-5 w-5 text-red-400" />
          )}
        </div>
        <div>
          <p className="font-medium text-white">
            {getTypeLabel(transaction.type)}
          </p>
          <p className="text-sm text-white/50">
            {formatDate(transaction.created_at)}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p
          className={`font-medium ${
            isDeposit ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          {isDeposit ? '+' : '-'}{formatCurrency(amount, transaction.currency_from)}
        </p>
        <Badge variant="outline" className={`text-xs mt-1 ${statusDisplay.color}`}>
          <span className="flex items-center gap-1">
            {statusDisplay.icon}
            {statusDisplay.label}
          </span>
        </Badge>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const locale = currentPath.split('/')[1] || 'pt-BR';
  
  // API hooks
  const { balance, isLoading: isLoadingBalance, isFetching: isFetchingBalance, refetch: refetchBalance, error: balanceError } = useBalance();
  const { transactions, isLoading: isLoadingTransactions, isFetching: isFetchingTransactions, refetch: refetchTransactions, error: transactionsError } = useTransactions({ limit: 5 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Extract balance values
  const brlBalance = balance?.BRL ?? 0;
  const eurBalance = balance?.EUR ?? 0;
  const usdtBalance = balance?.USDT ?? 0;
  const btcBalance = balance?.BTC ?? 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Title - Gateway NeXPay */}
      <motion.div variants={itemVariants} className="relative">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#00E6C3] to-[#00FFD1] flex items-center justify-center shadow-lg shadow-[#00E6C3]/20">
            <Sparkles className="h-5 w-5 text-[#0D0D0D]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Gateway NeXPay
            </h1>
            <p className="text-white/50 text-sm">
              Seu hub de pagamentos digitais
            </p>
          </div>
        </div>
        
        {/* Decorative gradient line */}
        <div className="h-px bg-gradient-to-r from-[#00E6C3] via-[#00FFD1] to-transparent mt-4" />
      </motion.div>

      {/* KYC Banner */}
      <motion.div variants={itemVariants}>
        <KYCBanner />
      </motion.div>

      {/* Error State for Balance */}
      {balanceError && (
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-xl border border-red-500/30 bg-red-500/10"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-red-300">Erro ao carregar saldo</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetchBalance()}
              className="ml-auto text-red-300 hover:text-red-200 hover:bg-red-500/10"
            >
              Tentar novamente
            </Button>
          </div>
        </motion.div>
      )}

      {/* Balance Cards */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* BRL Balance Card */}
        <BalanceCard
          title="Saldo BRL"
          value={brlBalance}
          currency="BRL"
          icon={<span className="text-lg font-bold text-[#00E6C3]">R$</span>}
          gradient="from-[#121212] to-[#0D0D0D]"
          isLoading={isLoadingBalance}
          delay={0}
        />
        
        {/* EUR Balance Card */}
        <BalanceCard
          title="Saldo EUR"
          value={eurBalance}
          currency="EUR"
          icon={<span className="text-lg font-bold text-[#00E6C3]">€</span>}
          gradient="from-[#121212] to-[#0D0D0D]"
          isLoading={isLoadingBalance}
          delay={0.1}
        />
        
        {/* USDT Balance Card */}
        <BalanceCard
          title="Saldo USDT"
          value={usdtBalance}
          currency="USDT"
          icon={<span className="text-sm font-bold text-[#00E6C3]">₮</span>}
          gradient="from-[#121212] to-[#0D0D0D]"
          isLoading={isLoadingBalance}
          delay={0.2}
        />
        
        {/* BTC Balance Card */}
        <BalanceCard
          title="Saldo BTC"
          value={btcBalance}
          currency="BTC"
          icon={<span className="text-sm font-bold text-[#00E6C3]">₿</span>}
          gradient="from-[#121212] to-[#0D0D0D]"
          isLoading={isLoadingBalance}
          delay={0.3}
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#121212] to-[#0D0D0D]">
          {/* Gradient border */}
          <div className="absolute inset-0 rounded-lg border border-white/10" />
          
          {/* Glow effect */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#00E6C3]/5 rounded-full blur-3xl" />
          
          <CardHeader className="relative">
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#00E6C3]" />
              {t('quickActions')}
            </CardTitle>
            <CardDescription className="text-white/50">
              Operações rápidas ao seu alcance
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => router.push(`/${locale}/deposit`)}
                className="bg-gradient-to-r from-[#00E6C3] to-[#00FFD1] hover:from-[#00E6C3]/90 hover:to-[#00FFD1]/90 text-[#0D0D0D] font-semibold shadow-lg shadow-[#00E6C3]/20 hover:shadow-[#00E6C3]/30 transition-all duration-200"
              >
                <ArrowDownCircle className="mr-2 h-4 w-4" />
                {t('deposit')}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/${locale}/withdraw`)}
                className="border-white/20 text-white hover:bg-white/10 hover:border-[#00E6C3]/30 transition-all duration-200"
              >
                <ArrowUpCircle className="mr-2 h-4 w-4" />
                {t('withdraw')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#121212] to-[#0D0D0D]">
          {/* Gradient border */}
          <div className="absolute inset-0 rounded-lg border border-white/10" />
          
          {/* Glow effect */}
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#00FFFF]/5 rounded-full blur-3xl" />
          
          <CardHeader className="flex flex-row items-center justify-between relative">
            <div>
              <CardTitle className="text-white">{t('recentTransactions')}</CardTitle>
              <CardDescription className="text-white/50">Sua atividade mais recente</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isFetchingTransactions && (
                <RefreshCw className="h-3 w-3 animate-spin text-[#00E6C3]" />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/${locale}/transactions`)}
                className="text-[#00E6C3] hover:text-[#00FFD1] hover:bg-[#00E6C3]/10"
              >
                {t('viewAll')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {isLoadingTransactions ? (
                // Loading skeletons
                <>
                  <TransactionRowSkeleton />
                  <TransactionRowSkeleton />
                  <TransactionRowSkeleton />
                </>
              ) : transactionsError ? (
                // Error state
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                    <AlertCircle className="h-6 w-6 text-red-400" />
                  </div>
                  <p className="text-white/60">Erro ao carregar transações</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 border-white/20 text-white hover:bg-white/10"
                    onClick={() => refetchTransactions()}
                  >
                    Tentar novamente
                  </Button>
                </div>
              ) : transactions.length === 0 ? (
                // Empty state
                <EmptyTransactions />
              ) : (
                // Transaction list
                transactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TransactionRow transaction={transaction} />
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats/Info Cards */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-3">
        {/* Total Transactions */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#121212] to-[#0D0D0D]">
          <div className="absolute inset-0 rounded-lg border border-white/10" />
          <CardContent className="relative p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#00E6C3]/20 to-[#00FFD1]/10 flex items-center justify-center border border-[#00E6C3]/20">
                <TrendingUp className="h-5 w-5 text-[#00E6C3]" />
              </div>
              <div>
                <p className="text-sm text-white/50">Transações Hoje</p>
                <p className="text-xl font-bold text-white">
                  {isLoadingTransactions ? (
                    <Skeleton className="h-6 w-12 bg-white/10" />
                  ) : (
                    transactions.length
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Status */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#121212] to-[#0D0D0D]">
          <div className="absolute inset-0 rounded-lg border border-white/10" />
          <CardContent className="relative p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <Shield className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-white/50">Status de Segurança</p>
                <p className="text-xl font-bold text-emerald-400">Protegido</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Tier */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#121212] to-[#0D0D0D]">
          <div className="absolute inset-0 rounded-lg border border-white/10" />
          <CardContent className="relative p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#00E6C3]/20 to-[#00FFD1]/10 flex items-center justify-center border border-[#00E6C3]/20">
                <Sparkles className="h-5 w-5 text-[#00E6C3]" />
              </div>
              <div>
                <p className="text-sm text-white/50">Sua Conta</p>
                <p className="text-xl font-bold text-white">Ativa</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
