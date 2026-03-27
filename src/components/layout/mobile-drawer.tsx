'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  PlusCircle,
  ArrowUpCircle,
  FileText,
  Code,
  User,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/auth-store';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface NavItem {
  key: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { key: 'dashboard', href: '/dashboard', icon: Home },
  { key: 'deposit', href: '/deposit', icon: PlusCircle },
  { key: 'withdraw', href: '/withdraw', icon: ArrowUpCircle },
  { key: 'transactions', href: '/transactions', icon: FileText },
  { key: 'apiIntegrations', href: '/api-integrations', icon: Code },
  { key: 'profile', href: '/profile', icon: User },
  { key: 'settings', href: '/settings', icon: Settings },
];

interface MobileDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileDrawer({ isOpen, onOpenChange }: MobileDrawerProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();

  const currentLocale = pathname.split('/')[1] || 'pt-BR';

  const handleNavigation = (href: string) => {
    router.push(`/${currentLocale}${href}`);
    onOpenChange(false);
  };

  const isActive = (href: string) => {
    const fullPath = `/${currentLocale}${href}`;
    if (href === '/dashboard') {
      return pathname === fullPath || pathname === `/${currentLocale}`;
    }
    return pathname === fullPath || pathname.startsWith(`${fullPath}/`);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} direction="left">
      <DrawerContent className="h-screen w-72 max-w-[85vw] rounded-none border-r">
        <DrawerHeader className="border-b px-4 py-3">
          <DrawerTitle asChild>
            <VisuallyHidden>Navigation Menu</VisuallyHidden>
          </DrawerTitle>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-lg tracking-tight">NeXPay</span>
                <span className="text-xs text-muted-foreground">Digital Banking</span>
              </div>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {/* User Info */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatarUrl} alt={user?.name} />
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              {user?.name ? getInitials(user.name) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">
              {user?.name || 'User'}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {user?.email || 'user@example.com'}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-2 py-2">
          <AnimatePresence mode="wait">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <motion.button
                  key={item.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleNavigation(item.href)}
                  className={`relative w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{t(item.key)}</span>
                  {active && (
                    <motion.div
                      layoutId="mobileActiveIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-r-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </nav>

        {/* Footer */}
        <div className="border-t px-4 py-3">
          <p className="text-xs text-muted-foreground text-center">
            © 2024 NeXPay. All rights reserved.
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// Mobile Menu Button Component
export function MobileMenuButton({ 
  onClick 
}: { 
  onClick: () => void 
}) {
  return (
    <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden" onClick={onClick}>
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle menu</span>
    </Button>
  );
}
