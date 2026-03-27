'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Copy, CheckCircle2, Clock, AlertCircle, Shield, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DepositData {
  id: string;
  qrCode?: string; // Base64 image
  pixCode: string;
  amount: number;
  status: string;
  expiresAt: string;
}

interface QRCodeDisplayProps {
  deposit: DepositData | null;
  isLoading?: boolean;
  copied: boolean;
  onCopy: () => void;
  onBack: () => void;
  onConfirm: () => void;
}

// Countdown timer component
function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const t = useTranslations('deposit');
  const [timeLeft, setTimeLeft] = React.useState({ minutes: 0, seconds: 0 });
  
  React.useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const difference = expiry - now;
      
      if (difference > 0) {
        setTimeLeft({
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };
    
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, [expiresAt]);
  
  const isExpiringSoon = timeLeft.minutes < 5;
  
  return (
    <div className={cn(
      "flex items-center gap-2 justify-center text-sm font-medium",
      isExpiringSoon ? "text-amber-500" : "text-muted-foreground"
    )}>
      <Clock className="h-4 w-4" />
      <span>{t('expiresIn')}: </span>
      <span className={cn("tabular-nums", isExpiringSoon && "text-amber-500")}>
        {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
}

export function QRCodeDisplay({ 
  deposit, 
  isLoading, 
  copied, 
  onCopy, 
  onBack,
  onConfirm 
}: QRCodeDisplayProps) {
  const t = useTranslations('deposit');
  
  // Format amount to BRL
  const formattedAmount = deposit?.amount 
    ? deposit.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : 'R$ 0,00';
  
  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="text-center">
          <Skeleton className="h-7 w-48 mx-auto" />
          <Skeleton className="h-5 w-32 mx-auto mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <Skeleton className="h-52 w-52 rounded-xl" />
          </div>
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-11 w-full" />
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
          <CardTitle className="text-xl">{t('scanQrCode')}</CardTitle>
          <div className="flex items-center justify-center gap-2 mt-1">
            <Badge variant="secondary" className="text-base font-semibold px-3 py-1">
              {formattedAmount}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="relative p-4 bg-white rounded-xl shadow-inner border">
              {deposit?.qrCode ? (
                // Use API-provided QR code image
                <img 
                  src={`data:image/png;base64,${deposit.qrCode}`} 
                  alt="QR Code PIX"
                  className="w-48 h-48"
                />
              ) : (
                // Generate QR code from PIX code
                <div className="w-48 h-48 flex items-center justify-center">
                  {deposit?.pixCode ? (
                    <QRCodeSVG 
                      value={deposit.pixCode}
                      size={192}
                      level="H"
                      includeMargin={false}
                      bgColor="#ffffff"
                      fgColor="#000000"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <AlertCircle className="h-12 w-12" />
                      <span className="text-sm">QR Code não disponível</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Overlay decoration */}
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-emerald-500 rounded-tl" />
              <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-emerald-500 rounded-tr" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-emerald-500 rounded-bl" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-emerald-500 rounded-br" />
            </div>
          </div>
          
          {/* Expiration Timer */}
          {deposit?.expiresAt && (
            <CountdownTimer expiresAt={deposit.expiresAt} />
          )}
          
          {/* PIX Code Copy Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
              <Smartphone className="h-4 w-4" />
              <span>{t('orCopyCode')}</span>
            </div>
            
            <div className="relative">
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
                <code className="flex-1 text-xs font-mono truncate text-muted-foreground">
                  {deposit?.pixCode || 'Código PIX não disponível'}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCopy}
                  className={cn(
                    "shrink-0 transition-all duration-200",
                    copied && "bg-emerald-100 dark:bg-emerald-900"
                  )}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-1" />
                      <span className="text-emerald-600 dark:text-emerald-400">{t('copied')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      {t('copyCode')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Security Notice */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2">
            <Shield className="h-3 w-3 text-emerald-500" />
            <span>Pagamento seguro via PIX</span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              size="lg"
              onClick={onBack}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('back')}
            </Button>
            <Button
              size="lg"
              onClick={onConfirm}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              {t('confirm')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
