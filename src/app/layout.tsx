import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import SolanaWalletProvider from "@/components/SolanaWalletProvider";
import ReactQueryProvider from "@/components/ReactQueryProvider";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "lp-to-earning Dashboard",
  description: "Manage your automated Copy Trade configuration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${jakartaSans.variable} h-full antialiased font-sans bg-surface text-foreground flex flex-col`}
      >
        <ReactQueryProvider>
          <SolanaWalletProvider>{children}</SolanaWalletProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
