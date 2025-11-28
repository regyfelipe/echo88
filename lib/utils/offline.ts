/**
 * Utilitários para modo offline
 */

const OFFLINE_CACHE_KEY = "Aivlo_offline_cache";
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB

interface CachedRequest {
  url: string;
  method: string;
  body?: string;
  timestamp: number;
  response: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
  };
}

/**
 * Salva uma requisição no cache offline
 */
export function cacheRequest(
  url: string,
  method: string,
  response: Response,
  body?: string
): void {
  try {
    const cached = getCachedRequests();
    
    // Remover requisições antigas se o cache estiver muito grande
    if (cached.length > 100) {
      cached.sort((a, b) => b.timestamp - a.timestamp);
      cached.splice(100);
    }

    response.clone().text().then((text) => {
      const cacheEntry: CachedRequest = {
        url,
        method,
        body,
        timestamp: Date.now(),
        response: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: text,
        },
      };

      cached.push(cacheEntry);
      localStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(cached));
    });
  } catch (error) {
    console.error("Error caching request:", error);
  }
}

/**
 * Obtém requisições do cache offline
 */
export function getCachedRequests(): CachedRequest[] {
  try {
    const cached = localStorage.getItem(OFFLINE_CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
}

/**
 * Busca uma requisição no cache
 */
export function getCachedRequest(
  url: string,
  method: string = "GET"
): CachedRequest | null {
  const cached = getCachedRequests();
  return (
    cached.find(
      (req) => req.url === url && req.method === method
    ) || null
  );
}

/**
 * Limpa o cache offline
 */
export function clearOfflineCache(): void {
  localStorage.removeItem(OFFLINE_CACHE_KEY);
}

/**
 * Verifica se está offline
 */
export function isOffline(): boolean {
  return !navigator.onLine;
}

/**
 * Listener para mudanças de status online/offline
 */
export function onOnlineStatusChange(
  callback: (isOnline: boolean) => void
): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}

