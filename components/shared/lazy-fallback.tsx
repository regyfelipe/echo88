/**
 * Componentes de Fallback para Lazy Loading
 *
 * Fornece fallbacks otimizados e consistentes para componentes lazy
 */

import { cn } from "@/lib/utils";

/**
 * Fallback genérico para qualquer componente
 */
export function LazyFallback({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "size-4",
    md: "size-8",
    lg: "size-12",
  };

  return (
    <div className={cn("flex items-center justify-center p-4", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-primary border-t-transparent",
          sizes[size]
        )}
      />
    </div>
  );
}

/**
 * Fallback para cards de post
 */
export function PostCardFallback() {
  return (
    <div className="animate-pulse space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/4 rounded bg-muted" />
          <div className="h-3 w-1/6 rounded bg-muted" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
      </div>
      <div className="h-64 rounded-lg bg-muted" />
      <div className="flex items-center gap-4">
        <div className="h-4 w-16 rounded bg-muted" />
        <div className="h-4 w-16 rounded bg-muted" />
        <div className="h-4 w-16 rounded bg-muted" />
      </div>
    </div>
  );
}

/**
 * Fallback para modais
 */
export function ModalFallback() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}

/**
 * Fallback para grid de imagens
 */
export function ImageGridFallback({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="aspect-square animate-pulse bg-muted"
          style={{ animationDelay: `${i * 50}ms` }}
        />
      ))}
    </div>
  );
}

/**
 * Fallback para lista de usuários
 */
export function UserListFallback({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 animate-pulse"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="size-12 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded bg-muted" />
            <div className="h-3 w-1/4 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Fallback para viewer de mídia
 */
export function MediaViewerFallback() {
  return (
    <div className="flex min-h-[500px] items-center justify-center bg-muted/30">
      <div className="text-center">
        <div className="size-16 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
        <p className="text-muted-foreground">Carregando mídia...</p>
      </div>
    </div>
  );
}
