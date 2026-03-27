'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpCircle, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';

interface AmountInputProps {
  amount: string;
  onAmountChange: (value: string) => void;
  availableBalance: number | null;
  isLoadingBalance: boolean;
  error?: string;
}

export function AmountInput({
  amount,
  onAmountChange,
  availableBalance,
  isLoadingBalance,
  error,
}: AmountInputProps) {
  const t = useTranslations('withdraw');
  const [displayValue, setDisplayValue] = useState('');

  // Format number to BRL currency display
  const formatBRL = useCallback((value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }, []);

  // Parse BRL formatted string to number
  const parseBRL = useCallback((value: string) => {
    const cleanValue = value.replace(/[R$\s.]/g, '').replace(',', '.');
    return parseFloat(cleanValue) || 0;
  }, []);

  // Handle input change with formatting
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    
    if (rawValue === '') {
      setDisplayValue('');
      onAmountChange('');
      return;
    }

    // Convert to number and format
    const numericValue = parseInt(rawValue, 10) / 100;
    const formatted = numericValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    setDisplayValue(formatted);
    onAmountChange(numericValue.toString());
  };

  // Quick amount buttons
  const handleQuickAmount = (percentage: number) => {
    if (!availableBalance) return;
    const value = availableBalance * percentage;
    const formatted = value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    setDisplayValue(formatted);
    onAmountChange(value.toString());
  };

  const quickAmounts = [
    { label: '25%', percentage: 0.25 },
    { label: '50%', percentage: 0.5 },
    { label: '75%', percentage: 0.75 },
    { label: '100%', percentage: 1 },
  ];

  // Check if amount exceeds balance
  const numericAmount = parseFloat(amount || '0');
  const exceedsBalance = availableBalance !== null && numericAmount > availableBalance;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowUpCircle className="h-5 w-5" />
          {t('title')}
        </CardTitle>
        <CardDescription>
          {t('minAmount')} | {t('maxAmount')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Available Balance */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{t('availableBalance')}</span>
          </div>
          {isLoadingBalance ? (
            <Skeleton className="h-6 w-24" />
          ) : (
            <span className="font-semibold text-lg">
              {availableBalance !== null ? formatBRL(availableBalance) : 'R$ 0,00'}
            </span>
          )}
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount">{t('enterAmount')}</Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
              R$
            </span>
            <Input
              id="amount"
              type="text"
              inputMode="numeric"
              placeholder="0,00"
              value={displayValue}
              onChange={handleInputChange}
              className={`pl-12 h-14 text-2xl font-semibold ${
                exceedsBalance ? 'border-destructive focus-visible:ring-destructive' : ''
              }`}
            />
          </div>
          <AnimatePresence>
            {(error || exceedsBalance) && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-destructive"
              >
                {exceedsBalance ? t('insufficientBalance') : error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Amount Buttons */}
        {availableBalance !== null && availableBalance > 0 && (
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">
              {t('quickAmounts') || 'Valores rápidos'}
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((item) => (
                <Button
                  key={item.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAmount(item.percentage)}
                  className="text-xs sm:text-sm"
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
