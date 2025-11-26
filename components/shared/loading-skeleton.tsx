/**
 * Componente de skeleton loading para posts
 */
export function PostCardSkeleton() {
  return (
    <article className="bg-background animate-pulse">
      <div className="p-4">
        {/* Header skeleton */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2.5 flex-1">
            <div className="size-10 rounded-full bg-muted" />
            <div className="flex-1">
              <div className="h-4 w-24 bg-muted rounded mb-1" />
              <div className="h-3 w-32 bg-muted rounded" />
            </div>
          </div>
          <div className="h-3 w-16 bg-muted rounded" />
        </div>

        {/* Content skeleton */}
        <div className="h-4 w-full bg-muted rounded mb-2" />
        <div className="h-4 w-3/4 bg-muted rounded mb-3" />

        {/* Media skeleton */}
        <div className="h-64 w-full bg-muted rounded-lg mb-3" />

        {/* Actions skeleton */}
        <div className="flex items-center justify-between pt-2.5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-16 bg-muted rounded-full" />
            <div className="h-8 w-16 bg-muted rounded-full" />
            <div className="h-8 w-16 bg-muted rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-muted rounded-full" />
            <div className="h-8 w-8 bg-muted rounded-full" />
            <div className="h-8 w-8 bg-muted rounded-full" />
          </div>
        </div>
      </div>
    </article>
  );
}

export function MediaViewerSkeleton() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl p-4">
        <div className="aspect-square bg-muted rounded-lg animate-pulse" />
      </div>
    </div>
  );
}
