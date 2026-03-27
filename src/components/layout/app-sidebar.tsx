'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home,
  PlusCircle,
  ArrowUpCircle,
  FileText,
  Code,
  User,
  Settings,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/auth-store';
import { useSidebar } from '@/components/ui/sidebar';

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

export function AppSidebar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const { state, isMobile, setOpenMobile } = useSidebar();

  const currentLocale = pathname.split('/')[1] || 'pt-BR';

  const handleNavigation = (href: string) => {
    router.push(`/${currentLocale}${href}`);
    if (isMobile) {
      setOpenMobile(false);
    }
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

  const isCollapsed = state === 'collapsed' && !isMobile;

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      {/* Header with Logo */}
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shrink-0"
          >
            <span className="text-white font-bold text-lg">N</span>
          </motion.div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col"
            >
              <span className="font-semibold text-lg tracking-tight">NeXPay</span>
              <span className="text-xs text-muted-foreground">
                Digital Banking
              </span>
            </motion.div>
          )}
        </div>
      </SidebarHeader>

      {/* Navigation Items */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      isActive={active}
                      onClick={() => handleNavigation(item.href)}
                      tooltip={t(item.key)}
                      className="relative"
                    >
                      <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Icon className="h-4 w-4" />
                      </motion.div>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 + 0.1 }}
                        >
                          {t(item.key)}
                        </motion.span>
                      )}
                      {active && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-r-full"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with User Info */}
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={user?.avatarUrl} alt={user?.name} />
            <AvatarFallback className="text-xs bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              {user?.name ? getInitials(user.name) : 'U'}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col min-w-0"
            >
              <span className="text-sm font-medium truncate">
                {user?.name || 'User'}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {user?.email || 'user@example.com'}
              </span>
            </motion.div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
