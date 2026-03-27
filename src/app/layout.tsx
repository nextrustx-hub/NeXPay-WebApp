import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeXPay - Sua Conta Digital em BRL",
  description: "NeXPay - Plataforma digital premium para operações financeiras em BRL com suporte a PIX",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
