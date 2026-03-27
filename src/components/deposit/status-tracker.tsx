'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Clock, 
  Loader2, 
  AlertCircle, 
  ArrowRight,
  Home,
  RefreshCcw,
  PartyPopper
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type DepositStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'expired';

interface StatusTrackerProps {
  status: DepositStatus;
  amount: number;
  onNewDeposit: () => void;
  onGoToDashboard: () => void;
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: 'waitingPayment',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
    progress: 33
  },
  processing: {
    icon: Loader2,
    label: 'processing',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    progress: 66,
    animate: true
  },
  completed: {
    icon: CheckCircle2,
    label: 'completed',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    progress: 100
  },
  failed: {
    icon: AlertCircle,
    label: 'failed',
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-800',
    progress: 100
  },
  expired: {
    icon: Clock,
    label: 'expired',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50 dark:bg-gray-950/30',
    borderColor: 'border-gray-200 dark:border-gray-800',
    progress: 100
  }
};

// Progress indicator component
function ProgressIndicator({ progress }: { progress: number }) {
  return (
    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  );
}

// Step indicator component
function StepIndicators({ currentStep }: { currentStep: number }) {
  const t = useTranslations('deposit');
  const steps = [
    { label: t('waitingPayment'), completed: currentStep > 0 },
    { label: t('processing'), completed: currentStep > 1 },
    { label: t('completed'), completed: currentStep > 2 }
  ];
  
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
              step.completed 
                ? "bg-emerald-500 text-white" 
                : index === currentStep
                  ? "bg-blue-500 text-white"
                  : "bg-muted text-muted-foreground"
            )}>
              {step.completed ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </div>
            <span className={cn(
              "text-sm font-medium hidden sm:block",
              step.completed || index === currentStep ? "text-foreground" : "text-muted-foreground"
            )}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <ArrowRight className={cn(
              "h-4 w-4 transition-colors duration-300",
              step.completed ? "text-emerald-500" : "text-muted-foreground/50"
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export function StatusTracker({ 
  status, 
  amount, 
  onNewDeposit, 
  onGoToDashboard 
}: StatusTrackerProps) {
  const t = useTranslations('deposit');
  const config = statusConfig[status];
  const Icon = config.icon;
  
  const formattedAmount = amount.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  });
  
  const isTerminal = status === 'completed' || status === 'failed' || status === 'expired';
  const stepIndex = status === 'pending' ? 0 : status === 'processing' ? 1 : 2;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/95">
        <CardContent className="pt-8 pb-6">
          {/* Step Indicators */}
          {!isTerminal && <StepIndicators currentStep={stepIndex} />}
          
          {/* Main Status Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              {/* Status Icon */}
              <div className={cn(
                "relative mb-6",
                config.animate && "animate-pulse"
              )}>
                <div className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center",
                  config.bgColor,
                  "border-2",
                  config.borderColor
                )}>
                  <Icon className={cn(
                    "h-10 w-10",
                    config.color,
                    config.animate && "animate-spin"
                  )} />
                </div>
                
                {/* Success confetti effect */}
                {status === 'completed' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="absolute -top-2 -right-2"
                  >
                    <PartyPopper className="h-8 w-8 text-emerald-500" />
                  </motion.div>
                )}
              </div>
              
              {/* Status Label */}
              <Badge 
                variant="secondary"
                className={cn(
                  "text-base font-semibold px-4 py-1.5 mb-4",
                  config.bgColor,
                  config.borderColor
                )}
              >
                {t(config.label)}
              </Badge>
              
              {/* Amount */}
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground mb-1">
                  {t('amount')}
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {formattedAmount}
                </p>
              </div>
              
              {/* Progress Bar */}
              {!isTerminal && (
                <div className="w-full max-w-xs mb-6">
                  <ProgressIndicator progress={config.progress} />
                </div>
              )}
              
              {/* Info Message */}
              {!isTerminal && (
                <p className="text-sm text-muted-foreground text-center max-w-xs mb-6">
                  {status === 'pending' && t('waitingPaymentMessage')}
                  {status === 'processing' && t('processingMessage')}
                </p>
              )}
              
              {/* Error Message */}
              {(status === 'failed' || status === 'expired') && (
                <div className={cn(
                  "w-full max-w-xs p-4 rounded-lg mb-6",
                  "bg-red-50 dark:bg-red-950/30",
                  "border border-red-200 dark:border-red-800"
                )}>
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">
                    {status === 'failed' && t('failedMessage')}
                    {status === 'expired' && t('expiredMessage')}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          
          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 mt-4 w-full"
          >
            {(status === 'failed' || status === 'expired') && (
              <Button
                variant="outline"
                size="lg"
                onClick={onNewDeposit}
                className="flex-1"
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                {t('newDeposit')}
              </Button>
            )}
            
            {status === 'completed' && (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onNewDeposit}
                  className="flex-1"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  {t('newDeposit')}
                </Button>
                <Button
                  size="lg"
                  onClick={onGoToDashboard}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                >
                  <Home className="h-4 w-4 mr-2" />
                  {t('goToDashboard')}
                </Button>
              </>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Loading skeleton
export function StatusTrackerSkeleton() {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="pt-8 pb-6">
        <div className="flex items-center justify-center gap-2 mb-8">
          {[...Array(3)].map((_, i) => (
            <React.Fragment key={i}>
              <Skeleton className="w-8 h-8 rounded-full" />
              {i < 2 && <Skeleton className="w-4 h-4" />}
            </React.Fragment>
          ))}
        </div>
        <div className="flex flex-col items-center">
          <Skeleton className="w-20 h-20 rounded-full mb-6" />
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-10 w-36 mb-6" />
          <Skeleton className="h-2 w-full max-w-xs mb-6" />
          <Skeleton className="h-4 w-48" />
        </div>
      </CardContent>
    </Card>
  );
}
