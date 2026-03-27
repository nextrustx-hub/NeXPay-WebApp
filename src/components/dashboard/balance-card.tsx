'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Wallet, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useBalance } from '@/hooks/use-auth';
import type { Balance } from '@/lib/api-types';

// Format BRL currency
function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Skeleton loader for balance card
function BalanceSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="space-y-2 pt-2 border-t">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

// Empty state for balance
function BalanceEmpty() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Wallet className="h-4 w-4 text-white" />
          </div>
          <CardTitle className="text-lg font-semibold">Saldo</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Saldo disponível</p>
          <p className="text-3xl font-bold tracking-tight">R$ 0,00</p>
        </div>
        <div className="flex items-center gap-2 pt-2 border-t">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Saldo pendente: R$ 0,00</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface BalanceCardProps {
  balance: Balance | null | undefined;
  isLoading: boolean;
}

export function BalanceCard({ balance, isLoading }: BalanceCardProps) {
  const t = useTranslations('dashboard');
  const [showBalance, setShowBalance] = useState(true);

  // Show skeleton while loading
  if (isLoading) {
    return <BalanceSkeleton />;
  }

  // Show empty state if no balance data
  if (!balance) {
    return <BalanceEmpty />;
  }

  const totalBalance = balance.available + balance.pending;

  return (
    <Card className="overflow-hidden relative">
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-lg font-semibold">{t('overview')}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowBalance(!showBalance)}
            aria-label={showBalance ? 'Ocultar saldo' : 'Mostrar saldo'}
          >
            <AnimatePresence mode="wait" initial={false}>
              {showBalance ? (
                <motion.div
                  key="eye"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                >
                  <Eye className="h-4 w-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="eye-off"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                >
                  <EyeOff className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Available Balance */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{t('availableBalance')}</p>
          <AnimatePresence mode="wait">
            {showBalance ? (
              <motion.p
                key="visible"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-3xl font-bold tracking-tight"
              >
                {formatBRL(balance.available)}
              </motion.p>
            ) : (
              <motion.p
                key="hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-3xl font-bold tracking-tight"
              >
                ••••••
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Pending Balance */}
        <div className="flex items-center gap-2 pt-3 border-t">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-muted-foreground">{t('pendingBalance')}:</span>
          </div>
          <AnimatePresence mode="wait">
            {showBalance ? (
              <motion.span
                key="pending-visible"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium text-amber-600 dark:text-amber-500"
              >
                {formatBRL(balance.pending)}
              </motion.span>
            ) : (
              <motion.span
                key="pending-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium"
              >
                ••••••
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Total Balance (subtle) */}
        <div className="text-xs text-muted-foreground pt-1">
          Total: {showBalance ? formatBRL(totalBalance) : '••••••'}
        </div>
      </CardContent>
    </Card>
  );
}

export default BalanceCard;
