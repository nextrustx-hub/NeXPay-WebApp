'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Wallet, CalendarIcon, Check, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/axios';
import { Link } from '@/i18n/routing';

// CPF formatting utility
function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
}

// CPF validation
function isValidCPF(cpf: string): boolean {
  const numbers = cpf.replace(/\D/g, '');
  
  if (numbers.length !== 11) return false;
  
  // Check for known invalid patterns
  if (/^(\d)\1+$/.test(numbers)) return false;
  
  // Validate check digits
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers[9])) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers[10])) return false;
  
  return true;
}

// Password strength calculator
function calculatePasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  
  if (score <= 1) return { score: 20, label: 'Muito fraca', color: 'bg-red-500' };
  if (score === 2) return { score: 40, label: 'Fraca', color: 'bg-orange-500' };
  if (score === 3) return { score: 60, label: 'Média', color: 'bg-yellow-500' };
  if (score === 4) return { score: 80, label: 'Forte', color: 'bg-emerald-500' };
  return { score: 100, label: 'Muito forte', color: 'bg-emerald-600' };
}

// Register form schema
const registerSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .refine((name) => name.trim().split(' ').length >= 2, {
      message: 'Informe seu nome completo',
    }),
  cpf: z
    .string()
    .min(1, 'CPF é obrigatório')
    .refine((cpf) => cpf.replace(/\D/g, '').length === 11, {
      message: 'CPF deve ter 11 dígitos',
    })
    .refine((cpf) => isValidCPF(cpf), {
      message: 'CPF inválido',
    }),
  birthDate: z
    .date({
      required_error: 'Data de nascimento é obrigatória',
      invalid_type_error: 'Data inválida',
    })
    .refine((date) => {
      const today = new Date();
      const minAge = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
      return date <= minAge;
    }, {
      message: 'Você deve ter pelo menos 18 anos',
    })
    .refine((date) => {
      const today = new Date();
      const maxAge = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
      return date >= maxAge;
    }, {
      message: 'Data de nascimento inválida',
    }),
  email: z
    .string()
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(8, 'A senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z
    .string()
    .min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { setAuth, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form setup
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      cpf: '',
      birthDate: undefined,
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = form.watch('password', '');
  const passwordStrength = calculatePasswordStrength(password);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Handle CPF input formatting
  const handleCPFChange = useCallback((value: string, onChange: (value: string) => void) => {
    const formatted = formatCPF(value);
    onChange(formatted);
  }, []);

  // Form submit handler
  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    
    try {
      const response = await api.post('/auth/register', {
        fullName: data.fullName,
        cpf: data.cpf.replace(/\D/g, ''),
        birthDate: format(data.birthDate, 'yyyy-MM-dd'),
        email: data.email,
        password: data.password,
        tier: 'WHITE',
      });

      if (response.data.success && response.data.data) {
        setAuth(response.data.data.token, response.data.data.user);
        toast.success(t('registerSuccess'));
        router.push('/dashboard');
      }
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : t('registerError');
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-6"
      >
        <div className="flex justify-center mb-4 sm:hidden">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Wallet className="w-7 h-7 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          {t('register')}
        </h1>
        <p className="text-muted-foreground text-sm">
          Crie sua conta gratuitamente
        </p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name Field */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('name')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Seu nome completo"
                      autoComplete="name"
                      disabled={isSubmitting}
                      className="h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CPF Field */}
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('cpfCnpj')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="000.000.000-00"
                      maxLength={14}
                      autoComplete="off"
                      disabled={isSubmitting}
                      className="h-11"
                      {...field}
                      onChange={(e) => handleCPFChange(e.target.value, field.onChange)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Birth Date Field */}
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('birthDate')}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "h-11 w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isSubmitting}
                        >
                          {field.value ? (
                            format(field.value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                          ) : (
                            "Selecione a data"
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        captionLayout="dropdown-buttons"
                        fromYear={1900}
                        toYear={new Date().getFullYear() - 18}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      autoComplete="email"
                      disabled={isSubmitting}
                      className="h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('password')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        className="h-11 pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                  
                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Força da senha:
                        </span>
                        <span className={cn(
                          "font-medium",
                          passwordStrength.score <= 40 && "text-red-500",
                          passwordStrength.score === 60 && "text-yellow-500",
                          passwordStrength.score >= 80 && "text-emerald-500"
                        )}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <Progress 
                        value={passwordStrength.score} 
                        className={cn("h-1.5", passwordStrength.color)}
                      />
                      <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {password.length >= 8 ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <X className="h-3 w-3 text-muted-foreground" />
                          )}
                          Mín. 8 caracteres
                        </div>
                        <div className="flex items-center gap-1">
                          {/[a-z]/.test(password) && /[A-Z]/.test(password) ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <X className="h-3 w-3 text-muted-foreground" />
                          )}
                          Maiúsculas e minúsculas
                        </div>
                        <div className="flex items-center gap-1">
                          {/\d/.test(password) ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <X className="h-3 w-3 text-muted-foreground" />
                          )}
                          Números
                        </div>
                        <div className="flex items-center gap-1">
                          {/[^a-zA-Z0-9]/.test(password) ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <X className="h-3 w-3 text-muted-foreground" />
                          )}
                          Caracteres especiais
                        </div>
                      </div>
                    </div>
                  )}
                </FormItem>
              )}
            />

            {/* Confirm Password Field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('confirmPassword')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        className="h-11 pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                t('register')
              )}
            </Button>
          </form>
        </Form>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-6 pt-6 border-t text-center"
      >
        <p className="text-sm text-muted-foreground">
          {t('hasAccount')}{' '}
          <Link
            href="/login"
            className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            {t('login')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
