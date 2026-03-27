'use client';

import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { User } from '@/lib/api-types';

interface KycBannerProps {
  user: User | null | undefined;
}

export function KycBanner({ user }: KycBannerProps) {
  const t = useTranslations('dashboard');
  const [dismissed, setDismissed] = useState(false);

  // Check if KYC is pending - user status is pending_verification or kycLevel is none/basic
  const isKycPending = user?.status === 'pending_verification' || 
                       (user && user.kycLevel !== 'advanced' && user.status !== 'active');

  // Don't show banner if KYC is not pending or if it was dismissed
  if (!isKycPending || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative overflow-hidden rounded-lg border border-amber-200 dark:border-amber-900/50 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-4">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 dark:bg-amber-700/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                    Verificação de conta em análise
                  </h3>
                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                    {t('kycPending')}
                  </p>
                </div>
                
                {/* Dismiss button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0 text-amber-600 hover:text-amber-700 hover:bg-amber-100/50 dark:text-amber-400 dark:hover:bg-amber-900/30"
                  onClick={() => setDismissed(true)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Fechar</span>
                </Button>
              </div>

              {/* Action hint */}
              <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-3 w-3" />
                <span>Limite operacional temporário de R$ 1.000</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default KycBanner;
