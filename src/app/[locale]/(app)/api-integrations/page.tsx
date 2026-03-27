'use client';

import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Code,
  Key,
  Webhook,
  Plus,
  Copy,
  CheckCircle2,
  ExternalLink,
  Trash2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Send,
  Clock,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/axios';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { APIKey, WebhookConfig, WebhookEvent } from '@/lib/api-types';

// ============================================
// Types
// ============================================

interface CreateAPIKeyResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    key: string;
    createdAt: string;
  };
}

// ============================================
// Skeleton Components
// ============================================

function APIKeySkeleton() {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WebhookSkeleton() {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Empty States
// ============================================

function NoAPIKeysState({ onCreate }: { onCreate: () => void }) {
  const t = useTranslations('apiIntegrations');
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold text-lg mb-2">{t('noApiKeys')}</h3>
        <p className="text-muted-foreground mb-4">
          Crie uma chave de API para integrar com seus sistemas
        </p>
        <Button onClick={onCreate} className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
          <Plus className="h-4 w-4" />
          {t('createApiKey')}
        </Button>
      </CardContent>
    </Card>
  );
}

function NoWebhooksState({ onCreate }: { onCreate: () => void }) {
  const t = useTranslations('apiIntegrations');
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <Webhook className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold text-lg mb-2">{t('noWebhooks')}</h3>
        <p className="text-muted-foreground mb-4">
          Configure um webhook para receber notificações em tempo real
        </p>
        <Button onClick={onCreate} className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
          <Plus className="h-4 w-4" />
          {t('createWebhook')}
        </Button>
      </CardContent>
    </Card>
  );
}

// ============================================
// Main Component
// ============================================

