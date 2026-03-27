'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Eye,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Transaction, TransactionType, TransactionStatus } from '@/lib/api-types';

interface TransactionRowProps {
  transaction: Transaction;
  onViewDetails: (transaction: Transaction) => void;
}

// Helper to format BRL currency
function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Helper to get type icon
function getTypeIcon(type: TransactionType) {
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

// Helper to get type background
function getTypeBg(type: TransactionType) {
  switch (type) {
    case 'deposit':
    case 'pix_received':
      return 'bg-emerald-500/10';
    case 'withdraw':
    case 'pix_sent':
      return 'bg-muted';
    default:
      return 'bg-muted';
  }
}

// Helper to get status icon
function getStatusIcon(status: TransactionStatus) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-3.5 w-3.5" />;
    case 'pending':
      return <Clock className="h-3.5 w-3.5" />;
    case 'processing':
      return <Loader2 className="h-3.5 w-3.5 animate-spin" />;
    case 'failed':
    case 'cancelled':
      return <XCircle className="h-3.5 w-3.5" />;
    default:
      return null;
  }
}

// Helper to get status badge color
function getStatusColor(status: TransactionStatus) {
  switch (status) {
    case 'completed':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20';
    case 'pending':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20';
    case 'processing':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20';
    case 'failed':
    case 'cancelled':
      return 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20';
    default:
      return '';
  }
}

// Helper to truncate ID
function truncateId(id: string): string {
  if (id.length <= 12) return id;
  return `${id.slice(0, 8)}...${id.slice(-4)}`;
}

export function TransactionRow({ transaction, onViewDetails }: TransactionRowProps) {
  const t = useTranslations('transactions');

  const isCredit = transaction.type === 'deposit' || transaction.type === 'pix_received';

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      {/* Left side: Icon + Info */}
      <div className="flex items-center gap-4">
        <div className={cn('h-10 w-10 rounded-full flex items-center justify-center', getTypeBg(transaction.type))}>
          {getTypeIcon(transaction.type)}
        </div>
        <div>
          <p className="font-medium text-sm">
            {t(`type.${transaction.type}`)}
          </p>
          <p className="text-xs text-muted-foreground">
            {transaction.description || t(`type.${transaction.type}`)}
          </p>
        </div>
      </div>

      {/* Right side: Amount + Status + Actions */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className={cn(
            'font-semibold text-sm',
            isCredit ? 'text-emerald-500' : 'text-foreground'
          )}>
            {isCredit ? '+' : '-'}{formatBRL(transaction.amount)}
          </p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(transaction.createdAt), "dd MMM yyyy, HH:mm", { locale: ptBR })}
          </p>
        </div>
        
        <Badge variant="secondary" className={cn('text-xs gap-1 font-normal', getStatusColor(transaction.status))}>
          {getStatusIcon(transaction.status)}
          {t(`status.${transaction.status}`)}
        </Badge>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onViewDetails(transaction)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('viewDetails')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

// Desktop Table Row Component
interface TransactionTableRowProps {
  transaction: Transaction;
  onViewDetails: (transaction: Transaction) => void;
}

export function TransactionTableRow({ transaction, onViewDetails }: TransactionTableRowProps) {
  const t = useTranslations('transactions');
  const isCredit = transaction.type === 'deposit' || transaction.type === 'pix_received';

  return (
    <tr className="hover:bg-muted/50 transition-colors border-b last:border-0">
      {/* Icon */}
      <td className="p-4">
        <div className={cn('h-10 w-10 rounded-full flex items-center justify-center', getTypeBg(transaction.type))}>
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
        <p className={cn(
          'font-semibold text-sm',
          isCredit ? 'text-emerald-500' : 'text-foreground'
        )}>
          {isCredit ? '+' : '-'}{formatBRL(transaction.amount)}
        </p>
      </td>
      
      {/* Status */}
      <td className="p-4">
        <Badge variant="secondary" className={cn('text-xs gap-1 font-normal', getStatusColor(transaction.status))}>
          {getStatusIcon(transaction.status)}
          {t(`status.${transaction.status}`)}
        </Badge>
      </td>
      
      {/* Date */}
      <td className="p-4">
        <p className="text-sm text-muted-foreground">
          {format(new Date(transaction.createdAt), "dd MMM yyyy, HH:mm", { locale: ptBR })}
        </p>
      </td>
      
      {/* ID */}
      <td className="p-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                {truncateId(transaction.id)}
              </code>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-mono">{transaction.id}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </td>
      
      {/* Actions */}
      <td className="p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetails(transaction)}
          className="h-8"
        >
          <Eye className="h-4 w-4 mr-1" />
          <span className="hidden lg:inline">{t('viewDetails')}</span>
        </Button>
      </td>
    </tr>
  );
}
