'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
} from 'lucide-react';
import { useBalance, useTransactions } from '@/hooks/use-auth';
import { useAuthStore } from '@/store/auth-store';
import { BalanceCard } from '@/components/dashboard/balance-card';
import type { Transaction } from '@/lib/api-types';

// Format BRL currency
function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
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
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
        color: 'bg-emerald-500/10 text-emerald-600',
        label: 'Concluído',
      };
    case 'pending':
      return {
        icon: <Clock className="h-4 w-4 text-amber-500" />,
        color: 'bg-amber-500/10 text-amber-600',
        label: 'Pendente',
      };
    case 'processing':
      return {
        icon: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />,
        color: 'bg-blue-500/10 text-blue-600',
        label: 'Processando',
      };
    case 'failed':
      return {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
        color: 'bg-red-500/10 text-red-600',
        label: 'Falhou',
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
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="text-right space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

// Empty state for transactions
function EmptyTransactions() {
  const t = useTranslations('dashboard');
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <Wallet className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground">{t('noTransactions') || 'Nenhuma transação encontrada'}</p>
    </div>
  );
}

// KYC Banner Component
function KYCBanner() {
  const t = useTranslations('dashboard');
  const { user } = useAuthStore();

  // Only show if KYC is pending
  if (user?.status !== 'pending_verification') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4"
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-amber-800 dark:text-amber-200">
            Verificação em Análise
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
            Sua conta está sob análise KYC. O seu limite operacional atual é de{' '}
            <span className="font-semibold">R$ 1.000,00</span>.
          </p>
        </div>
        <Badge variant="outline" className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700">
          Pendente
        </Badge>
      </div>
    </motion.div>
  );
}

// Recent Transaction Row
function TransactionRow({ transaction }: { transaction: Transaction }) {
  const t = useTranslations('transactions');
  const isDeposit = transaction.type === 'deposit' || transaction.type === 'pix_received';
  const statusDisplay = getStatusDisplay(transaction.status);

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
      <div className="flex items-center gap-3">
        <div
          className={`h-10 w-10 rounded-full flex items-center justify-center ${
            isDeposit ? 'bg-emerald-500/10' : 'bg-red-500/10'
          }`}
        >
          {isDeposit ? (
            <ArrowDownCircle className="h-5 w-5 text-emerald-500" />
          ) : (
            <ArrowUpCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
        <div>
          <p className="font-medium">
            {transaction.type === 'deposit' && 'Depósito PIX'}
            {transaction.type === 'withdraw' && 'Saque PIX'}
            {transaction.type === 'pix_received' && 'PIX Recebido'}
            {transaction.type === 'pix_sent' && 'PIX Enviado'}
            {transaction.type === 'transfer' && 'Transferência'}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatDate(transaction.createdAt)}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p
          className={`font-medium ${
            isDeposit ? 'text-emerald-500' : 'text-red-500'
          }`}
        >
          {isDeposit ? '+' : '-'}{formatBRL(transaction.amount)}
        </p>
        <Badge variant="secondary" className={`text-xs ${statusDisplay.color}`}>
          <span className="flex items-center gap-1">
            {statusDisplay.icon}
            {t(`status.${transaction.status}`)}
          </span>
        </Badge>
      </div>
    </div>
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

  // Calculate totals
  const totalBalance = balance ? balance.available + balance.pending : 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Title */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('welcome')}</p>
      </motion.div>

      {/* KYC Banner */}
      <motion.div variants={itemVariants}>
        <KYCBanner />
      </motion.div>

      {/* Balance Cards */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-3">
        {/* Total Balance Card */}
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('totalBalance')}
            </CardTitle>
            <div className="flex items-center gap-2">
              {isFetchingBalance && (
                <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
              )}
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingBalance ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            ) : balanceError ? (
              <div className="text-sm text-red-500">
                Erro ao carregar saldo
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatBRL(totalBalance)}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-500">{t('lastUpdate')}: {balance?.lastUpdated ? formatDate(balance.lastUpdated) : '-'}</span>
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Available Balance Card */}
        <Card className="border-l-4 border-l-teal-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('availableBalance')}
            </CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingBalance ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatBRL(balance?.available ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">Disponível para saque</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pending Balance Card */}
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('pendingBalance')}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingBalance ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatBRL(balance?.pending ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">Processando</p>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>{t('quickActions')}</CardTitle>
            <CardDescription>Operações rápidas ao seu alcance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => router.push(`/${locale}/deposit`)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                <ArrowDownCircle className="mr-2 h-4 w-4" />
                {t('deposit')}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/${locale}/withdraw`)}
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t('recentTransactions')}</CardTitle>
              <CardDescription>Sua atividade mais recente</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isFetchingTransactions && (
                <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/${locale}/transactions`)}
              >
                {t('viewAll')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
                  <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                  <p className="text-muted-foreground">Erro ao carregar transações</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
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
                transactions.map((transaction) => (
                  <TransactionRow key={transaction.id} transaction={transaction} />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