export default function ApiIntegrationsPage() {
  const t = useTranslations('apiIntegrations');
  const queryClient = useQueryClient();

  // State
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [showGeneratedKey, setShowGeneratedKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [showWebhookDialog, setShowWebhookDialog] = useState(false);

  // ============================================
  // API Keys Queries
  // ============================================

  const {
    data: apiKeys,
    isLoading: isLoadingKeys,
    isFetching: isFetchingKeys,
    error: keysError,
    refetch: refetchKeys,
  } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async (): Promise<APIKey[]> => {
      const response = await api.get<{ success: boolean; data: APIKey[] }>('/b2b/api-keys');
      return response.data.success ? response.data.data : [];
    },
    staleTime: 30000,
  });

  // Create API Key Mutation
  const createKeyMutation = useMutation({
    mutationFn: async (name: string): Promise<CreateAPIKeyResponse> => {
      const response = await api.post<CreateAPIKeyResponse>('/b2b/api-keys/generate', { name });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        setGeneratedKey(data.data.key);
        setShowKeyDialog(false);
        setShowGeneratedKey(true);
        setNewKeyName('');
        queryClient.invalidateQueries({ queryKey: ['api-keys'] });
        toast.success('Chave de API criada com sucesso!');
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar chave');
    },
  });

  // Revoke API Key Mutation
  const revokeKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      await api.delete(`/b2b/api-keys/${keyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('Chave revogada com sucesso');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao revogar chave');
    },
  });

  // ============================================
  // Webhooks Queries
  // ============================================

  const {
    data: webhooks,
    isLoading: isLoadingWebhooks,
    isFetching: isFetchingWebhooks,
    error: webhooksError,
    refetch: refetchWebhooks,
  } = useQuery({
    queryKey: ['webhooks'],
    queryFn: async (): Promise<WebhookConfig[]> => {
      const response = await api.get<{ success: boolean; data: WebhookConfig[] }>('/b2b/webhooks');
      return response.data.success ? response.data.data : [];
    },
    staleTime: 30000,
  });

  // Create Webhook Mutation
  const createWebhookMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await api.post('/b2b/webhooks/config', { webhook_url: url });
      return response.data;
    },
    onSuccess: () => {
      setShowWebhookDialog(false);
      setWebhookUrl('');
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Webhook configurado com sucesso!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao configurar webhook');
    },
  });

  // Test Webhook Mutation
  const testWebhookMutation = useMutation({
    mutationFn: async (webhookId: string) => {
      const response = await api.post(`/b2b/webhooks/${webhookId}/test`);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Webhook testado com sucesso!');
      } else {
        toast.error('Falha no teste do webhook');
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao testar webhook');
    },
  });

  // Delete Webhook Mutation
  const deleteWebhookMutation = useMutation({
    mutationFn: async (webhookId: string) => {
      await api.delete(`/b2b/webhooks/${webhookId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Webhook removido com sucesso');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao remover webhook');
    },
  });

  // ============================================
  // Handlers
  // ============================================

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    toast.success(t('keyCopied'));
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      toast.error('Informe um nome para a chave');
      return;
    }
    createKeyMutation.mutate(newKeyName.trim());
  };

  const handleCreateWebhook = () => {
    if (!webhookUrl.trim()) {
      toast.error('Informe a URL do webhook');
      return;
    }
    try {
      new URL(webhookUrl);
    } catch {
      toast.error('URL inválida');
      return;
    }
    createWebhookMutation.mutate(webhookUrl.trim());
  };

  // Animation variants
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

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Title */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">
            Gerencie suas chaves de API e webhooks
          </p>
        </div>
        <Button variant="outline" className="gap-2" disabled>
          <ExternalLink className="h-4 w-4" />
          {t('documentation')}
        </Button>
      </motion.div>

      {/* Generated Key Display Dialog */}
      <Dialog open={showGeneratedKey} onOpenChange={setShowGeneratedKey}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-emerald-500" />
              Chave de API Criada
            </DialogTitle>
            <DialogDescription>
              Guarde esta chave em local seguro. Ela será exibida apenas uma vez.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Importante:</strong> Copie a chave agora. Por motivos de segurança, 
                  não será possível visualizá-la novamente.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type={showGeneratedKey ? 'text' : 'password'}
                  value={generatedKey || ''}
                  readOnly
                  className="font-mono text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowGeneratedKey(!showGeneratedKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showGeneratedKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button
                variant="outline"
                onClick={() => generatedKey && handleCopyKey(generatedKey)}
              >
                {copiedKey === generatedKey ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowGeneratedKey(false)}>
              Entendi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="keys" className="space-y-6">
        <TabsList>
          <TabsTrigger value="keys" className="gap-2">
            <Key className="h-4 w-4" />
            {t('apiKeys')}
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-2">
            <Webhook className="h-4 w-4" />
            {t('webhooks')}
          </TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
        <TabsContent value="keys">
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {isFetchingKeys && (
                  <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              <Dialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                    <Plus className="h-4 w-4" />
                    {t('createApiKey')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nova Chave de API</DialogTitle>
                    <DialogDescription>
                      Crie uma nova chave para acessar a API do NeXPay
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="keyName">Nome da chave</Label>
                      <Input
                        id="keyName"
                        placeholder="Ex: Produção, Testes, Integração..."
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowKeyDialog(false)}>
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleCreateKey}
                      disabled={createKeyMutation.isPending}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                    >
                      {createKeyMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Criando...
                        </>
                      ) : (
                        'Criar chave'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Loading State */}
            {isLoadingKeys && (
              <div className="space-y-4">
                <APIKeySkeleton />
                <APIKeySkeleton />
              </div>
            )}

            {/* Error State */}
            {keysError && !isLoadingKeys && (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Erro ao carregar chaves</h3>
                  <p className="text-muted-foreground mb-4">
                    Não foi possível carregar suas chaves de API.
                  </p>
                  <Button variant="outline" onClick={() => refetchKeys()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Tentar novamente
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!isLoadingKeys && !keysError && apiKeys?.length === 0 && (
              <NoAPIKeysState onCreate={() => setShowKeyDialog(true)} />
            )}

            {/* API Keys List */}
            {!isLoadingKeys && !keysError && apiKeys && apiKeys.length > 0 && (
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <Card key={apiKey.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <Code className="h-5 w-5 text-emerald-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{apiKey.name}</p>
                              <Badge
                                variant="secondary"
                                className={
                                  apiKey.status === 'active'
                                    ? 'bg-emerald-500/10 text-emerald-600'
                                    : 'bg-red-500/10 text-red-600'
                                }
                              >
                                {apiKey.status === 'active' ? t('active') : 'Revogada'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                              <p className="text-sm text-muted-foreground font-mono">
                                {apiKey.prefix}••••••••••••••••
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Criada em {formatDate(apiKey.createdAt)}
                              </p>
                              {apiKey.lastUsedAt && (
                                <p className="text-xs text-muted-foreground">
                                  Último uso: {formatDate(apiKey.lastUsedAt)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {apiKey.status === 'active' && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  {t('revoke')}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Revogar chave de API</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja revogar esta chave? Esta ação é irreversível e
                                    qualquer integração que utilize esta chave deixará de funcionar.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => revokeKeyMutation.mutate(apiKey.id)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Revogar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks">
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {isFetchingWebhooks && (
                  <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                    <Plus className="h-4 w-4" />
                    {t('createWebhook')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Configurar Webhook</DialogTitle>
                    <DialogDescription>
                      Receba notificações em tempo real sobre eventos da sua conta
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="webhookUrl">URL do webhook</Label>
                      <Input
                        id="webhookUrl"
                        type="url"
                        placeholder="https://seu-servidor.com/webhook"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        URL HTTPS que receberá as notificações via POST
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowWebhookDialog(false)}>
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleCreateWebhook}
                      disabled={createWebhookMutation.isPending}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                    >
                      {createWebhookMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Configurando...
                        </>
                      ) : (
                        'Configurar'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Loading State */}
            {isLoadingWebhooks && (
              <div className="space-y-4">
                <WebhookSkeleton />
              </div>
            )}

            {/* Error State */}
            {webhooksError && !isLoadingWebhooks && (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Erro ao carregar webhooks</h3>
                  <p className="text-muted-foreground mb-4">
                    Não foi possível carregar seus webhooks.
                  </p>
                  <Button variant="outline" onClick={() => refetchWebhooks()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Tentar novamente
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!isLoadingWebhooks && !webhooksError && webhooks?.length === 0 && (
              <NoWebhooksState onCreate={() => setShowWebhookDialog(true)} />
            )}

            {/* Webhooks List */}
            {!isLoadingWebhooks && !webhooksError && webhooks && webhooks.length > 0 && (
              <div className="space-y-4">
                {webhooks.map((webhook) => (
                  <Card key={webhook.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Webhook className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium font-mono text-sm">{webhook.url}</p>
                              <Badge
                                variant="secondary"
                                className={
                                  webhook.status === 'active'
                                    ? 'bg-emerald-500/10 text-emerald-600'
                                    : 'bg-gray-500/10 text-gray-600'
                                }
                              >
                                {webhook.status === 'active' ? t('active') : t('inactive')}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {webhook.events.map((event) => (
                                  <Badge key={event} variant="outline" className="text-xs">
                                    {t(`events.${event}`)}
                                  </Badge>
                                ))}
                              </div>
                              {webhook.lastTriggeredAt && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Último disparo: {formatDate(webhook.lastTriggeredAt)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testWebhookMutation.mutate(webhook.id)}
                            disabled={testWebhookMutation.isPending}
                          >
                            {testWebhookMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                            <span className="ml-2">{t('testWebhook')}</span>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover webhook</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja remover este webhook? Você deixará de receber
                                  notificações nesta URL.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteWebhookMutation.mutate(webhook.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
