/**
 * Security Headers
 *
 * Configuração de headers de segurança para APIs
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Headers de segurança recomendados
 */
export const SECURITY_HEADERS = {
  // Previne clickjacking
  "X-Frame-Options": "DENY",

  // Previne MIME type sniffing
  "X-Content-Type-Options": "nosniff",

  // Política de referrer
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Permissions Policy (anteriormente Feature Policy)
  "Permissions-Policy": [
    "camera=()",
    "microphone=()",
    "geolocation=()",
    "interest-cohort=()",
  ].join(", "),

  // Content Security Policy (CSP)
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "media-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co https://*.upstash.io https://pagead2.googlesyndication.com https://fonts.googleapis.com https://fonts.gstatic.com",
    "frame-src 'self' https://pagead2.googlesyndication.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; "),

  // Strict Transport Security (HSTS) - apenas em produção com HTTPS
  ...(process.env.NODE_ENV === "production" && {
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  }),
} as const;

/**
 * Headers CORS
 */
export const CORS_HEADERS = {
  // Permitir origens específicas ou todas em desenvolvimento
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").join(", ")
    : process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_APP_URL || "*"
    : "*",

  // Métodos permitidos
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",

  // Headers permitidos
  "Access-Control-Allow-Headers": [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-User-ID",
    "Accept",
    "Origin",
  ].join(", "),

  // Permitir credenciais
  "Access-Control-Allow-Credentials": "true",

  // Headers expostos
  "Access-Control-Expose-Headers": [
    "X-RateLimit-Limit",
    "X-RateLimit-Remaining",
    "X-RateLimit-Reset",
    "Retry-After",
  ].join(", "),

  // Cache de preflight
  "Access-Control-Max-Age": "86400", // 24 horas
} as const;

/**
 * Aplica headers de segurança a uma response
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  // Aplicar headers de segurança
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value);
    }
  });

  // Aplicar headers CORS
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value);
    }
  });

  return response;
}

/**
 * Middleware para aplicar headers de segurança
 */
export function securityHeadersMiddleware(
  request: NextRequest
): NextResponse | null {
  // Lidar com preflight requests (OPTIONS)
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    return applySecurityHeaders(response);
  }

  // Para outras requisições, apenas retornar null
  // Os headers serão aplicados no handler
  return null;
}

/**
 * Verifica se a origem é permitida
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;

  // Em desenvolvimento, permitir localhost
  if (process.env.NODE_ENV === "development") {
    return (
      origin.startsWith("http://localhost") ||
      origin.startsWith("http://127.0.0.1")
    );
  }

  // Em produção, verificar lista de origens permitidas
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
    : [process.env.NEXT_PUBLIC_APP_URL || ""];

  return allowedOrigins.includes(origin);
}

/**
 * Aplica CORS dinâmico baseado na origem
 */
export function applyCORSHeaders(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  const origin = request.headers.get("origin");

  if (origin && isOriginAllowed(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  } else if (process.env.NODE_ENV === "development") {
    // Em desenvolvimento, permitir qualquer origem
    response.headers.set("Access-Control-Allow-Origin", origin || "*");
  } else {
    // Em produção, usar origem padrão
    response.headers.set(
      "Access-Control-Allow-Origin",
      process.env.NEXT_PUBLIC_APP_URL || "*"
    );
  }

  // Aplicar outros headers CORS
  response.headers.set(
    "Access-Control-Allow-Methods",
    CORS_HEADERS["Access-Control-Allow-Methods"]
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    CORS_HEADERS["Access-Control-Allow-Headers"]
  );
  response.headers.set(
    "Access-Control-Allow-Credentials",
    CORS_HEADERS["Access-Control-Allow-Credentials"]
  );
  response.headers.set(
    "Access-Control-Expose-Headers",
    CORS_HEADERS["Access-Control-Expose-Headers"]
  );

  return response;
}
