/**
 * Global Error Handler
 * 
 * Handler de erro global para o Next.js App Router
 * Captura erros que não foram tratados por error.tsx
 */

"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, RefreshIcon } from "@hugeicons/core-free-icons";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log do erro crítico
    console.error("[GlobalError] Erro crítico:", error);

    // Reportar erro crítico em produção
    if (process.env.NODE_ENV === "production") {
      // Exemplo: enviar para serviço de monitoramento
      // window.Sentry?.captureException(error, { level: "fatal" });
    }
  }, [error]);

  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  return (
    <html lang="pt-BR">
      <body>
        <div className="flex min-h-screen items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
                  <HugeiconsIcon
                    icon={AlertCircleIcon}
                    className="size-6 text-destructive"
                  />
                </div>
                <div>
                  <CardTitle>Erro crítico</CardTitle>
                  <CardDescription>
                    Ocorreu um erro crítico na aplicação. Por favor, recarregue a página.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === "development" && (
                <div className="rounded-lg bg-muted p-4">
                  <p className="font-mono text-sm text-destructive">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={reset} variant="outline" className="flex-1">
                  <HugeiconsIcon icon={RefreshIcon} className="mr-2 size-4" />
                  Tentar novamente
                </Button>
                <Button onClick={handleReload} className="flex-1">
                  Recarregar aplicação
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}

