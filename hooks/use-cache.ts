/**
 * Hook React para gerenciar cache de forma reativa
 * Similar ao SWR, mas usando nosso sistema de cache
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { cacheManager, CacheStrategy, CacheOptions } from "@/lib/cache/cache-manager";

interface UseCacheOptions<T> extends CacheOptions {
  strategy?: CacheStrategy;
  revalidateOnFocus?: boolean; // Revalidar quando a janela recebe foco
  revalidateOnReconnect?: boolean; // Revalidar quando reconecta à internet
  fallbackData?: T; // Dados iniciais enquanto carrega
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseCacheReturn<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isValidating: boolean;
  mutate: (data?: T, shouldRevalidate?: boolean) => Promise<void>;
  revalidate: () => Promise<void>;
}

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseCacheOptions<T> = {},
  userId?: string
): UseCacheReturn<T> {
  const {
    strategy = CacheStrategy.SHORT,
    revalidate = false,
    forceRefresh = false,
    revalidateOnFocus = false,
    revalidateOnReconnect = false,
    fallbackData,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(fallbackData || null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const fetcherRef = useRef(fetcher);
  const keyRef = useRef(key);

  // Atualizar refs quando mudarem
  useEffect(() => {
    fetcherRef.current = fetcher;
    keyRef.current = key;
  }, [fetcher, key]);

  // Função para buscar dados
  const fetchData = useCallback(
    async (skipCache = false) => {
      setIsValidating(true);
      setError(null);

      try {
        // Tentar cache primeiro (se não for force refresh)
        if (!skipCache && !forceRefresh) {
          const cached = await cacheManager.get<T>(key, { strategy, revalidate }, userId);
          if (cached !== null) {
            setData(cached);
            setIsLoading(false);
            setIsValidating(false);
            onSuccess?.(cached);

            // Revalidar em background se solicitado
            if (revalidate) {
              fetcherRef
                .current()
                .then((freshData) => {
                  setData(freshData);
                  cacheManager.set(key, freshData, { strategy }, userId);
                  onSuccess?.(freshData);
                })
                .catch((err) => {
                  console.error("Erro ao revalidar em background:", err);
                });
            }
            return;
          }
        }

        // Buscar do servidor
        const freshData = await fetcherRef.current();
        setData(freshData);
        setIsLoading(false);
        setIsValidating(false);

        // Salvar no cache
        await cacheManager.set(key, freshData, { strategy }, userId);
        onSuccess?.(freshData);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Erro desconhecido");
        setError(error);
        setIsLoading(false);
        setIsValidating(false);
        onError?.(error);
      }
    },
    [key, strategy, revalidate, forceRefresh, userId, onSuccess, onError]
  );

  // Carregar dados iniciais
  useEffect(() => {
    fetchData(forceRefresh);
  }, [key, userId]); // Re-executar quando key ou userId mudar

  // Revalidar quando a janela recebe foco
  useEffect(() => {
    if (!revalidateOnFocus) return;

    const handleFocus = () => {
      fetchData(true);
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [revalidateOnFocus, fetchData]);

  // Revalidar quando reconecta à internet
  useEffect(() => {
    if (!revalidateOnReconnect) return;

    const handleOnline = () => {
      fetchData(true);
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [revalidateOnReconnect, fetchData]);

  // Função para atualizar dados manualmente
  const mutate = useCallback(
    async (newData?: T, shouldRevalidate = true) => {
      if (newData !== undefined) {
        setData(newData);
        await cacheManager.set(key, newData, { strategy }, userId);
      }

      if (shouldRevalidate) {
        await fetchData(true);
      }
    },
    [key, strategy, userId, fetchData]
  );

  // Função para revalidar
  const revalidateFn = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
    revalidate: revalidateFn,
  };
}

