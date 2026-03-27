'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Header } from '@/components/layout/header';
import { MobileDrawer, MobileMenuButton } from '@/components/layout/mobile-drawer';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen w-full bg-background">
        {/* Desktop Sidebar */}
        <AppSidebar />
        
        {/* Main Content Area */}
        <SidebarInset className="flex flex-col min-h-screen">
          {/* Header with mobile menu button */}
          <div className="flex items-center">
            {isMobile && (
              <MobileMenuButton onClick={() => setMobileDrawerOpen(true)} />
            )}
            <div className="flex-1">
              <Header />
            </div>
          </div>
          
          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </main>
          
          {/* Footer */}
          <footer className="border-t py-4 px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
              <p>© 2024 NeXPay. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <a href="#" className="hover:text-foreground transition-colors">
                  Terms
                </a>
                <a href="#" className="hover:text-foreground transition-colors">
                  Privacy
                </a>
                <a href="#" className="hover:text-foreground transition-colors">
                  Support
                </a>
              </div>
            </div>
          </footer>
        </SidebarInset>
        
        {/* Mobile Drawer */}
        {isMobile && (
          <MobileDrawer
            isOpen={mobileDrawerOpen}
            onOpenChange={setMobileDrawerOpen}
          />
        )}
      </div>
    </SidebarProvider>
  );
}
