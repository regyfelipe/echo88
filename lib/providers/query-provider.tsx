/**
 * React Query Provider
 *
 * Configuração do TanStack Query para gerenciamento de cache e estado de servidor
 */

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

// Estender Window para incluir QueryClient
declare global {
  interface Window {
    __REACT_QUERY_CLIENT__?: QueryClient;
  }
}

// Exportar queryClient para uso global (limpeza no logout)
let globalQueryClient: QueryClient | null = null;

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Tempo que os dados são considerados "fresh" (não precisa refetch)
            staleTime: 1000 * 60 * 2, // 2 minutos
            // Tempo que os dados ficam em cache após não serem usados
            gcTime: 1000 * 60 * 10, // 10 minutos (anteriormente cacheTime)
            // Refetch automático quando janela ganha foco
            refetchOnWindowFocus: true,
            // Refetch automático quando reconecta à rede
            refetchOnReconnect: true,
            // Não refetch automaticamente em mount se dados estão fresh
            refetchOnMount: true,
            // Retry em caso de erro
            retry: 2,
            // Delay entre retries
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000),
            // Estrutura de erro padrão
            throwOnError: false,
          },
          mutations: {
            // Retry em mutações
            retry: 1,
            // Estrutura de erro padrão
            throwOnError: false,
          },
        },
      })
  );

  // Armazenar globalmente para limpeza no logout
  globalQueryClient = queryClient;
  if (typeof window !== "undefined") {
    window.__REACT_QUERY_CLIENT__ = queryClient;
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

/**
 * Obtém o QueryClient global para limpeza
 */
export function getQueryClient(): QueryClient | null {
  return (
    globalQueryClient ||
    (typeof window !== "undefined"
      ? window.__REACT_QUERY_CLIENT__ || null
      : null)
  );
}
