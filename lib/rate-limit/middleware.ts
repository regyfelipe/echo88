/**
 * Rate Limiting Middleware para Next.js
 * 
 * Middleware para aplicar rate limiting em rotas de API
 */

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, RATE_LIMITS } from "./rate-limiter";

/**
 * Determina o tipo de rate limit baseado no path
 */
function getRateLimitType(pathname: string): keyof typeof RATE_LIMITS {
  // Auth endpoints
  if (pathname.includes("/api/auth/login") || pathname.includes("/api/auth/register") || pathname.includes("/api/auth/signup")) {
    return "auth";
  }

  // Upload endpoints
  if (pathname.includes("/api/upload") || pathname.includes("/api/posts/create") || pathname.includes("/api/storage/upload")) {
    return "upload";
  }

  // Posts endpoints (like, save, view, dislike, favorite, etc.)
  if (
    pathname.includes("/api/posts") &&
    (pathname.includes("/like") ||
      pathname.includes("/save") ||
      pathname.includes("/share") ||
      pathname.includes("/favorite") ||
      pathname.includes("/dislike") ||
      pathname.includes("/view") ||
      pathname.includes("/comments"))
  ) {
    return "posts";
  }

  // Feed endpoints
  if (pathname.includes("/api/posts/feed") || pathname.includes("/api/posts/user/")) {
    return "feed";
  }

  // Search endpoints
  if (pathname.includes("/api/search") || pathname.includes("/api/users/search") || pathname.includes("/api/posts/explore")) {
    return "search";
  }

  // Profile endpoints
  if (
    pathname.includes("/api/users/profile") ||
    pathname.includes("/api/users/feed-preferences") ||
    pathname.includes("/api/users/") && pathname.includes("/stats")
  ) {
    return "profile";
  }

  // Notifications endpoints (mais permissivo)
  if (pathname.includes("/api/notifications")) {
    return "default"; // Usa default mas com limite maior
  }

  // Stories endpoints
  if (pathname.includes("/api/stories")) {
    return "default";
  }

  // Public endpoints (login, register sem /auth)
  if (pathname.includes("/api/login") || pathname.includes("/api/register")) {
    return "public";
  }

  // Default
  return "default";
}

/**
 * Extrai User ID do request (se autenticado)
 */
async function getUserId(request: NextRequest): Promise<string | undefined> {
  try {
    // Tentar obter do cookie de sessão (auth-token é o cookie usado pelo sistema)
    const sessionCookie = request.cookies.get("auth-token") ||
                         request.cookies.get("next-auth.session-token") ||
                         request.cookies.get("__Secure-next-auth.session-token") ||
                         request.cookies.get("session");
    
    if (sessionCookie?.value) {
      // Decodificar JWT básico (apenas para obter user ID, sem validação completa)
      try {
        const parts = sessionCookie.value.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(
            Buffer.from(parts[1], "base64").toString()
          );
          // O sistema usa userId no payload
          return payload.userId || payload.sub || payload.id || payload.user?.id;
        }
      } catch {
        // Se não conseguir decodificar, continuar sem user ID
      }
    }

    // Tentar obter do header Authorization
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        const parts = token.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(
            Buffer.from(parts[1], "base64").toString()
          );
          return payload.userId || payload.sub || payload.id || payload.user?.id;
        }
      } catch {
        // Se não conseguir decodificar, continuar sem user ID
      }
    }

    // Tentar obter do header X-User-ID (se fornecido)
    const userIdHeader = request.headers.get("x-user-id");
    if (userIdHeader) {
      return userIdHeader;
    }
  } catch {
    // Ignorar erros de parsing silenciosamente
    // Não logar para evitar spam de logs
  }

  return undefined;
}

/**
 * Middleware de Rate Limiting
 */
export async function rateLimitMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  // Apenas aplicar em rotas de API
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return null;
  }

  // Ignorar health checks e métricas
  if (
    request.nextUrl.pathname === "/api/health" ||
    request.nextUrl.pathname === "/api/metrics"
  ) {
    return null;
  }

  const pathname = request.nextUrl.pathname;
  const type = getRateLimitType(pathname);
  const userId = await getUserId(request);

  const result = await checkRateLimit(request, type, userId);

  // Criar response
  const response = result.success
    ? NextResponse.next()
    : NextResponse.json(result.body, { status: result.status || 429 });

  // Adicionar headers de rate limit
  Object.entries(result.headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  if (!result.success) {
    console.warn(
      `[RateLimit] Bloqueado: ${userId || "IP"} - ${pathname} - Tipo: ${type}`
    );
  }

  return result.success ? null : response;
}

