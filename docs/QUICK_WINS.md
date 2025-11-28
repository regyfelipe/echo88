# ⚡ Quick Wins - Melhorias Rápidas e Impactantes

## 🎯 Melhorias que podem ser implementadas em menos de 1 hora cada

### 1. Remover Console.logs de Produção ⏱️ 30min

**Impacto**: Alto - Reduz bundle size, melhora performance, remove exposição de dados

```typescript
// lib/utils/logger.ts
const isDev = process.env.NODE_ENV === "development";

export const logger = {
  log: (...args: unknown[]) => isDev && console.log(...args),
  error: (...args: unknown[]) => console.error(...args),
  warn: (...args: unknown[]) => isDev && console.warn(...args),
  info: (...args: unknown[]) => isDev && console.info(...args),
  debug: (...args: unknown[]) => isDev && console.debug(...args),
};

// Substituir todos os console.log por logger.log
```

**Comando para encontrar todos**:

```bash
grep -r "console\." app/ --include="*.ts" --include="*.tsx" | wc -l
```

---

### 2. Substituir `<img>` por `next/image` ⏱️ 1h

**Impacto**: Alto - Melhora LCP, reduz bandwidth, otimização automática

**Arquivos prioritários**:

- `components/posts/post-card/post-media.tsx`
- `components/posts/post-detail-modal.tsx`
- `app/profile/page.tsx`
- `app/explore/page.tsx`

**Exemplo**:

```typescript
// Antes
<img src={imageUrl} alt={alt} />;

// Depois
import Image from "next/image";
<Image
  src={imageUrl}
  alt={alt}
  width={500}
  height={500}
  loading="lazy"
  placeholder="blur"
/>;
```

---

### 3. Adicionar Error Boundary ⏱️ 30min

**Impacto**: Alto - Previne crashes, melhor UX em erros

```typescript
// components/shared/error-boundary.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    // Enviar para serviço de logging (Sentry, etc)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h2 className="text-2xl font-bold mb-4">Algo deu errado</h2>
            <p className="text-muted-foreground mb-4">
              {this.state.error?.message || "Ocorreu um erro inesperado"}
            </p>
            <Button onClick={() => window.location.reload()}>
              Recarregar página
            </Button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

**Uso**:

```typescript
// app/layout.tsx
<ErrorBoundary>{children}</ErrorBoundary>
```

---

### 4. Adicionar Loading States Consistentes ⏱️ 45min

**Impacto**: Médio - Melhor percepção de performance

```typescript
// components/shared/loading-states.tsx
export const PageLoading = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="text-center">
      <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
      <p className="text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

export const CardLoading = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-4 bg-muted rounded w-3/4" />
    <div className="h-4 bg-muted rounded w-1/2" />
  </div>
);
```

---

### 5. Implementar Rate Limiting Básico ⏱️ 1h

**Impacto**: Alto - Previne abuso, protege APIs

```typescript
// lib/middleware/rate-limit.ts
import { NextRequest, NextResponse } from "next/server";

const requests = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(maxRequests: number = 10, windowMs: number = 60000) {
  return (req: NextRequest) => {
    const ip = req.ip || req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const record = requests.get(ip);

    if (!record || now > record.resetTime) {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
      return null;
    }

    if (record.count >= maxRequests) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    record.count++;
    return null;
  };
}
```

---

### 6. Adicionar Validação com Zod ⏱️ 1h

**Impacto**: Alto - Previne bugs, melhora segurança

```bash
pnpm add zod
```

```typescript
// lib/validations/post.ts
import { z } from "zod";

export const createPostSchema = z.object({
  content: z.string().max(5000).optional(),
  type: z.enum(["text", "image", "video", "audio", "gallery", "document"]),
  media_url: z.string().url().optional(),
});

// app/api/posts/create/route.ts
import { createPostSchema } from "@/lib/validations/post";

export async function POST(req: Request) {
  const body = await req.json();
  const validated = createPostSchema.safeParse(body);

  if (!validated.success) {
    return Response.json({ error: validated.error.errors }, { status: 400 });
  }

  // Usar validated.data
}
```

---

### 7. Adicionar Meta Tags para SEO ⏱️ 30min

**Impacto**: Médio - Melhora compartilhamento, SEO

```typescript
// app/profile/[username]/page.tsx
export async function generateMetadata({ params }: Props) {
  const user = await getUserByUsername(params.username);

  return {
    title: `${user.fullName} (@${user.username}) - Aivlo`,
    description: user.bio || `Perfil de ${user.fullName} no Aivlo`,
    openGraph: {
      images: [user.avatar_url],
    },
  };
}
```

---

### 8. Adicionar Sitemap e Robots.txt ⏱️ 30min

**Impacto**: Médio - Melhora SEO

```typescript
// app/sitemap.ts
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://aivlo.com",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    // ... mais URLs
  ];
}

// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/settings/"],
    },
    sitemap: "https://aivlo.com/sitemap.xml",
  };
}
```

---

### 9. Otimizar Bundle com Análise ⏱️ 30min

**Impacto**: Médio - Identifica oportunidades de otimização

```bash
pnpm add @next/bundle-analyzer --save-dev
```

```typescript
// next.config.ts
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
  // ... sua config
});
```

```json
// package.json
{
  "scripts": {
    "analyze": "ANALYZE=true pnpm build"
  }
}
```

---

### 10. Adicionar Health Check Endpoint ⏱️ 15min

**Impacto**: Baixo - Útil para monitoring

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Verificar conexão com DB
    // Verificar serviços externos

    return Response.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    return Response.json(
      { status: "error", error: "Service unavailable" },
      { status: 503 }
    );
  }
}
```

---

## 📊 Priorização

### 🔴 Alta Prioridade (Fazer Primeiro)

1. Remover console.logs
2. Error Boundary
3. Rate Limiting
4. Validação com Zod

### 🟡 Média Prioridade (Próxima Semana)

5. Substituir `<img>` por `next/image`
6. Loading States
7. Meta Tags SEO

### 🟢 Baixa Prioridade (Quando Tiver Tempo)

8. Sitemap/Robots
9. Bundle Analysis
10. Health Check

---

## 💡 Dica Extra

Crie um script para aplicar múltiplas melhorias de uma vez:

```bash
# scripts/apply-quick-wins.sh
#!/bin/bash

echo "🚀 Aplicando Quick Wins..."

# 1. Instalar dependências
pnpm add zod @next/bundle-analyzer

# 2. Criar arquivos base
# (criar logger, error-boundary, etc)

# 3. Rodar linter
pnpm lint --fix

echo "✅ Quick Wins aplicados!"
```
