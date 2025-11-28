/**
 * Métricas de Cache
 * 
 * Rastreia cache hits/misses e performance
 */

interface CacheMetrics {
  hits: number;
  misses: number;
  totalRequests: number;
  hitRate: number;
  averageResponseTime: number;
  cacheSize: number;
  lastUpdated: number;
}

interface RequestMetrics {
  url: string;
  fromCache: boolean;
  responseTime: number;
  timestamp: number;
  type: "image" | "api" | "static" | "other";
}

const METRICS_KEY = "aivlo_cache_metrics";
const REQUEST_HISTORY_KEY = "aivlo_request_history";
const MAX_HISTORY = 1000; // Manter últimas 1000 requisições

/**
 * Obtém métricas atuais
 */
export function getCacheMetrics(): CacheMetrics {
  if (typeof window === "undefined") {
    return getDefaultMetrics();
  }

  try {
    const stored = localStorage.getItem(METRICS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn("[CacheMetrics] Erro ao ler métricas:", error);
  }

  return getDefaultMetrics();
}

/**
 * Salva métricas
 */
export function saveCacheMetrics(metrics: CacheMetrics): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(METRICS_KEY, JSON.stringify(metrics));
  } catch (error) {
    console.warn("[CacheMetrics] Erro ao salvar métricas:", error);
  }
}

/**
 * Registra um cache hit
 */
export function recordCacheHit(
  url: string,
  responseTime: number,
  type: RequestMetrics["type"] = "other"
): void {
  const metrics = getCacheMetrics();
  metrics.hits++;
  metrics.totalRequests++;
  metrics.hitRate = metrics.hits / metrics.totalRequests;
  metrics.averageResponseTime =
    (metrics.averageResponseTime * (metrics.totalRequests - 1) +
      responseTime) /
    metrics.totalRequests;
  metrics.lastUpdated = Date.now();

  saveCacheMetrics(metrics);
  recordRequest({ url, fromCache: true, responseTime, timestamp: Date.now(), type });
}

/**
 * Registra um cache miss
 */
export function recordCacheMiss(
  url: string,
  responseTime: number,
  type: RequestMetrics["type"] = "other"
): void {
  const metrics = getCacheMetrics();
  metrics.misses++;
  metrics.totalRequests++;
  metrics.hitRate = metrics.hits / metrics.totalRequests;
  metrics.averageResponseTime =
    (metrics.averageResponseTime * (metrics.totalRequests - 1) +
      responseTime) /
    metrics.totalRequests;
  metrics.lastUpdated = Date.now();

  saveCacheMetrics(metrics);
  recordRequest({ url, fromCache: false, responseTime, timestamp: Date.now(), type });
}

/**
 * Registra uma requisição no histórico
 */
function recordRequest(request: RequestMetrics): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(REQUEST_HISTORY_KEY);
    const history: RequestMetrics[] = stored ? JSON.parse(stored) : [];

    history.push(request);

    // Manter apenas últimas MAX_HISTORY requisições
    if (history.length > MAX_HISTORY) {
      history.shift();
    }

    localStorage.setItem(REQUEST_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.warn("[CacheMetrics] Erro ao registrar requisição:", error);
  }
}

/**
 * Obtém histórico de requisições
 */
export function getRequestHistory(limit = 100): RequestMetrics[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(REQUEST_HISTORY_KEY);
    if (stored) {
      const history: RequestMetrics[] = JSON.parse(stored);
      return history.slice(-limit);
    }
  } catch (error) {
    console.warn("[CacheMetrics] Erro ao ler histórico:", error);
  }

  return [];
}

/**
 * Obtém estatísticas por tipo
 */
export function getMetricsByType(): Record<
  RequestMetrics["type"],
  { hits: number; misses: number; total: number; hitRate: number }
> {
  const history = getRequestHistory();
  const stats: Record<
    RequestMetrics["type"],
    { hits: number; misses: number; total: number; hitRate: number }
  > = {
    image: { hits: 0, misses: 0, total: 0, hitRate: 0 },
    api: { hits: 0, misses: 0, total: 0, hitRate: 0 },
    static: { hits: 0, misses: 0, total: 0, hitRate: 0 },
    other: { hits: 0, misses: 0, total: 0, hitRate: 0 },
  };

  history.forEach((request) => {
    const typeStats = stats[request.type];
    typeStats.total++;
    if (request.fromCache) {
      typeStats.hits++;
    } else {
      typeStats.misses++;
    }
    typeStats.hitRate = typeStats.hits / typeStats.total;
  });

  return stats;
}

/**
 * Reseta métricas
 */
export function resetCacheMetrics(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(METRICS_KEY);
  localStorage.removeItem(REQUEST_HISTORY_KEY);
}

/**
 * Métricas padrão
 */
function getDefaultMetrics(): CacheMetrics {
  return {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    hitRate: 0,
    averageResponseTime: 0,
    cacheSize: 0,
    lastUpdated: Date.now(),
  };
}

/**
 * Atualiza tamanho do cache
 */
export async function updateCacheSize(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const { getCacheStats } = await import("@/lib/utils/image-cache");
    const stats = await getCacheStats();
    const metrics = getCacheMetrics();
    metrics.cacheSize = stats.totalSize;
    saveCacheMetrics(metrics);
  } catch (error) {
    console.warn("[CacheMetrics] Erro ao atualizar tamanho do cache:", error);
  }
}

