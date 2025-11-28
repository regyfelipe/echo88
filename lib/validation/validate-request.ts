/**
 * Request Validation Utilities
 * 
 * Helpers para validar requests em rotas de API
 */

import { NextRequest, NextResponse } from "next/server";
import { z, ZodSchema } from "zod";
import { formatZodError } from "./schemas";

/**
 * Opções para validação de request
 */
export interface ValidateRequestOptions<TBody = unknown, TQuery = unknown> {
  bodySchema?: ZodSchema<TBody>;
  querySchema?: ZodSchema<TQuery>;
  paramsSchema?: ZodSchema<Record<string, unknown>>;
  onError?: (error: z.ZodError) => NextResponse;
}

/**
 * Valida e parseia o body do request
 */
export async function validateBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return {
        success: false,
        response: NextResponse.json(
          formatZodError(result.error),
          { status: 400 }
        ),
      };
    }

    return { success: true, data: result.data };
  } catch {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Body inválido ou ausente", details: "JSON malformado" },
        { status: 400 }
      ),
    };
  }
}

/**
 * Valida e parseia query parameters
 */
export function validateQuery<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
  try {
    const { searchParams } = new URL(request.url);
    const query: Record<string, string> = {};
    
    searchParams.forEach((value, key) => {
      query[key] = value;
    });

    const result = schema.safeParse(query);

    if (!result.success) {
      return {
        success: false,
        response: NextResponse.json(
          formatZodError(result.error),
          { status: 400 }
        ),
      };
    }

    return { success: true, data: result.data };
  } catch {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Query parameters inválidos" },
        { status: 400 }
      ),
    };
  }
}

/**
 * Valida e parseia route parameters
 */
export function validateParams<T>(
  params: Record<string, string | string[] | undefined>,
  schema: ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
  try {
    // Converter params para objeto simples
    const paramsObj: Record<string, string> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (typeof value === "string") {
        paramsObj[key] = value;
      } else if (Array.isArray(value) && value.length > 0) {
        paramsObj[key] = value[0];
      }
    });

    const result = schema.safeParse(paramsObj);

    if (!result.success) {
      return {
        success: false,
        response: NextResponse.json(
          formatZodError(result.error),
          { status: 400 }
        ),
      };
    }

    return { success: true, data: result.data };
  } catch {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Route parameters inválidos" },
        { status: 400 }
      ),
    };
  }
}

/**
 * Wrapper para validar request completo
 * Compatível com Next.js 15 Route Handlers (params é Promise)
 */
export function withValidation<TBody = unknown, TQuery = unknown>(
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
  return async (
    request: NextRequest,
    context?: { params?: Promise<Record<string, string | string[]>> | Record<string, string | string[] | undefined> }
  ): Promise<NextResponse> => {
    const { bodySchema, querySchema, paramsSchema, onError } = options;

    const validatedContext: {
      body?: TBody;
      query?: TQuery;
      params?: Promise<Record<string, string | string[]>> | Record<string, string | string[] | undefined>;
    } = { ...context };

    // Validar body
    if (bodySchema) {
      const bodyResult = await validateBody(request, bodySchema);
      if (!bodyResult.success) {
        if (onError && bodyResult.response) {
          // onError espera ZodError, mas temos NextResponse
          // Criar um ZodError falso para compatibilidade
          const fakeError = new z.ZodError([]);
          return onError(fakeError);
        }
        return bodyResult.response;
      }
      validatedContext.body = bodyResult.data;
    }

    // Validar query
    if (querySchema) {
      const queryResult = validateQuery(request, querySchema);
      if (!queryResult.success) {
        if (onError && queryResult.response) {
          const fakeError = new z.ZodError([]);
          return onError(fakeError);
        }
        return queryResult.response;
      }
      validatedContext.query = queryResult.data;
    }

    // Validar params (suporta Promise no Next.js 15)
    if (paramsSchema && context?.params) {
      // Se params é Promise, aguardar primeiro
      const paramsToValidate = context.params instanceof Promise 
        ? await context.params 
        : context.params;
      
      const paramsResult = validateParams(paramsToValidate, paramsSchema);
      if (!paramsResult.success) {
        if (onError && paramsResult.response) {
          const fakeError = new z.ZodError([]);
          return onError(fakeError);
        }
        return paramsResult.response;
      }
      // Manter o tipo original (Promise ou objeto)
      validatedContext.params = context.params instanceof Promise
        ? Promise.resolve(paramsResult.data as Record<string, string | string[]>)
        : paramsResult.data as Record<string, string | string[] | undefined>;
    }

    // Executar handler com dados validados
    return handler(request, validatedContext);
  };
}

