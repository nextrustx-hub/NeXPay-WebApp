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
import { Button } from '@/components/ui/button';
import {
  MessageCircle,
  Mail,
  ExternalLink,
} from 'lucide-react';

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
          
          {/* Premium Footer */}
          <footer className="border-t border-white/10 bg-gradient-to-r from-[#121212] to-[#0D0D0D]">
            <div className="px-6 py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Copyright */}
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-gradient-to-br from-[#00E6C3] to-[#00FFD1] flex items-center justify-center">
                    <span className="text-xs font-bold text-[#0D0D0D]">N</span>
                  </div>
                  <p className="text-sm text-white/50">
                    © 2024 NeXPay. Todos os direitos reservados.
                  </p>
                </div>
                
                {/* Links and Support */}
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {/* Terms Link */}
                  <a
                    href="https://nextrustx.com/termos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/50 hover:text-[#00E6C3] transition-colors flex items-center gap-1"
                  >
                    Termos
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  
                  {/* Privacy Link */}
                  <a
                    href="https://nextrustx.com/privacidade"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/50 hover:text-[#00E6C3] transition-colors flex items-center gap-1"
                  >
                    Privacidade
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  
                  {/* Support Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#00E6C3]/30 text-[#00E6C3] hover:bg-[#00E6C3]/10 hover:border-[#00E6C3]/50 transition-all duration-200"
                    onClick={() => {
                      // Show support options
                      window.open('https://wa.me/15846665195', '_blank');
                    }}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Suporte
                  </Button>
                </div>
              </div>
              
              {/* Support Contact Info (Expanded) */}
              <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center justify-center gap-4 text-xs text-white/40">
                <a
                  href="https://wa.me/15846665195"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-[#00E6C3] transition-colors"
                >
                  <MessageCircle className="h-3 w-3" />
                  WhatsApp: +1 (584) 666-5195
                </a>
                <span className="text-white/20">|</span>
                <a
                  href="mailto:suporte@nextrustx.com"
                  className="flex items-center gap-1 hover:text-[#00E6C3] transition-colors"
                >
                  <Mail className="h-3 w-3" />
                  suporte@nextrustx.com
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
