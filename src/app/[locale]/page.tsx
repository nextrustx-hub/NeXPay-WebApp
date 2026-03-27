'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  QrCode, 
  Shield, 
  Globe, 
  Zap,
  ChevronRight
} from 'lucide-react';

export default function HomePage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">NeXPay</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              {t('auth.login')}
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
              {t('auth.register')}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            {t('dashboard.welcome')}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            {t('dashboard.title')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">
              NeXPay
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Plataforma digital premium para operações financeiras em BRL. Transações PIX instantâneas, 
            seguras e com suporte multilíngue.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
              {t('auth.register')}
              <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
            <Button variant="outline" size="lg">
              {t('common.learnMore')}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                <ArrowDownLeft className="w-6 h-6 text-emerald-600" />
              </div>
              <CardTitle>{t('dashboard.deposit')}</CardTitle>
              <CardDescription>
                Deposite via PIX ou transferência bancária de forma instantânea
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-teal-500/10 flex items-center justify-center mb-4">
                <ArrowUpRight className="w-6 h-6 text-teal-600" />
              </div>
              <CardTitle>{t('dashboard.withdraw')}</CardTitle>
              <CardDescription>
                Saques rápidos para qualquer chave PIX ou conta bancária
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6 text-cyan-600" />
              </div>
              <CardTitle>{t('dashboard.pix')}</CardTitle>
              <CardDescription>
                QR Codes dinâmicos e pagamentos instantâneos via PIX
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-violet-500/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-violet-600" />
              </div>
              <CardTitle>{t('settings.security')}</CardTitle>
              <CardDescription>
                Autenticação de dois fatores e criptografia de ponta a ponta
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-amber-600" />
              </div>
              <CardTitle>{t('settings.language')}</CardTitle>
              <CardDescription>
                Suporte em português, inglês, francês e espanhol
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-rose-500/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-rose-600" />
              </div>
              <CardTitle>{t('apiIntegrations.title')}</CardTitle>
              <CardDescription>
                APIs completas para integração com seu negócio
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Balance Card Preview */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-2xl">
            <CardHeader>
              <CardDescription className="text-emerald-100">
                {t('dashboard.totalBalance')}
              </CardDescription>
              <CardTitle className="text-4xl font-bold text-white">
                R$ 12.450,00
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Skeleton className="h-4 w-20 bg-white/20" />
                <Skeleton className="h-4 w-24 bg-white/20" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 NeXPay. {t('settings.privacy')} · {t('settings.security')}</p>
        </div>
      </footer>
    </div>
  );
}
