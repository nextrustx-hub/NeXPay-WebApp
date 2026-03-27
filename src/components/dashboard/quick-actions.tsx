'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';

// Quick amount shortcuts
const QUICK_AMOUNTS = [100, 500, 1000];

// Format BRL currency
function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function QuickActions() {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{t('quickActions')}</CardTitle>
        <CardDescription>
          {tCommon('actions')} rápidas para sua conta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              asChild
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md"
            >
              <Link href="/deposit">
                <ArrowDownCircle className="mr-2 h-4 w-4" />
                {t('deposit')}
              </Link>
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              asChild
              variant="outline"
              className="border-2"
            >
              <Link href="/withdraw">
                <ArrowUpCircle className="mr-2 h-4 w-4" />
                {t('withdraw')}
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Quick Amount Shortcuts */}
        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground mb-3">
            Valores rápidos para depósito:
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map((amount) => (
              <motion.div
                key={amount}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  asChild
                  variant="secondary"
                  size="sm"
                  className="font-medium"
                >
                  <Link href={`/deposit?amount=${amount}`}>
                    {formatBRL(amount)}
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default QuickActions;
