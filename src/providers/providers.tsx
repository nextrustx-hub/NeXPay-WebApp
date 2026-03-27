'use client';

import { useEffect, useState, useCallback } from 'react';
import { ThemeProvider } from 'next-themes';
import { NextIntlClientProvider } from 'next-intl';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { useThemeStore } from '@/store/auth-store';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on 401/403 errors
        const status = (error as Error & { status?: number }).status;
        if (status === 401 || status === 403) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, unknown>;
}

export function Providers({ children, locale, messages }: ProvidersProps) {
  const [mounted, setMounted] = useState(false);
  
  // Get theme from store - use callback to avoid setState in effect
  const initializeTheme = useCallback(() => {
    const store = useThemeStore.getState();
    if (store.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      document.documentElement.classList.toggle('dark', store.theme === 'dark');
    }
  }, []);

  // Handle initial mount
  useEffect(() => {
    // Defer state update to next tick to avoid cascading renders
    const timer = setTimeout(() => {
      setMounted(true);
      initializeTheme();
    }, 0);
    
    return () => clearTimeout(timer);
  }, [initializeTheme]);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <QueryClientProvider client={queryClient}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </NextIntlClientProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </NextIntlClientProvider>
    </QueryClientProvider>
  );
}

// Export query client for use in mutations
export { queryClient };
