/**
 * Rate Limiter
 *
 * Sistema de rate limiting profissional para APIs
 * Suporta múltiplas estratégias e armazenamento
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Configuração de Rate Limits por tipo de endpoint
export const RATE_LIMITS = {
  // Endpoints públicos (login, registro, etc.)
  public: {
    limit: 10, // 10 requisições
    window: "10 s", // por 10 segundos
  },
  // Endpoints de autenticação
  auth: {
    limit: 5, // 5 requisições
    window: "1 m", // por minuto
  },
  // Endpoints de posts (criação, like, etc.)
  posts: {
    limit: 60, // 60 requisições
    window: "1 m", // por minuto
  },
  // Endpoints de feed
  feed: {
    limit: 60, // 60 requisições
    window: "1 m", // por minuto
  },
  // Endpoints de upload
  upload: {
    limit: 10, // 10 requisições
    window: "1 m", // por minuto
  },
  // Endpoints de busca
  search: {
    limit: 20, // 20 requisições
    window: "1 m", // por minuto
  },
  // Endpoints de perfil
  profile: {
    limit: 60, // 60 requisições
    window: "1 m", // por minuto
  },
  // Endpoints gerais (notifications, stories, etc.)
  default: {
    limit: 120, // 120 requisições (aumentado para uso normal)
    window: "1 m", // por minuto
  },
} as const;

// Instância do Redis (usando Upstash ou fallback para in-memory)
// Nota: redisClient e inMemoryStore são inicializados dentro do RateLimiter
const inMemoryStore: Map<string, { count: number; resetTime: number }> =
  new Map();

/**
 * Inicializa o cliente Redis
 */
function initRedis(): Redis | null {
  if (typeof window !== "undefined") {
    return null; // Não funciona no cliente
  }

  // Tentar usar Upstash Redis se configurado
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      return new Redis({
        url: upstashUrl,
        token: upstashToken,
      });
    } catch (error) {
      console.warn(
        "[RateLimit] Falha ao conectar ao Upstash Redis, usando fallback in-memory:",
        error
      );
    }
  }

  return null;
}

/**
 * Rate Limiter com fallback in-memory
 */
class RateLimiter {
  private limiters: Map<string, Ratelimit> = new Map();
  private redis: Redis | null = null;
  private useRedis: boolean = false;

  constructor() {
    const initializedRedis = initRedis();
    this.redis = initializedRedis;
    this.useRedis = !!initializedRedis;

    // Criar limiters para cada tipo
    Object.keys(RATE_LIMITS).forEach((key) => {
      const config = RATE_LIMITS[key as keyof typeof RATE_LIMITS];
      if (this.redis) {
        this.limiters.set(
          key,
          new Ratelimit({
            redis: this.redis,
            limiter: Ratelimit.slidingWindow(config.limit, config.window),
            analytics: true,
            prefix: `@aivlo/ratelimit/${key}`,
          })
        );
      }
    });
  }

  /**
   * Verifica rate limit (in-memory fallback)
   */
  private async checkInMemory(
    identifier: string,
    limit: number,
    windowMs: number
  ): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
  }> {
    const now = Date.now();
    const key = identifier;
    const stored = inMemoryStore.get(key);

    // Limpar entradas expiradas periodicamente
    if (Math.random() < 0.01) {
      // 1% de chance de limpar
      for (const [k, v] of inMemoryStore.entries()) {
        if (v.resetTime < now) {
          inMemoryStore.delete(k);
        }
      }
    }

    if (!stored || stored.resetTime < now) {
      // Nova janela
      inMemoryStore.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: now + windowMs,
      };
    }

    if (stored.count >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset: stored.resetTime,
      };
    }

    stored.count++;
    return {
      success: true,
      limit,
      remaining: limit - stored.count,
      reset: stored.resetTime,
    };
  }

  /**
   * Converte window string para milissegundos
   */
  private windowToMs(window: string): number {
    const match = window.match(/^(\d+)\s*(s|m|h|d)$/);
    if (!match) return 60000; // Default 1 minuto

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case "s":
        return value * 1000;
      case "m":
        return value * 60 * 1000;
      case "h":
        return value * 60 * 60 * 1000;
      case "d":
        return value * 24 * 60 * 60 * 1000;
      default:
        return 60000;
    }
  }

  /**
   * Verifica rate limit
   */
  async check(
    identifier: string,
    type: keyof typeof RATE_LIMITS = "default"
  ): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
    retryAfter?: number;
  }> {
    const config = RATE_LIMITS[type];
    const limiter = this.limiters.get(type);

    if (limiter && this.useRedis) {
      // Usar Upstash Ratelimit
      const result = await limiter.limit(identifier);
      return {
        success: result.success,
        limit: config.limit,
        remaining: result.remaining,
        reset: result.reset,
        retryAfter: result.success
          ? undefined
          : Math.ceil((result.reset - Date.now()) / 1000),
      };
    }

    // Fallback in-memory
    const windowMs = this.windowToMs(config.window);
    const result = await this.checkInMemory(identifier, config.limit, windowMs);

    return {
      ...result,
      retryAfter: result.success
        ? undefined
        : Math.ceil((result.reset - Date.now()) / 1000),
    };
  }

  /**
   * Limpa rate limit para um identificador (útil para testes)
   */
  async reset(
    identifier: string,
    type?: keyof typeof RATE_LIMITS
  ): Promise<void> {
    if (type) {
      const limiter = this.limiters.get(type);
      if (limiter && this.useRedis) {
        // Upstash não tem método direto de reset, mas podemos usar um prefix diferente
        // Por enquanto, apenas limpar do in-memory
        inMemoryStore.delete(identifier);
      } else {
        inMemoryStore.delete(identifier);
      }
    } else {
      // Limpar todos os tipos
      inMemoryStore.delete(identifier);
    }
  }
}

// Singleton
export const rateLimiter = new RateLimiter();

/**
 * Middleware helper para rate limiting
 */
export async function checkRateLimit(
  request: Request,
  type: keyof typeof RATE_LIMITS = "default",
  userId?: string
): Promise<{
  success: boolean;
  headers: Record<string, string>;
  status?: number;
  body?: { error: string; retryAfter?: number };
}> {
  // Identificador: IP ou User ID (prioridade para User ID se autenticado)
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  const identifier = userId || ip;

  const result = await rateLimiter.check(identifier, type);

  const headers: Record<string, string> = {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": new Date(result.reset).toISOString(),
  };

  if (!result.success) {
    headers["Retry-After"] = (result.retryAfter || 60).toString();
    return {
      success: false,
      headers,
      status: 429,
      body: {
        error: "Too Many Requests",
        retryAfter: result.retryAfter,
      },
    };
  }

  return {
    success: true,
    headers,
  };
}
