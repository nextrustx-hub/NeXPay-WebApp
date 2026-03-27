'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Key, Hash, Mail, Phone, Shuffle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';

export type PixKeyType = 'CPF' | 'EMAIL' | 'PHONE' | 'EVP';

interface PixKeyInputProps {
  pixKey: string;
  pixKeyType: PixKeyType | '';
  onPixKeyChange: (value: string) => void;
  onPixKeyTypeChange: (value: PixKeyType) => void;
  error?: string;
}

// Validation functions
const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return false;
  
  // Check for all same digits
  if (/^(\d)\1+$/.test(cleanCPF)) return false;
  
  // Validate check digits
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i], 10) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF[9], 10)) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i], 10) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF[10], 10)) return false;
  
  return true;
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 13;
};

const validateEVP = (evp: string): boolean => {
  // UUID format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(evp);
};

export const validatePixKey = (key: string, type: PixKeyType): boolean => {
  if (!key || !type) return false;
  
  switch (type) {
    case 'CPF':
      return validateCPF(key);
    case 'EMAIL':
      return validateEmail(key);
    case 'PHONE':
      return validatePhone(key);
    case 'EVP':
      return validateEVP(key);
    default:
      return false;
  }
};

export function PixKeyInput({
  pixKey,
  pixKeyType,
  onPixKeyChange,
  onPixKeyTypeChange,
  error,
}: PixKeyInputProps) {
  const t = useTranslations('withdraw');
  const [localError, setLocalError] = useState('');

  // Format CPF as user types
  const formatCPF = useCallback((value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  }, []);

  // Format phone as user types
  const formatPhone = useCallback((value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }, []);

  // Handle input change with formatting
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    if (pixKeyType === 'CPF') {
      value = formatCPF(value);
    } else if (pixKeyType === 'PHONE') {
      value = formatPhone(value);
    }
    
    onPixKeyChange(value);
    setLocalError('');
  };

  // Get placeholder based on type
  const getPlaceholder = () => {
    switch (pixKeyType) {
      case 'CPF':
        return '000.000.000-00';
      case 'EMAIL':
        return 'seu@email.com';
      case 'PHONE':
        return '(00) 00000-0000';
      case 'EVP':
        return '00000000-0000-0000-0000-000000000000';
      default:
        return t('enterPixKey');
    }
  };

  // Get icon based on type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CPF':
        return <Hash className="h-4 w-4" />;
      case 'EMAIL':
        return <Mail className="h-4 w-4" />;
      case 'PHONE':
        return <Phone className="h-4 w-4" />;
      case 'EVP':
        return <Shuffle className="h-4 w-4" />;
      default:
        return <Key className="h-4 w-4" />;
    }
  };

  // Get max length based on type
  const getMaxLength = () => {
    switch (pixKeyType) {
      case 'CPF':
        return 14;
      case 'PHONE':
        return 16;
      case 'EVP':
        return 36;
      default:
        return 255;
    }
  };

  const pixKeyTypes: { value: PixKeyType; label: string; icon: React.ReactNode }[] = [
    { value: 'CPF', label: t('cpf'), icon: <Hash className="h-4 w-4" /> },
    { value: 'EMAIL', label: t('email'), icon: <Mail className="h-4 w-4" /> },
    { value: 'PHONE', label: t('phone'), icon: <Phone className="h-4 w-4" /> },
    { value: 'EVP', label: t('randomKey'), icon: <Shuffle className="h-4 w-4" /> },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          {t('pixKey')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* PIX Key Type Selector */}
        <div className="space-y-2">
          <Label>{t('pixKeyType')}</Label>
          <Select
            value={pixKeyType}
            onValueChange={(value) => {
              onPixKeyTypeChange(value as PixKeyType);
              onPixKeyChange(''); // Reset key when type changes
              setLocalError('');
            }}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione o tipo de chave" />
            </SelectTrigger>
            <SelectContent>
              {pixKeyTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    {type.icon}
                    <span>{type.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* PIX Key Input */}
        <AnimatePresence mode="wait">
          {pixKeyType && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              <Label htmlFor="pixKey">{t('enterPixKey')}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {getTypeIcon(pixKeyType)}
                </span>
                <Input
                  id="pixKey"
                  type={pixKeyType === 'EMAIL' ? 'email' : 'text'}
                  inputMode={pixKeyType === 'PHONE' || pixKeyType === 'CPF' ? 'numeric' : 'text'}
                  placeholder={getPlaceholder()}
                  value={pixKey}
                  onChange={handleInputChange}
                  maxLength={getMaxLength()}
                  className={`pl-10 ${error || localError ? 'border-destructive' : ''}`}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {(error || localError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 text-sm text-destructive"
            >
              <AlertCircle className="h-4 w-4" />
              <span>{error || localError}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
