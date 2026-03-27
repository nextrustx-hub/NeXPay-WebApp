'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ArrowRight,
  Receipt,
  Wallet,
  Key,
  RefreshCw,
  Home,
  Copy,
  Check,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export interface WithdrawResult {
  success: boolean;
  transactionId?: string;
  amount?: number;
  fee?: number;
  netAmount?: number;
  pixKey?: string;
  pixKeyType?: string;
  status?: string;
  error?: string;
}

interface ConfirmationProps {
  result: WithdrawResult | null;
  onNewWithdraw: () => void;
  onGoToDashboard: () => void;
}

export function Confirmation({
  result,
  onNewWithdraw,
  onGoToDashboard,
}: ConfirmationProps) {
  const t = useTranslations('withdraw');
  const [copiedId, setCopiedId] = useState(false);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Get PIX key type label
  const getPixKeyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      CPF: t('cpf'),
      EMAIL: t('email'),
      PHONE: t('phone'),
      EVP: t('randomKey'),
    };
    return labels[type] || type;
  };

  // Copy transaction ID
  const handleCopyId = () => {
    if (result?.transactionId) {
      navigator.clipboard.writeText(result.transactionId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // Processing state
  if (!result) {
    return (
      <Card>
        <CardContent className="py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-emerald-500"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
            <h3 className="mt-6 text-xl font-semibold">{t('processing')}</h3>
            <p className="mt-2 text-muted-foreground">
              {t('processingMessage') || 'Aguarde enquanto processamos seu saque...'}
            </p>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  // Success state
  if (result.success) {
    return (
      <Card className="overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="flex flex-col items-center text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4"
            >
              <CheckCircle2 className="h-10 w-10" />
            </motion.div>
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold"
            >
              {t('completed')}
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-1 opacity-90"
            >
              {t('successMessage') || 'Seu saque foi processado com sucesso'}
            </motion.p>
          </motion.div>
        </div>

        {/* Transaction Details */}
        <CardContent className="p-6 space-y-4">
          {/* Transaction ID */}
          {result.transactionId && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <span className="text-sm text-muted-foreground">ID</span>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono">
                  {result.transactionId.slice(0, 8)}...{result.transactionId.slice(-4)}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleCopyId}
                >
                  {copiedId ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* PIX Key */}
          {result.pixKey && result.pixKeyType && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="flex items-center justify-between"
            >
              <span className="text-muted-foreground flex items-center gap-2">
                <Key className="h-4 w-4" />
                {t('pixKey')}
              </span>
              <div className="text-right">
                <p className="font-medium">{result.pixKey}</p>
                <p className="text-xs text-muted-foreground">
                  {getPixKeyTypeLabel(result.pixKeyType)}
                </p>
              </div>
            </motion.div>
          )}

          {/* Amount */}
          {result.amount && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-between"
            >
              <span className="text-muted-foreground flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                {t('requestedAmount')}
              </span>
              <span className="font-medium">{formatCurrency(result.amount)}</span>
            </motion.div>
          )}

          {/* Fee */}
          {result.fee !== undefined && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="flex items-center justify-between"
            >
              <span className="text-muted-foreground flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                {t('fee')}
              </span>
              <span className="text-destructive">-{formatCurrency(result.fee)}</span>
            </motion.div>
          )}

          {/* Net Amount */}
          {result.netAmount && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-between pt-3 border-t"
            >
              <span className="font-semibold">{t('netAmount')}</span>
              <span className="text-xl font-bold text-emerald-500">
                {formatCurrency(result.netAmount)}
              </span>
            </motion.div>
          )}

          {/* Status */}
          {result.status && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
              className="flex items-center justify-center gap-2 p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">
                {t('statusCompleted') || 'Transferência enviada'}
              </span>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-3 pt-4"
          >
            <Button
              variant="outline"
              onClick={onNewWithdraw}
              className="sm:flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('newWithdraw')}
            </Button>
            <Button
              onClick={onGoToDashboard}
              className="sm:flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              <Home className="h-4 w-4 mr-2" />
              {t('goToDashboard')}
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  return (
    <Card className="overflow-hidden">
      {/* Error Header */}
      <div className="bg-gradient-to-r from-destructive to-red-600 p-6 text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="flex flex-col items-center text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4"
          >
            <XCircle className="h-10 w-10" />
          </motion.div>
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold"
          >
            {t('failed')}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-1 opacity-90"
          >
            {result.error || t('errorMessage') || 'Ocorreu um erro ao processar seu saque'}
          </motion.p>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <CardContent className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Button
            variant="outline"
            onClick={onNewWithdraw}
            className="sm:flex-1"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('tryAgain') || 'Tentar novamente'}
          </Button>
          <Button
            onClick={onGoToDashboard}
            className="sm:flex-1"
          >
            <Home className="h-4 w-4 mr-2" />
            {t('goToDashboard')}
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}
