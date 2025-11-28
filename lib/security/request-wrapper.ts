/**
 * Request Wrapper
 * 
 * Wrapper para aplicar segurança e validação em handlers de API
 */

import { NextRequest, NextResponse } from "next/server";
import { applySecurityHeaders, applyCORSHeaders } from "./security-headers";
import {
  withValidation,
  ValidateRequestOptions,
} from "@/lib/validation/validate-request";

/**
 * Wrapper completo: segurança + validação
 * Compatível com Next.js 15 Route Handlers (params é Promise)
 */
export function withSecurityAndValidation<TBody = unknown, TQuery = unknown>(
  handler: (
    request: NextRequest,
    context: {
      body?: TBody;
      query?: TQuery;
      params?: Promise<Record<string, string | string[]>> | Record<string, string | string[] | undefined>;
    }
  ) => Promise<NextResponse>,
  options: ValidateRequestOptions<TBody, TQuery> = {}
) {
  // Primeiro aplicar validação
  const validatedHandler = withValidation(handler, options);

  // Depois aplicar segurança - retornar função compatível com Next.js 15
  return async (
    request: NextRequest,
    context?: { params?: Promise<Record<string, string | string[]>> | Record<string, string | string[] | undefined> }
  ): Promise<NextResponse> => {
    // Executar handler validado
    const response = await validatedHandler(request, context);

    // Aplicar headers de segurança e CORS
    return applySecurityHeaders(applyCORSHeaders(request, response));
  };
}

/**
 * Wrapper apenas para segurança (sem validação)
 * Compatível com Next.js 15 Route Handlers
 */
export function withSecurity(
  handler: (
    request: NextRequest,
    context?: { params?: Promise<Record<string, string | string[]>> | Record<string, string | string[] | undefined> }
  ) => Promise<NextResponse>
) {
  return async (
    request: NextRequest,
    context?: { params?: Promise<Record<string, string | string[]>> | Record<string, string | string[] | undefined> }
  ): Promise<NextResponse> => {
    const response = await handler(request, context);
    return applySecurityHeaders(applyCORSHeaders(request, response));
  };
}

