'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { FileText, PlusCircle, ArrowDownCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function EmptyState() {
  const t = useTranslations('transactions');
  const tCommon = useTranslations('common');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="relative mb-6">
        <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
          <FileText className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="absolute -bottom-1 -right-1 h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <ArrowDownCircle className="h-6 w-6 text-emerald-500" />
        </div>
      </div>
      
      <h3 className="text-xl font-semibold mb-2">
        {t('noTransactions')}
      </h3>
      
      <p className="text-muted-foreground text-center max-w-sm mb-6">
        Você ainda não tem transações. Faça seu primeiro depósito para começar a usar sua conta!
      </p>
      
      <Link href="/pt-BR/deposit">
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          {t('makeDeposit')}
        </Button>
      </Link>
    </motion.div>
  );
}

export function FilteredEmptyState() {
  const t = useTranslations('transactions');
  const tCommon = useTranslations('common');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <FileText className="h-10 w-10 text-muted-foreground" />
      </div>
      
      <h3 className="text-lg font-semibold mb-2">
        {t('noTransactions')}
      </h3>
      
      <p className="text-muted-foreground text-center max-w-sm">
        Nenhuma transação encontrada com os filtros selecionados. Tente ajustar os filtros.
      </p>
    </motion.div>
  );
}
