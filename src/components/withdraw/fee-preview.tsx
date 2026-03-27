'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowRight, 
  Receipt, 
  Wallet, 
  AlertTriangle,
  ChevronLeft,
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';

export interface FeeSimulation {
  requestedAmount: number;
  fee: number;
  netAmount: number;
  currency: string;
}

interface FeePreviewProps {
  simulation: FeeSimulation | null;
  isLoading: boolean;
  error: string | null;
  pixKeyType: string;
  pixKeyDisplay: string;
  onConfirm: () => void;
  onBack: () => void;
  isProcessing?: boolean;
}

export function FeePreview({
  simulation,
  isLoading,
  error,
  pixKeyType,
  pixKeyDisplay,
  onConfirm,
  onBack,
  isProcessing = false,
}: FeePreviewProps) {
  const t = useTranslations('withdraw');

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

  // Mask PIX key for display
  const maskPixKey = (key: string, type: string) => {
    if (!key) return '';
    
    switch (type) {
      case 'CPF':
        return key.replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/, '***.***.$3-$4');
      case 'EMAIL':
        const [localPart, domain] = key.split('@');
        if (!domain) return key;
        const maskedLocal = localPart.length > 2 
          ? `${localPart[0]}${'*'.repeat(localPart.length - 2)}${localPart[localPart.length - 1]}`
          : localPart;
        return `${maskedLocal}@${domain}`;
      case 'PHONE':
        return key.replace(/\((\d{2})\) (\d{5})-(\d{4})/, '(**) *****-$3');
      case 'EVP':
        return `${key.slice(0, 8)}-****-****-****-************`;
      default:
        return key;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          {t('preview')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="border-t pt-4 flex justify-between items-center">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-lg"
          >
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">{t('simulationError') || 'Erro ao simular'}</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Fee Details */}
        {simulation && !isLoading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* PIX Key Info */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">{t('pixKey')}</p>
              <p className="font-medium">{maskPixKey(pixKeyDisplay, pixKeyType)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {getPixKeyTypeLabel(pixKeyType)}
              </p>
            </div>

            {/* Amount Breakdown */}
            <div className="space-y-3">
              {/* Requested Amount */}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t('requestedAmount')}</span>
                <span className="font-medium">
                  {formatCurrency(simulation.requestedAmount)}
                </span>
              </div>

              {/* Fee */}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Receipt className="h-4 w-4" />
                  {t('fee')}
                </span>
                <span className="text-destructive font-medium">
                  -{formatCurrency(simulation.fee)}
                </span>
              </div>

              {/* Divider */}
              <div className="border-t border-dashed" />

              {/* Net Amount */}
              <div className="flex justify-between items-center">
                <span className="font-medium flex items-center gap-1">
                  <Wallet className="h-4 w-4" />
                  {t('netAmount')}
                </span>
                <span className="text-xl font-bold text-emerald-500">
                  {formatCurrency(simulation.netAmount)}
                </span>
              </div>
            </div>

            {/* Info Box */}
            <div className="flex items-start gap-2 p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-sm">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>
                {t('feeInfo') || 'O valor será creditado em sua conta PIX em até 30 minutos após a confirmação.'}
              </p>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isProcessing}
            className="sm:flex-1"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t('back')}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading || !!error || !simulation || isProcessing}
            className="sm:flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('processing')}
              </>
            ) : (
              <>
                {t('confirm')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
