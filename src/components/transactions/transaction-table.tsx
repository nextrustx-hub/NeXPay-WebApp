'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
} from 'lucide-react';
import { TransactionRow } from './transaction-row';
import { EmptyState, FilteredEmptyState } from './empty-state';
import type { Transaction } from '@/lib/api-types';

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  hasFilters: boolean;
  onViewDetails: (transaction: Transaction) => void;
}

export function TransactionTable({ 
  transactions, 
  isLoading, 
  hasFilters,
  onViewDetails 
}: TransactionTableProps) {
  const t = useTranslations('transactions');

  // Mobile/Card view
  if (transactions.length === 0 && !isLoading) {
    if (hasFilters) {
      return <FilteredEmptyState />;
    }
    return <EmptyState />;
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {transactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.03 }}
          >
            <TransactionRow 
              transaction={transaction} 
              onViewDetails={onViewDetails}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Desktop Table View Component
export function TransactionDesktopTable({
  transactions,
  isLoading,
  hasFilters,
  onViewDetails,
}: TransactionTableProps) {
  const t = useTranslations('transactions');

  if (transactions.length === 0 && !isLoading) {
    if (hasFilters) {
      return <FilteredEmptyState />;
    }
    return <EmptyState />;
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-[60px] p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"></th>
              <th className="w-[140px] p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('type')}
              </th>
              <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('description')}
              </th>
              <th className="w-[120px] p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('amount')}
              </th>
              <th className="w-[120px] p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('status')}
              </th>
              <th className="w-[180px] p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('date')}
              </th>
              <th className="w-[120px] p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('id')}
              </th>
              <th className="w-[100px] p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {transactions.map((transaction, index) => (
                <motion.tr
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-muted/50 transition-colors border-b last:border-0"
                >
                  {/* Icon */}
                  <td className="p-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'deposit' || transaction.type === 'pix_received'
                        ? 'bg-emerald-500/10'
                        : 'bg-muted'
                    }`}>
                      {getTypeIcon(transaction.type)}
                    </div>
                  </td>
                  
                  {/* Type */}
                  <td className="p-4">
                    <p className="font-medium text-sm">{t(`type.${transaction.type}`)}</p>
                  </td>
                  
                  {/* Description */}
                  <td className="p-4">
                    <p className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {transaction.description || t(`type.${transaction.type}`)}
                    </p>
                  </td>
                  
                  {/* Amount */}
                  <td className="p-4">
                    <AmountCell transaction={transaction} />
                  </td>
                  
                  {/* Status */}
                  <td className="p-4">
                    <StatusBadge status={transaction.status} />
                  </td>
                  
                  {/* Date */}
                  <td className="p-4">
                    <DateCell date={transaction.createdAt} />
                  </td>
                  
                  {/* ID */}
                  <td className="p-4">
                    <IdCell id={transaction.id} />
                  </td>
                  
                  {/* Actions */}
                  <td className="p-4">
                    <button
                      onClick={() => onViewDetails(transaction)}
                      className="text-sm text-primary hover:underline"
                    >
                      {t('viewDetails')}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Helper components
function getTypeIcon(type: string) {
  switch (type) {
    case 'deposit':
    case 'pix_received':
      return <ArrowDownCircle className="h-5 w-5 text-emerald-500" />;
    case 'withdraw':
    case 'pix_sent':
      return <ArrowUpCircle className="h-5 w-5 text-foreground" />;
    default:
      return null;
  }
}

function AmountCell({ transaction }: { transaction: Transaction }) {
  const isCredit = transaction.type === 'deposit' || transaction.type === 'pix_received';
  const formatBRL = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <p className={`font-semibold text-sm ${isCredit ? 'text-emerald-500' : 'text-foreground'}`}>
      {isCredit ? '+' : '-'}{formatBRL(transaction.amount)}
    </p>
  );
}

function StatusBadge({ status }: { status: string }) {
  const t = useTranslations('transactions');

  const getIcon = () => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-3.5 w-3.5" />;
      case 'pending': return <Clock className="h-3.5 w-3.5" />;
      case 'processing': return <Loader2 className="h-3.5 w-3.5 animate-spin" />;
      case 'failed':
      case 'cancelled': return <XCircle className="h-3.5 w-3.5" />;
      default: return null;
    }
  };

  const getColor = () => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      case 'pending': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      case 'processing': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'failed':
      case 'cancelled': return 'bg-red-500/10 text-red-600 dark:text-red-400';
      default: return '';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-normal ${getColor()}`}>
      {getIcon()}
      {t(`status.${status}`)}
    </span>
  );
}

function DateCell({ date }: { date: string }) {
  return (
    <p className="text-sm text-muted-foreground">
      {format(new Date(date), 'dd MMM yyyy, HH:mm', { locale: ptBR })}
    </p>
  );
}

function IdCell({ id }: { id: string }) {
  const truncated = id.length <= 12 ? id : `${id.slice(0, 8)}...${id.slice(-4)}`;

  return (
    <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
      {truncated}
    </code>
  );
}
