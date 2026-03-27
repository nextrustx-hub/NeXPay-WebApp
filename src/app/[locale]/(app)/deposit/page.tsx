'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { AmountInput } from '@/components/deposit/amount-input';
import { QRCodeDisplay } from '@/components/deposit/qr-code-display';
import { 
  StatusTracker, 
  StatusTrackerSkeleton,
  type DepositStatus 
} from '@/components/deposit/status-tracker';
import { api } from '@/lib/axios';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';

// Types for the deposit flow
interface DepositResponse {
  id: string;
  qrCode?: string;
  pixCode: string;
  amount: number;
  status: string;
  expiresAt: string;
}

interface TransactionStatusResponse {
  id: string;
  status: DepositStatus;
  amount: number;
}

type Step = 'amount' | 'qrcode' | 'status';

// Format seconds to mm:ss
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function DepositPage() {
  const t = useTranslations('deposit');
  const router = useRouter();
  
  // State management
  const [step, setStep] = React.useState<Step>('amount');
  const [amount, setAmount] = React.useState('');
  const [deposit, setDeposit] = React.useState<DepositResponse | null>(null);
  const [depositStatus, setDepositStatus] = React.useState<DepositStatus>('pending');
  const [copied, setCopied] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isPolling, setIsPolling] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  // Polling reference
  const pollingRef = React.useRef<NodeJS.Timeout | null>(null);
  
  // Parse numeric amount
  const numericAmount = React.useMemo(() => {
    const digits = amount.replace(/\D/g, '');
    return parseInt(digits || '0', 10) / 100;
  }, [amount]);
  
  // Create deposit
  const handleContinue = async () => {
    if (numericAmount < 10) {
      setError(t('minAmount'));
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post<{ success: boolean; data: DepositResponse }>('/wallet/deposit/fiat', {
        amount: numericAmount,
        currency: 'BRL'
      });
      
      if (response.data.success) {
        setDeposit(response.data.data);
        setDepositStatus('pending');
        setStep('qrcode');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('errorCreating');
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Copy PIX code
  const handleCopy = async () => {
    if (deposit?.pixCode) {
      try {
        await navigator.clipboard.writeText(deposit.pixCode);
        setCopied(true);
        toast.success(t('copied'));
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error(t('copyError'));
      }
    }
  };
  
  // Go back to amount step
  const handleBack = () => {
    stopPolling();
    setStep('amount');
    setDeposit(null);
    setDepositStatus('pending');
  };
  
  // Confirm and start polling
  const handleConfirm = () => {
    setStep('status');
    startPolling();
  };
  
  // Start polling for status updates
  const startPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
    
    setIsPolling(true);
    
    // Poll every 5 seconds
    pollingRef.current = setInterval(async () => {
      if (!deposit?.id) return;
      
      try {
        const response = await api.get<{ success: boolean; data: TransactionStatusResponse }>(
          `/wallet/deposit/status/${deposit.id}`
        );
        
        if (response.data.success) {
          const status = response.data.data.status;
          setDepositStatus(status);
          
          // Stop polling if terminal status
          if (['completed', 'failed', 'expired'].includes(status)) {
            stopPolling();
            
            if (status === 'completed') {
              toast.success(t('completed'));
            }
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 5000);
  };
  
  // Stop polling
  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setIsPolling(false);
  };
  
  // New deposit
  const handleNewDeposit = () => {
    stopPolling();
    setStep('amount');
    setDeposit(null);
    setDepositStatus('pending');
    setAmount('');
  };
  
  // Go to dashboard
  const handleGoToDashboard = () => {
    stopPolling();
    const currentPath = window.location.pathname;
    const locale = currentPath.split('/')[1];
    router.push(`/${locale}/dashboard`);
  };
  
  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);
  
  // Animation variants
  const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-lg mx-auto"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title={t('title')}
          description={t('selectMethod')}
        />
      </motion.div>
      
      {/* Step Content */}
      <motion.div variants={itemVariants}>
        <AnimatePresence mode="wait">
          {step === 'amount' && (
            <AmountInput
              value={amount}
              onChange={setAmount}
              onContinue={handleContinue}
              isLoading={isLoading}
              error={error || undefined}
            />
          )}
          
          {step === 'qrcode' && (
            <QRCodeDisplay
              deposit={deposit}
              isLoading={isLoading}
              copied={copied}
              onCopy={handleCopy}
              onBack={handleBack}
              onConfirm={handleConfirm}
            />
          )}
          
          {step === 'status' && (
            isPolling ? (
              <StatusTracker
                status={depositStatus}
                amount={deposit?.amount || numericAmount}
                onNewDeposit={handleNewDeposit}
                onGoToDashboard={handleGoToDashboard}
              />
            ) : (
              <StatusTrackerSkeleton />
            )
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
