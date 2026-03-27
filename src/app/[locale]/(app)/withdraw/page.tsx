'use client';

import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AmountInput } from '@/components/withdraw/amount-input';
import { PixKeyInput, validatePixKey, type PixKeyType } from '@/components/withdraw/pix-key-input';
import { FeePreview, type FeeSimulation } from '@/components/withdraw/fee-preview';
import { Confirmation, type WithdrawResult } from '@/components/withdraw/confirmation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { useBalance } from '@/hooks/use-auth';
import { api } from '@/lib/axios';

type Step = 'input' | 'preview' | 'confirmation';

// API response types
interface SimulateResponse {
  requestedAmount: number;
  fee: number;
  netAmount: number;
  currency: string;
}

interface WithdrawApiResponse {
  transactionId: string;
  status: string;
  amount: number;
  fee: number;
  netAmount: number;
  pixKey: string;
  pixKeyType: string;
}

export default function WithdrawPage() {
  const t = useTranslations('withdraw');
  const router = useRouter();
  const { balance, isLoading: isLoadingBalance, refetch: refetchBalance } = useBalance();

  // Form state
  const [step, setStep] = useState<Step>('input');
  const [amount, setAmount] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState<PixKeyType | ''>('');

  // API state
  const [simulation, setSimulation] = useState<FeeSimulation | null>(null);
  const [isLoadingSimulation, setIsLoadingSimulation] = useState(false);
  const [simulationError, setSimulationError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<WithdrawResult | null>(null);

  // Validation state
  const [amountError, setAmountError] = useState('');
  const [pixKeyError, setPixKeyError] = useState('');

  // Available balance from API
  const availableBalance = balance?.available ?? null;

  // Minimum and maximum amounts
  const MIN_AMOUNT = 20;
  const MAX_AMOUNT = 10000;

  // Clear errors when inputs change
  useEffect(() => {
    setAmountError('');
  }, [amount]);

  useEffect(() => {
    setPixKeyError('');
  }, [pixKey, pixKeyType]);

  // Validate step 1 inputs
  const validateInputs = useCallback(() => {
    const numericAmount = parseFloat(amount || '0');
    let isValid = true;

    // Validate amount
    if (!amount || numericAmount < MIN_AMOUNT) {
      setAmountError(`${t('minAmountError') || 'Valor mínimo: R$'} ${MIN_AMOUNT.toFixed(2).replace('.', ',')}`);
      isValid = false;
    } else if (numericAmount > MAX_AMOUNT) {
      setAmountError(`${t('maxAmountError') || 'Valor máximo: R$'} ${MAX_AMOUNT.toFixed(2).replace('.', ',')}`);
      isValid = false;
    } else if (availableBalance !== null && numericAmount > availableBalance) {
      setAmountError(t('insufficientBalance'));
      isValid = false;
    }

    // Validate PIX key type
    if (!pixKeyType) {
      setPixKeyError(t('selectPixKeyType') || 'Selecione o tipo de chave PIX');
      isValid = false;
    } else if (!pixKey) {
      setPixKeyError(t('enterPixKey'));
      isValid = false;
    } else if (!validatePixKey(pixKey, pixKeyType)) {
      setPixKeyError(t('invalidPixKey') || 'Chave PIX inválida');
      isValid = false;
    }

    return isValid;
  }, [amount, pixKey, pixKeyType, availableBalance, t]);

  // Fetch fee simulation from API
  const fetchSimulation = useCallback(async () => {
    if (!validateInputs()) return;

    setIsLoadingSimulation(true);
    setSimulationError(null);

    try {
      const numericAmount = parseFloat(amount);
      const response = await api.get<SimulateResponse>('/quotes/simulate', {
        params: {
          type: 'withdraw',
          amount: numericAmount,
          currencyFiat: 'BRL',
        },
      });

      setSimulation({
        requestedAmount: response.data.requestedAmount,
        fee: response.data.fee,
        netAmount: response.data.netAmount,
        currency: response.data.currency,
      });
      setStep('preview');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao simular saque';
      setSimulationError(message);
      toast.error(message);
    } finally {
      setIsLoadingSimulation(false);
    }
  }, [amount, validateInputs]);

  // Execute withdraw
  const executeWithdraw = useCallback(async () => {
    if (!simulation || !pixKeyType) return;

    setIsProcessing(true);

    try {
      const response = await api.post<WithdrawApiResponse>('/wallet/withdraw/fiat', {
        amount: simulation.requestedAmount,
        currency: 'BRL',
        pixKey: pixKey,
        pixKeyType: pixKeyType,
      });

      setResult({
        success: true,
        transactionId: response.data.transactionId,
        amount: response.data.amount,
        fee: response.data.fee,
        netAmount: response.data.netAmount,
        pixKey: response.data.pixKey,
        pixKeyType: response.data.pixKeyType,
        status: response.data.status,
      });
      setStep('confirmation');

      // Refresh balance after successful withdraw
      refetchBalance();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao processar saque';
      setResult({
        success: false,
        error: message,
      });
      setStep('confirmation');
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  }, [simulation, pixKey, pixKeyType, refetchBalance]);

  // Go back to input step
  const handleBack = useCallback(() => {
    setStep('input');
    setSimulation(null);
    setSimulationError(null);
  }, []);

  // Start new withdraw
  const handleNewWithdraw = useCallback(() => {
    setStep('input');
    setAmount('');
    setPixKey('');
    setPixKeyType('');
    setSimulation(null);
    setSimulationError(null);
    setResult(null);
    setAmountError('');
    setPixKeyError('');
  }, []);

  // Go to dashboard
  const handleGoToDashboard = useCallback(() => {
    const currentPath = window.location.pathname;
    const locale = currentPath.split('/')[1];
    const isValidLocale = ['pt-BR', 'fr', 'en', 'es'].includes(locale);
    const basePath = isValidLocale ? `/${locale}` : '';
    router.push(`${basePath}/dashboard`);
  }, [router]);

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-2xl mx-auto"
    >
      {/* Page Title */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('selectMethod')}</p>
      </motion.div>

      {/* Step Indicator */}
      <motion.div variants={itemVariants} className="flex items-center gap-2">
        {[1, 2, 3].map((stepNum) => (
          <div
            key={stepNum}
            className={`flex items-center ${
              stepNum < 3 ? 'flex-1' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                (step === 'input' && stepNum === 1) ||
                (step === 'preview' && stepNum === 2) ||
                (step === 'confirmation' && stepNum === 3)
                  ? 'bg-emerald-500 text-white'
                  : (step === 'preview' && stepNum === 1) ||
                    (step === 'confirmation' && (stepNum === 1 || stepNum === 2))
                  ? 'bg-emerald-500/20 text-emerald-600'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {stepNum}
            </div>
            {stepNum < 3 && (
              <div
                className={`flex-1 h-0.5 mx-2 transition-colors ${
                  (step === 'preview' && stepNum === 1) ||
                  (step === 'confirmation' && stepNum <= 2)
                    ? 'bg-emerald-500'
                    : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </motion.div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {/* Step 1: Input */}
        {step === 'input' && (
          <motion.div
            key="input"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            {/* Amount Input Card */}
            <AmountInput
              amount={amount}
              onAmountChange={setAmount}
              availableBalance={availableBalance}
              isLoadingBalance={isLoadingBalance}
              error={amountError}
            />

            {/* PIX Key Input Card */}
            <PixKeyInput
              pixKey={pixKey}
              pixKeyType={pixKeyType}
              onPixKeyChange={setPixKey}
              onPixKeyTypeChange={setPixKeyType}
              error={pixKeyError}
            />

            {/* Continue Button */}
            <Button
              onClick={fetchSimulation}
              disabled={
                !amount ||
                parseFloat(amount) < MIN_AMOUNT ||
                !pixKey ||
                !pixKeyType ||
                isLoadingSimulation
              }
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 h-12"
            >
              {isLoadingSimulation ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  {t('continue') || 'Continuar'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </motion.div>
        )}

        {/* Step 2: Preview */}
        {step === 'preview' && (
          <motion.div
            key="preview"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <FeePreview
              simulation={simulation}
              isLoading={isLoadingSimulation}
              error={simulationError}
              pixKeyType={pixKeyType}
              pixKeyDisplay={pixKey}
              onConfirm={executeWithdraw}
              onBack={handleBack}
              isProcessing={isProcessing}
            />
          </motion.div>
        )}

        {/* Step 3: Confirmation */}
        {step === 'confirmation' && (
          <motion.div
            key="confirmation"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Confirmation
              result={result}
              onNewWithdraw={handleNewWithdraw}
              onGoToDashboard={handleGoToDashboard}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Skeleton for initial load */}
      {isLoadingBalance && step === 'input' && !amount && (
        <motion.div
          variants={itemVariants}
          className="space-y-4"
        >
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </motion.div>
      )}
    </motion.div>
  );
}
