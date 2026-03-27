'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { QrCode, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  onContinue: () => void;
  isLoading?: boolean;
  error?: string;
}

const QUICK_AMOUNTS = [50, 100, 500, 1000];

// Format number to BRL currency (without R$ prefix)
function formatBRL(value: string): string {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  if (!digits) return '';
  
  // Convert to number (cents)
  const cents = parseInt(digits, 10);
  
  // Format as BRL
  const realPart = Math.floor(cents / 100);
  const centPart = cents % 100;
  
  // Format with thousand separators
  const formattedReal = realPart.toLocaleString('pt-BR');
  
  return `${formattedReal},${centPart.toString().padStart(2, '0')}`;
}

// Parse BRL formatted string to number
function parseBRL(value: string): number {
  const digits = value.replace(/\D/g, '');
  return parseInt(digits || '0', 10) / 100;
}

export function AmountInput({ value, onChange, onContinue, isLoading, error }: AmountInputProps) {
  const t = useTranslations('deposit');
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  const displayValue = value ? formatBRL(value) : '';
  const numericValue = parseBRL(value);
  const isValidAmount = numericValue >= 10;
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    // Limit to 8 digits (max R$ 999,999.99)
    if (rawValue.length <= 10) {
      onChange(rawValue);
    }
  };
  
  const handleQuickAmount = (amount: number) => {
    onChange((amount * 100).toString());
  };
  
  const handleContinue = () => {
    if (isValidAmount && !isLoading) {
      onContinue();
    }
  };
  
  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="text-center pb-2">
          <Skeleton className="h-8 w-32 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto mt-2" />
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/95">
        <CardHeader className="text-center pb-2">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <QrCode className="h-6 w-6 text-emerald-500" />
            {t('pix')}
          </CardTitle>
          <CardDescription className="text-base">
            {t('minAmount')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {/* Large Amount Input */}
          <div className="relative">
            <div className="flex items-center justify-center gap-1 py-6">
              <span className="text-4xl md:text-5xl font-semibold text-muted-foreground">
                R$
              </span>
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                placeholder="0,00"
                value={displayValue}
                onChange={handleInputChange}
                className={cn(
                  "w-auto min-w-[120px] max-w-[200px] bg-transparent text-4xl md:text-5xl font-semibold",
                  "text-center outline-none focus:ring-0 border-none",
                  "placeholder:text-muted-foreground/50",
                  error && "text-destructive"
                )}
                style={{ width: `${Math.max(displayValue.length * 1.8, 120)}px` }}
              />
            </div>
            
            {/* Amount Display */}
            <div className="text-center text-sm text-muted-foreground">
              {numericValue > 0 && (
                <span className={cn(
                  "inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted",
                  numericValue >= 10 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                )}>
                  {numericValue >= 10 ? (
                    <>
                      <Sparkles className="h-3 w-3" />
                      {t('amount')}: R$ {numericValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </>
                  ) : (
                    t('minAmount')
                  )}
                </span>
              )}
            </div>
          </div>
          
          {/* Quick Amount Buttons */}
          <div className="space-y-2">
            <p className="text-xs text-center text-muted-foreground uppercase tracking-wider">
              {t('quickAmounts')}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_AMOUNTS.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAmount(amount)}
                  className={cn(
                    "font-medium transition-all duration-200",
                    numericValue === amount && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                  )}
                >
                  R$ {amount}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive text-center"
            >
              {error}
            </motion.p>
          )}
          
          {/* Continue Button */}
          <Button
            size="lg"
            className={cn(
              "w-full text-lg font-semibold h-12 transition-all duration-300",
              "bg-gradient-to-r from-emerald-500 to-teal-600",
              "hover:from-emerald-600 hover:to-teal-700",
              "disabled:from-gray-400 disabled:to-gray-500",
              "shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40",
              "disabled:shadow-none"
            )}
            onClick={handleContinue}
            disabled={!isValidAmount || isLoading}
          >
            {t('continue')}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
