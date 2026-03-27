'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowDownCircle, ArrowUpCircle, Clock, CheckCircle, XCircle, Loader2, ChevronRight, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/i18n/routing';
import type { Transaction, TransactionType, TransactionStatus } from '@/lib/api-types';

// Format BRL currency
function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// Transaction type icon and color
function getTransactionTypeInfo(type: TransactionType) {
  switch (type) {
    case 'deposit':
    case 'pix_received':
      return {
        icon: ArrowDownCircle,
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        amountColor: 'text-emerald-600 dark:text-emerald-400',
        prefix: '+',
      };
    case 'withdraw':
    case 'pix_sent':
      return {
        icon: ArrowUpCircle,
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        iconColor: 'text-red-600 dark:text-red-400',
        amountColor: 'text-red-600 dark:text-red-400',
        prefix: '-',
      };
    case 'transfer':
      return {
        icon: ArrowUpCircle,
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        iconColor: 'text-blue-600 dark:text-blue-400',
        amountColor: 'text-blue-600 dark:text-blue-400',
        prefix: '-',
      };
    default:
      return {
        icon: ArrowDownCircle,
        bgColor: 'bg-gray-100 dark:bg-gray-900/30',
        iconColor: 'text-gray-600 dark:text-gray-400',
        amountColor: 'text-gray-600 dark:text-gray-400',
        prefix: '',
      };
  }
}

// Transaction status config
function getStatusConfig(status: TransactionStatus) {
  switch (status) {
    case 'completed':
      return {
        icon: CheckCircle,
        label: 'Concluído',
        variant: 'default' as const,
        className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      };
    case 'pending':
      return {
        icon: Clock,
        label: 'Pendente',
        variant: 'secondary' as const,
        className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      };
    case 'processing':
      return {
        icon: Loader2,
        label: 'Processando',
        variant: 'secondary' as const,
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      };
    case 'failed':
      return {
        icon: XCircle,
        label: 'Falhou',
        variant: 'destructive' as const,
        className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      };
    case 'cancelled':
      return {
        icon: XCircle,
        label: 'Cancelado',
        variant: 'outline' as const,
        className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      };
    default:
      return {
        icon: Clock,
        label: status,
        variant: 'secondary' as const,
        className: '',
      };
  }
}

// Skeleton loader for transaction list
function TransactionSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="space-y-2 text-right">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Empty state for transactions
function TransactionsEmpty() {
  const t = useTranslations('transactions');

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Transações recentes</CardTitle>
        <CardDescription>Suas últimas atividades</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">
            {t('noTransactions')}
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/deposit">
              Fazer primeiro depósito
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Single transaction item
function TransactionItem({ transaction }: { transaction: Transaction }) {
  const typeInfo = getTransactionTypeInfo(transaction.type);
  const statusConfig = getStatusConfig(transaction.status);
  const Icon = typeInfo.icon;
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-full ${typeInfo.bgColor} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${typeInfo.iconColor}`} />
        </div>
        <div>
          <p className="font-medium text-sm">
            {transaction.type === 'deposit' && 'Depósito via PIX'}
            {transaction.type === 'withdraw' && 'Saque via PIX'}
            {transaction.type === 'pix_received' && 'PIX recebido'}
            {transaction.type === 'pix_sent' && 'PIX enviado'}
            {transaction.type === 'transfer' && 'Transferência'}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(transaction.createdAt)}
          </p>
        </div>
      </div>
      
      <div className="text-right">
        <p className={`font-medium ${typeInfo.amountColor}`}>
          {typeInfo.prefix}{formatBRL(transaction.amount)}
        </p>
        <Badge variant={statusConfig.variant} className={`text-xs mt-1 ${statusConfig.className}`}>
          <StatusIcon className={`h-3 w-3 mr-1 ${transaction.status === 'processing' ? 'animate-spin' : ''}`} />
          {statusConfig.label}
        </Badge>
      </div>
    </motion.div>
  );
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export function RecentTransactions({ transactions, isLoading }: RecentTransactionsProps) {
  const t = useTranslations('dashboard');
  const tTransactions = useTranslations('transactions');

  // Show skeleton while loading
  if (isLoading) {
    return <TransactionSkeleton />;
  }

  // Show empty state if no transactions
  if (!transactions || transactions.length === 0) {
    return <TransactionsEmpty />;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{t('recentTransactions')}</CardTitle>
            <CardDescription>Suas últimas 5 transações</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-primary">
            <Link href="/transactions">
              {t('viewAll')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {transactions.slice(0, 5).map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <TransactionItem transaction={transaction} />
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}

export default RecentTransactions;
