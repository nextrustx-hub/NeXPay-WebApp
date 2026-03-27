import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { Providers } from "@/providers/providers";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NeXPay - Sua Conta Digital em BRL",
  description: "NeXPay - Plataforma digital premium para operações financeiras em BRL com suporte a PIX. Transferências rápidas, seguras e internacionais.",
  keywords: ["NeXPay", "conta digital", "BRL", "PIX", "fintech", "transferência", "pagamentos", "Brasil"],
  authors: [{ name: "NeXPay Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "NeXPay - Sua Conta Digital em BRL",
    description: "Plataforma digital premium para operações financeiras em BRL com suporte a PIX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NeXPay - Sua Conta Digital em BRL",
    description: "Plataforma digital premium para operações financeiras em BRL com suporte a PIX",
  },
};

// Generate static params for all locales
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound();
  }

  // Load messages for the locale
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers locale={locale} messages={messages}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
