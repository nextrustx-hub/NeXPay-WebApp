'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Copy,
  Download,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Transaction, TransactionType, TransactionStatus } from '@/lib/api-types';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper to format BRL currency
function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Helper to get type icon
function getTypeIcon(type: TransactionType, size: 'sm' | 'lg' = 'sm') {
  const sizeClass = size === 'lg' ? 'h-8 w-8' : 'h-5 w-5';
  switch (type) {
    case 'deposit':
    case 'pix_received':
      return <ArrowDownCircle className={cn(sizeClass, 'text-emerald-500')} />;
    case 'withdraw':
    case 'pix_sent':
      return <ArrowUpCircle className={cn(sizeClass, 'text-foreground')} />;
    default:
      return null;
  }
}

// Helper to get status icon
function getStatusIcon(status: TransactionStatus) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-4 w-4" />;
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'processing':
      return <Loader2 className="h-4 w-4 animate-spin" />;
    case 'failed':
    case 'cancelled':
      return <XCircle className="h-4 w-4" />;
    default:
      return null;
  }
}

// Helper to get status badge color
function getStatusColor(status: TransactionStatus) {
  switch (status) {
    case 'completed':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    case 'pending':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
    case 'processing':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'failed':
    case 'cancelled':
      return 'bg-red-500/10 text-red-600 dark:text-red-400';
    default:
      return '';
  }
}

export function TransactionDetailModal({
  transaction,
  open,
  onOpenChange,
}: TransactionDetailModalProps) {
  const t = useTranslations('transactions');
  const tCommon = useTranslations('common');

  if (!transaction) return null;

  const isCredit = transaction.type === 'deposit' || transaction.type === 'pix_received';

  const handleCopyId = () => {
    navigator.clipboard.writeText(transaction.id);
    toast.success('ID copiado!');
  };

  const handleDownloadReceipt = () => {
    // TODO: Implement receipt download
    toast.info('Comprovante será baixado em breve');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0">
        {/* Header with gradient background */}
        <div className={cn(
          'relative p-6 rounded-t-lg',
          isCredit 
            ? 'bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent' 
            : 'bg-gradient-to-br from-muted to-transparent'
        )}>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  'h-14 w-14 rounded-full flex items-center justify-center',
                  isCredit ? 'bg-emerald-500/10' : 'bg-muted'
                )}>
                  {getTypeIcon(transaction.type, 'lg')}
                </div>
                <div>
                  <DialogTitle className="text-xl">
                    {t(`type.${transaction.type}`)}
                  </DialogTitle>
                  <Badge 
                    variant="secondary" 
                    className={cn('mt-1 gap-1 font-normal', getStatusColor(transaction.status))}
                  >
                    {getStatusIcon(transaction.status)}
                    {t(`status.${transaction.status}`)}
                  </Badge>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Amount */}
          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-1">
              {tCommon('amount')}
            </p>
            <p className={cn(
              'text-3xl font-bold',
              isCredit ? 'text-emerald-500' : 'text-foreground'
            )}>
              {isCredit ? '+' : '-'}{formatBRL(transaction.amount)}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          {/* Transaction ID */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {t('transactionId')}
              </p>
              <code className="text-sm font-mono">{transaction.id}</code>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleCopyId}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <Separator />

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {tCommon('date')}
              </p>
              <p className="text-sm font-medium">
                {format(new Date(transaction.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Horário
              </p>
              <p className="text-sm font-medium">
                {format(new Date(transaction.createdAt), "HH:mm:ss", { locale: ptBR })}
              </p>
            </div>
          </div>

          <Separator />

          {/* Fee & Net Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Taxa
              </p>
              <p className="text-sm font-medium">
                {formatBRL(transaction.fee)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Valor líquido
              </p>
              <p className="text-sm font-medium">
                {formatBRL(transaction.netAmount)}
              </p>
            </div>
          </div>

          {/* Description */}
          {transaction.description && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {tCommon('description')}
                </p>
                <p className="text-sm">
                  {transaction.description}
                </p>
              </div>
            </>
          )}

          {/* PIX Code */}
          {transaction.pixCode && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Código PIX
                </p>
                <code className="text-xs bg-muted p-2 rounded block overflow-x-auto">
                  {transaction.pixCode}
                </code>
              </div>
            </>
          )}

          {/* Completed At */}
          {transaction.completedAt && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">
                  Concluído em
                </p>
                <p className="text-sm font-medium">
                  {format(new Date(transaction.completedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-0">
          <Separator className="mb-4" />
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleDownloadReceipt}
            >
              <Download className="h-4 w-4" />
              {t('downloadReceipt')}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {tCommon('close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
