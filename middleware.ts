/**
 * Next.js Middleware
 * 
 * Aplica rate limiting, segurança e CORS
 */

import { NextRequest, NextResponse } from "next/server";
import { rateLimitMiddleware } from "@/lib/rate-limit/middleware";
import {
  securityHeadersMiddleware,
  applySecurityHeaders,
  applyCORSHeaders,
} from "@/lib/security/security-headers";

export async function middleware(request: NextRequest) {
  // Aplicar headers de segurança e CORS (incluindo preflight)
  const securityResponse = securityHeadersMiddleware(request);
  if (securityResponse) {
    return securityResponse;
  }

  // Aplicar rate limiting
  const rateLimitResponse = await rateLimitMiddleware(request);
  if (rateLimitResponse) {
    // Aplicar headers de segurança na response de rate limit
    return applySecurityHeaders(applyCORSHeaders(request, rateLimitResponse));
  }

  // Continuar com a requisição e aplicar headers
  const response = NextResponse.next();
  return applySecurityHeaders(applyCORSHeaders(request, response));
}

// Configurar quais rotas o middleware deve executar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

