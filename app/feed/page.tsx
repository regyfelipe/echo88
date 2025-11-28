"use client";

import { useEffect, useState, useCallback, Suspense, useRef } from "react";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { InlineAd } from "@/components/shared/google-ad";
import { PostCardSkeleton } from "@/components/shared/loading-skeleton";
import { PostCard, StoriesBar } from "@/components/lazy";
import { useFeedPreferences } from "@/lib/hooks/use-feed-preferences";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { useToast } from "@/contexts/toast-context";
import { useAuth } from "@/contexts/auth-context";
import { useInfiniteFeedPosts } from "@/lib/hooks/use-posts";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock01Icon,
  TradeUpIcon,
  MagicWand05Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  author: {
    name: string;
    username: string;
    avatar?: string;
  };
  content?: string;
  type: "text" | "image" | "video" | "audio" | "gallery" | "document";
  media?: {
    url: string;
    thumbnail?: string;
    title?: string;
    artist?: string;
  };
  gallery?: Array<{
    url: string;
    type: "image" | "video";
    thumbnail?: string;
  }>;
  document?: {
    url: string;
    name: string;
  };
  likes: number;
  comments: number;
  shares: number;
  timeAgo: string;
  isLiked?: boolean;
  isSaved?: boolean;
}

export default function FeedPage() {
  const feedContainerRef = useRef<HTMLElement | null>(null);
  const {
    feedType,
    setFeedType,
    isLoading: isLoadingPreferences,
  } = useFeedPreferences();
  const { success, error: showError } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  // React Query com infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useInfiniteFeedPosts({
    limit: 20,
    sort: feedType,
    enabled: !!user && !authLoading,
  });

  // Flatten posts de todas as páginas
  const posts: Post[] =
    data?.pages.flatMap(
      (page: { posts: Post[]; hasMore: boolean; nextOffset: number }) =>
        page.posts || []
    ) || [];

  const handleRefresh = useCallback(async () => {
    await refetch();
    success("Feed atualizado!", "Novos posts foram carregados");
  }, [refetch, success]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Pull to refresh
  const {
    containerRef: pullToRefreshRef,
    isRefreshing: isPullRefreshing,
    pullDistance,
    progress,
  } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
    disabled: isLoading || isRefetching,
  });

  // Infinite scroll
  const { sentinelRef } = useInfiniteScroll({
    hasMore: hasNextPage ?? false,
    isLoading: isFetchingNextPage,
    onLoadMore: handleLoadMore,
    threshold: 200,
  });

  if (isLoading && posts.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-background pb-28">
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/80 animate-in fade-in slide-in-from-top-4 duration-700 ease-out shadow-sm">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3">
            <h1 className="text-lg sm:text-xl font-bold transition-all duration-500 ease-out">
              Aivlo
            </h1>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando posts...</p>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-background pb-28">
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/80 animate-in fade-in slide-in-from-top-4 duration-700 ease-out shadow-sm">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3">
            <h1
              onClick={handleRefresh}
              className="text-lg sm:text-xl font-bold transition-all duration-500 ease-out cursor-pointer hover:scale-105 active:scale-95 select-none"
              title="Clique para atualizar"
            >
              Aivlo
            </h1>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-2">Erro ao carregar posts</p>
            <p className="text-muted-foreground text-sm">
              {error instanceof Error ? error.message : "Erro desconhecido"}
            </p>
            <Button onClick={handleRefresh} className="mt-4">
              Tentar novamente
            </Button>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-28 relative">
      {/* Pull to refresh indicator */}
      {pullDistance > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center py-4 pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <div className="relative size-10">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div
                className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent"
                style={{
                  transform: `rotate(${progress * 3.6}deg)`,
                  transition: "transform 0.1s ease-out",
                }}
              />
              {progress >= 100 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {progress >= 100 ? "Solte para atualizar" : "Puxe para atualizar"}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/80 animate-in fade-in slide-in-from-top-4 duration-700 ease-out shadow-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3">
          <h1
            onClick={handleRefresh}
            className={cn(
              "text-lg sm:text-xl font-bold transition-all duration-500 ease-out",
              "cursor-pointer hover:scale-105 active:scale-95 select-none",
              isRefetching && "animate-spin"
            )}
            title="Clique para atualizar"
          >
            Aivlo
          </h1>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 h-9"
                  disabled={isLoadingPreferences}
                >
                  {feedType === "chronological" && (
                    <>
                      <HugeiconsIcon icon={Clock01Icon} className="size-4" />
                      <span className="hidden sm:inline">Cronológico</span>
                    </>
                  )}
                  {feedType === "relevance" && (
                    <>
                      <HugeiconsIcon icon={TradeUpIcon} className="size-4" />
                      <span className="hidden sm:inline">Relevância</span>
                    </>
                  )}
                  {feedType === "personalized" && (
                    <>
                      <HugeiconsIcon
                        icon={MagicWand05Icon}
                        className="size-4"
                      />
                      <span className="hidden sm:inline">Personalizado</span>
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setFeedType("chronological")}
                  className={cn(feedType === "chronological" && "bg-accent")}
                >
                  <HugeiconsIcon icon={Clock01Icon} className="size-4 mr-2" />
                  Cronológico
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFeedType("relevance")}
                  className={cn(feedType === "relevance" && "bg-accent")}
                >
                  <HugeiconsIcon icon={TradeUpIcon} className="size-4 mr-2" />
                  Relevância
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFeedType("personalized")}
                  className={cn(feedType === "personalized" && "bg-accent")}
                >
                  <HugeiconsIcon
                    icon={MagicWand05Icon}
                    className="size-4 mr-2"
                  />
                  Personalizado
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="size-9 sm:size-10 rounded-full bg-primary/20 flex items-center justify-center transition-all duration-500 ease-out hover:scale-110 hover:ring-2 hover:ring-primary/30 hover:shadow-md cursor-pointer touch-manipulation">
              <span className="text-primary font-semibold text-sm sm:text-base">
                U
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Stories Bar */}
      <Suspense fallback={<div className="h-24" />}>
        <StoriesBar />
      </Suspense>

      {/* Feed */}
      <main
        className="flex-1 overflow-y-auto"
        ref={(node) => {
          feedContainerRef.current = node;
          if (node && pullToRefreshRef) {
            (
              pullToRefreshRef as React.MutableRefObject<HTMLElement | null>
            ).current = node;
          }
        }}
      >
        <div className="mx-auto max-w-2xl px-2 sm:px-4">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center animate-in fade-in zoom-in-95 duration-700">
              <div className="size-16 sm:size-20 rounded-full bg-muted/50 flex items-center justify-center mb-4 sm:mb-6">
                <span className="text-4xl">📭</span>
              </div>
              <p className="text-foreground/80 text-base sm:text-lg font-medium mb-1.5">
                Nenhum post ainda
              </p>
              <p className="text-muted-foreground/70 text-sm sm:text-base">
                Seja o primeiro a criar um post!
              </p>
            </div>
          ) : (
            <>
              {posts.map((post, index) => (
                <div key={post.id || index}>
                  <div
                    className="animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out mb-4"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: "both",
                    }}
                  >
                    <Suspense fallback={<PostCardSkeleton />}>
                      <PostCard {...post} />
                    </Suspense>
                  </div>

                  {/* Anúncio do Google após cada 3 postagens */}
                  {(index + 1) % 3 === 0 && index < posts.length - 1 && (
                    <InlineAd />
                  )}
                </div>
              ))}

              {/* Sentinel para infinite scroll */}
              <div ref={sentinelRef} className="h-4" />

              {/* Loading mais posts */}
              {isFetchingNextPage && (
                <div className="flex items-center justify-center py-8">
                  <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="ml-3 text-sm text-muted-foreground">
                    Carregando mais posts...
                  </span>
                </div>
              )}

              {/* Fim dos posts */}
              {!hasNextPage && posts.length > 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground text-sm">
                    Você viu todos os posts!
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
