import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { ToastProvider } from "@/contexts/toast-context";
import { FontLoader } from "@/components/shared/font-loader";
import { OfflineIndicator } from "@/components/shared/offline-indicator";
import { ServiceWorkerRegister } from "@/components/shared/service-worker-register";
import { SWUpdateNotification } from "@/components/shared/sw-update-notification";
import { QueryProvider } from "@/lib/providers/query-provider";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aivlo",
  description: "Plataforma de autenticação e cadastro",
  other: {
    "google-adsense-account": "ca-pub-3354164597487551",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <FontLoader />
        {/* Google AdSense Script */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3354164597487551"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <ThemeProvider>
          <ErrorBoundary>
            <QueryProvider>
              <AuthProvider>
                <ToastProvider>
                  <ServiceWorkerRegister />
                  <SWUpdateNotification />
                  <OfflineIndicator />
                  {children}
                </ToastProvider>
              </AuthProvider>
            </QueryProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
