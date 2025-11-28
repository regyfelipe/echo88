/**
 * Utilitários para Service Worker
 *
 * Gerencia registro, atualização e comunicação com o Service Worker
 */

"use client";

import { useState, useEffect } from "react";

/**
 * Registra o Service Worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    console.warn("[SW] Service Workers não suportados");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    console.log("[SW] Service Worker registrado:", registration.scope);

    // Verificar atualizações periodicamente
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000); // A cada hora

    // Escutar atualizações
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            // Novo service worker disponível
            console.log("[SW] Nova versão disponível");
            // Pode mostrar notificação para o usuário
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error("[SW] Falha ao registrar Service Worker:", error);
    return null;
  }
}

/**
 * Desregistra o Service Worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const unregistered = await registration.unregister();
    console.log("[SW] Service Worker desregistrado:", unregistered);
    return unregistered;
  } catch (error) {
    console.error("[SW] Falha ao desregistrar Service Worker:", error);
    return false;
  }
}

/**
 * Limpa todos os caches
 */
export async function clearAllCaches(): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) {
    return;
  }

  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((name) => name.startsWith("aivlo-"))
        .map((name) => caches.delete(name))
    );
    console.log("[SW] Todos os caches limpos");
  } catch (error) {
    console.error("[SW] Falha ao limpar caches:", error);
  }
}

/**
 * Pre-cache recursos específicos
 */
export async function precacheResources(urls: string[]): Promise<void> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    if (registration.active) {
      registration.active.postMessage({
        type: "PRECACHE",
        urls,
      });
    }
  } catch (error) {
    console.error("[SW] Falha ao precache recursos:", error);
  }
}

/**
 * Verifica se está online
 */
export function isOnline(): boolean {
  if (typeof window === "undefined") return true;
  return navigator.onLine;
}

/**
 * Escuta mudanças de status de conexão
 */
export function onConnectionChange(
  callback: (isOnline: boolean) => void
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}

/**
 * Hook React para Service Worker
 *
 * Nota: Este hook deve ser usado apenas em componentes client-side
 */
export function useServiceWorker() {
  // Sempre chamar hooks primeiro (regra do React)
  const [isRegistered, setIsRegistered] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);

  // Verificar se está no servidor após hooks
  const isServer = typeof window === "undefined";
  const isSupported = !isServer && "serviceWorker" in navigator;

  useEffect(() => {
    // Early return dentro do useEffect é permitido
    if (isServer || !isSupported) return;

    // Verificar se já está registrado
    navigator.serviceWorker.getRegistration().then((registration) => {
      setIsRegistered(!!registration);

      if (registration) {
        // Escutar atualizações
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                setHasUpdate(true);
              }
            });
          }
        });

        // Escutar mensagens do SW (métricas)
        navigator.serviceWorker.addEventListener("message", (event) => {
          if (event.data?.type === "CACHE_METRIC") {
            // Importar e registrar métrica
            import("@/lib/utils/cache-metrics").then(
              ({ recordCacheHit, recordCacheMiss }) => {
                const { metrics } = event.data;
                if (metrics.fromCache) {
                  recordCacheHit(
                    metrics.url,
                    metrics.responseTime,
                    metrics.type
                  );
                } else {
                  recordCacheMiss(
                    metrics.url,
                    metrics.responseTime,
                    metrics.type
                  );
                }
              }
            );
          }
        });
      }
    });

    // Registrar automaticamente
    registerServiceWorker().then((registration) => {
      setIsRegistered(!!registration);
    });
  }, [isServer, isSupported]);

  const update = async () => {
    if (isServer || !isSupported) return;
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
      setHasUpdate(false);
    }
  };

  // Retornar valores apropriados baseado no ambiente
  if (isServer) {
    return {
      isSupported: false,
      isRegistered: false,
      hasUpdate: false,
      register: async () => null,
      unregister: async () => false,
      clearCache: async () => {},
      update: async () => {},
    };
  }

  return {
    isSupported,
    isRegistered,
    hasUpdate,
    register: registerServiceWorker,
    unregister: unregisterServiceWorker,
    clearCache: clearAllCaches,
    update,
  };
}
