'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Filter,
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
  Wallet,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useTransactions } from '@/hooks/use-auth';
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
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Get status display
function getStatusDisplay(status: string) {
  switch (status) {
    case 'completed':
      return {
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
        color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      };
    case 'pending':
      return {
        icon: <Clock className="h-4 w-4 text-amber-500" />,
        color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      };
    case 'processing':
      return {
        icon: <Loader2 className="h-4 w-4 animate-spin text-blue-500" />,
        color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      };
    case 'failed':
      return {
        icon: <XCircle className="h-4 w-4 text-red-500" />,
        color: 'bg-red-500/10 text-red-600 dark:text-red-400',
      };
    case 'cancelled':
      return {
        icon: <XCircle className="h-4 w-4 text-gray-500" />,
        color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
      };
    default:
      return {
        icon: null,
        color: '',
      };
  }
}

// Transaction row skeleton
function TransactionRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <div className="text-right space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
  );
}

// Empty state
function EmptyState() {
  const t = useTranslations('transactions');
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Wallet className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{t('noTransactions')}</h3>
      <p className="text-muted-foreground max-w-sm">
        Você ainda não realizou nenhuma transação. Faça um depósito para começar.
      </p>
    </div>
  );
}

// Error state
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="font-semibold text-lg mb-2">Erro ao carregar transações</h3>
      <p className="text-muted-foreground mb-4">
        Não foi possível carregar o histórico de transações.
      </p>
      <Button variant="outline" onClick={onRetry}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Tentar novamente
      </Button>
    </div>
  );
}

// Transaction row component
function TransactionRow({ transaction }: { transaction: Transaction }) {
  const t = useTranslations('transactions');
  const isDeposit = transaction.type === 'deposit' || transaction.type === 'pix_received';
  const statusDisplay = getStatusDisplay(transaction.status);

  const getTypeLabel = (type: TransactionType) => {
    switch (type) {
      case 'deposit':
        return 'Depósito PIX';
      case 'withdraw':
        return 'Saque PIX';
      case 'pix_received':
        return 'PIX Recebido';
      case 'pix_sent':
        return 'PIX Enviado';
      case 'transfer':
        return 'Transferência';
      default:
        return type;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
    >
      <div className="flex items-center gap-4">
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
          <p className="font-medium">{getTypeLabel(transaction.type)}</p>
          <p className="text-sm text-muted-foreground">
            {formatDate(transaction.createdAt)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p
            className={`font-medium ${
              isDeposit ? 'text-emerald-500' : 'text-red-500'
            }`}
          >
            {isDeposit ? '+' : '-'}{formatBRL(transaction.amount)}
          </p>
          <Badge
            variant="secondary"
            className={`text-xs ${statusDisplay.color}`}
          >
            <span className="flex items-center gap-1">
              {statusDisplay.icon}
              {t(`status.${transaction.status}`)}
            </span>
          </Badge>
        </div>
      </div>
    </motion.div>
  );
}

export default function TransactionsPage() {
  const t = useTranslations('transactions');
  const router = useRouter();
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const locale = currentPath.split('/')[1] || 'pt-BR';

  // Filter state
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // API hook with filters
  const { 
    transactions, 
    total, 
    isLoading, 
    isFetching, 
    error, 
    refetch 
  } = useTransactions({
    limit: ITEMS_PER_PAGE,
    page,
    type: typeFilter !== 'all' ? (typeFilter as TransactionType) : undefined,
    status: statusFilter !== 'all' ? (statusFilter as TransactionStatus) : undefined,
  });

  // Calculate pagination
  const totalPages = Math.ceil((total || 0) / ITEMS_PER_PAGE);

  // Reset page when filters change
  const handleTypeChange = (value: string) => {
    setTypeFilter(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Title */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('history')}</p>
        </div>
        <Button variant="outline" className="gap-2" disabled>
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filtros:</span>
              </div>
              <Select value={typeFilter} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('allTypes')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allTypes')}</SelectItem>
                  <SelectItem value="deposit">{t('type.deposit')}</SelectItem>
                  <SelectItem value="withdraw">{t('type.withdraw')}</SelectItem>
                  <SelectItem value="pix_received">{t('type.pix_received')}</SelectItem>
                  <SelectItem value="pix_sent">{t('type.pix_sent')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('allStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allStatus')}</SelectItem>
                  <SelectItem value="completed">{t('status.completed')}</SelectItem>
                  <SelectItem value="pending">{t('status.pending')}</SelectItem>
                  <SelectItem value="processing">{t('status.processing')}</SelectItem>
                  <SelectItem value="failed">{t('status.failed')}</SelectItem>
                  <SelectItem value="cancelled">{t('status.cancelled')}</SelectItem>
                </SelectContent>
              </Select>
              {(typeFilter !== 'all' || statusFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setTypeFilter('all');
                    setStatusFilter('all');
                    setPage(1);
                  }}
                >
                  Limpar filtros
                </Button>
              )}
              <div className="ml-auto flex items-center gap-2">
                {isFetching && (
                  <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isLoading || isFetching}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Atualizar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transactions List */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t('history')}</CardTitle>
                <CardDescription>
                  {total !== undefined && total > 0
                    ? `${total} transação(ões) encontrada(s)`
                    : 'Seu histórico de transações'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                // Loading skeletons
                <>
                  <TransactionRowSkeleton />
                  <TransactionRowSkeleton />
                  <TransactionRowSkeleton />
                  <TransactionRowSkeleton />
                  <TransactionRowSkeleton />
                </>
              ) : error ? (
                // Error state
                <ErrorState onRetry={() => refetch()} />
              ) : transactions.length === 0 ? (
                // Empty state
                <EmptyState />
              ) : (
                // Transaction list
                transactions.map((transaction) => (
                  <TransactionRow key={transaction.id} transaction={transaction} />
                ))
              )}
            </div>

            {/* Pagination */}
            {!isLoading && !error && transactions.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Página {page} de {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || isFetching}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || isFetching}
                  >
                    Próximo
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
