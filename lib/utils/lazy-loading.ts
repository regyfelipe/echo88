/**
 * Utilitários para Lazy Loading Otimizado
 *
 * Fornece helpers para code splitting estratégico com:
 * - Preload inteligente
 * - Fallbacks otimizados
 * - Error boundaries integrados
 * - Analytics de carregamento
 */

import { lazy, ComponentType, LazyExoticComponent } from "react";

/**
 * Interface para configuração de lazy loading
 */
interface LazyLoadOptions {
  /**
   * Nome do componente para debugging
   */
  name?: string;
  /**
   * Callback quando componente começa a carregar
   */
  onLoadStart?: () => void;
  /**
   * Callback quando componente carrega com sucesso
   */
  onLoadSuccess?: () => void;
  /**
   * Callback quando componente falha ao carregar
   */
  onLoadError?: (error: Error) => void;
  /**
   * Timeout em ms para considerar falha
   */
  timeout?: number;
}

/**
 * Cria um componente lazy com configurações avançadas
 */
export function createLazyComponent<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): LazyExoticComponent<T> {
  const {
    name = "LazyComponent",
    onLoadStart,
    onLoadSuccess,
    onLoadError,
    timeout = 10000,
  } = options;

  // Wrapper para adicionar callbacks
  const wrappedImport = async () => {
    onLoadStart?.();

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error(`Timeout loading ${name} after ${timeout}ms`)),
          timeout
        );
      });

      const loadedModule = await Promise.race([importFn(), timeoutPromise]);
      onLoadSuccess?.();
      return loadedModule;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onLoadError?.(err);
      console.error(`Failed to load ${name}:`, err);
      throw err;
    }
  };

  return lazy(wrappedImport);
}

/**
 * Preload um componente antes de ser necessário
 */
export function preloadComponent(
  importFn: () => Promise<{ default: ComponentType<unknown> }>
): void {
  // Usar requestIdleCallback se disponível, senão setTimeout
  if (typeof window !== "undefined") {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => {
        importFn().catch(() => {
          // Silenciosamente falha - componente será carregado quando necessário
        });
      });
    } else {
      setTimeout(() => {
        importFn().catch(() => {
          // Silenciosamente falha
        });
      }, 2000);
    }
  }
}

/**
 * Preload múltiplos componentes
 */
export function preloadComponents(
  importFns: Array<() => Promise<{ default: ComponentType<unknown> }>>
): void {
  importFns.forEach((fn, index) => {
    // Stagger preloads para não sobrecarregar
    setTimeout(() => preloadComponent(fn), index * 100);
  });
}

/**
 * Hook para rastrear carregamento de componentes lazy
 */
export function useLazyLoadMetrics() {
  if (typeof window === "undefined") return;

  const metrics = {
    loadStart: new Map<string, number>(),
    loadEnd: new Map<string, number>(),
  };

  return {
    startLoad: (name: string) => {
      metrics.loadStart.set(name, performance.now());
    },
    endLoad: (name: string) => {
      const start = metrics.loadStart.get(name);
      if (start) {
        const duration = performance.now() - start;
        metrics.loadEnd.set(name, duration);
        console.log(`[LazyLoad] ${name} loaded in ${duration.toFixed(2)}ms`);
      }
    },
    getMetrics: () => {
      const result: Record<string, number> = {};
      metrics.loadEnd.forEach((duration, name) => {
        result[name] = duration;
      });
      return result;
    },
  };
}
