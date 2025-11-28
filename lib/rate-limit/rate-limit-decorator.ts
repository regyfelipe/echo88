/**
 * Rate Limit Decorator
 *
 * Helper para aplicar rate limiting em rotas de API individuais
 */

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, RATE_LIMITS } from "./rate-limiter";

/**
 * Opções para rate limiting
 */
export interface RateLimitOptions {
  type?: keyof typeof RATE_LIMITS;
  getUserId?: (request: NextRequest) => Promise<string | undefined>;
  onLimitExceeded?: (
    request: NextRequest,
    retryAfter: number
  ) => NextResponse | Promise<NextResponse>;
}

/**
 * Wrapper para handlers de API com rate limiting
 * Compatível com Next.js 15 Route Handlers
 */
export function withRateLimit(
  handler: (
    request: NextRequest,
    context?: {
      params?:
        | Promise<Record<string, string | string[]>>
        | Record<string, string | string[] | undefined>;
    }
  ) => Promise<NextResponse>,
  options: RateLimitOptions = {}
) {
  return async (
    request: NextRequest,
    context?: {
      params?:
        | Promise<Record<string, string | string[]>>
        | Record<string, string | string[] | undefined>;
    }
  ): Promise<NextResponse> => {
    const { type = "default", getUserId, onLimitExceeded } = options;

    // Obter User ID
    let userId: string | undefined;
    if (getUserId) {
      userId = await getUserId(request);
    } else {
      // Tentar obter do cookie de sessão
      const sessionCookie = request.cookies.get("session");
      if (sessionCookie?.value) {
        try {
          const payload = JSON.parse(
            Buffer.from(sessionCookie.value.split(".")[1], "base64").toString()
          );
          userId = payload.userId || payload.sub || payload.id;
        } catch {
          // Ignorar erros de parsing
        }
      }
    }

    // Verificar rate limit
    const result = await checkRateLimit(request, type, userId);

    if (!result.success) {
      if (onLimitExceeded) {
        return onLimitExceeded(request, result.body?.retryAfter || 60);
      }

      const response = NextResponse.json(
        {
          error: "Too Many Requests",
          message:
            "Você excedeu o limite de requisições. Tente novamente mais tarde.",
          retryAfter: result.body?.retryAfter,
        },
        { status: 429 }
      );

      // Adicionar headers
      Object.entries(result.headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    }

    // Executar handler
    const response = await handler(request, context);

    // Adicionar headers de rate limit à response
    Object.entries(result.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  };
}

/**
 * Helper para obter User ID de uma requisição
 */
export async function getUserIdFromRequest(
  request: NextRequest
): Promise<string | undefined> {
  try {
    // Tentar obter do cookie de sessão (auth-token é o cookie usado pelo sistema)
    const sessionCookie =
      request.cookies.get("auth-token") ||
      request.cookies.get("next-auth.session-token") ||
      request.cookies.get("__Secure-next-auth.session-token") ||
      request.cookies.get("session");

    if (sessionCookie?.value) {
      // Tentar decodificar JWT básico (apenas para obter userId, sem validação completa)
      try {
        const parts = sessionCookie.value.split(".");
        if (parts.length === 3) {
          // Decodificar payload (sem validação de assinatura)
          const payload = JSON.parse(
            Buffer.from(parts[1], "base64").toString()
          );
          // O sistema usa userId no payload
          return (
            payload.userId || payload.sub || payload.id || payload.user?.id
          );
        }
      } catch {
        // Se não conseguir decodificar, continuar
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
          return (
            payload.userId || payload.sub || payload.id || payload.user?.id
          );
        }
      } catch {
        // Se não conseguir decodificar, continuar
      }
    }

    // Tentar obter do header X-User-ID (se fornecido)
    const userIdHeader = request.headers.get("x-user-id");
    if (userIdHeader) {
      return userIdHeader;
    }
  } catch {
    // Ignorar erros silenciosamente
    // Não logar para evitar spam de logs
  }

  return undefined;
}
