"use client";

import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { InlineAd } from "@/components/shared/google-ad";
import { PostCardSkeleton } from "@/components/shared/loading-skeleton";
import { postsApi } from "@/lib/api/posts";
import { useFeedPreferences } from "@/lib/hooks/use-feed-preferences";
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

// Lazy load componentes pesados
const PostCard = lazy(() =>
  import("@/components/posts/post-card").then((mod) => ({
    default: mod.PostCard,
  }))
);

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

const CACHE_KEY = "echo88_feed_cache";
const CACHE_TIMESTAMP_KEY = "echo88_feed_cache_timestamp";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    feedType,
    setFeedType,
    isLoading: isLoadingPreferences,
  } = useFeedPreferences();

  // Carregar do cache imediatamente
  useEffect(() => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

    if (cachedData && cachedTimestamp) {
      const timestamp = parseInt(cachedTimestamp, 10);
      const now = Date.now();

      // Se o cache é recente (menos de 5 minutos), usar imediatamente
      if (now - timestamp < CACHE_DURATION) {
        try {
          const cachedPosts = JSON.parse(cachedData);
          setPosts(cachedPosts);
        } catch (e) {
          console.error("Error parsing cached posts:", e);
        }
      }
    } else {
      // Se não tem cache, mostrar loading
      setIsLoading(true);
    }

    // Sempre buscar atualizações em background
    fetchPosts(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedType]);

  const fetchPosts = async (showRefreshing = false, forceRefresh = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        // Só mostrar loading se não tiver posts em cache
        setPosts((currentPosts) => {
          if (currentPosts.length === 0 && !forceRefresh) {
            setIsLoading(true);
          }
          return currentPosts;
        });
      }
      setError(null);

      const data = await postsApi.getFeed({
        limit: undefined,
        offset: undefined,
        type: feedType,
      });
      const newPosts = data.posts || [];

      // Atualizar posts e verificar mudanças
      setPosts((currentPosts) => {
        // Verificar se há mudanças antes de atualizar
        const hasChanges =
          JSON.stringify(currentPosts) !== JSON.stringify(newPosts);

        if (hasChanges || forceRefresh || currentPosts.length === 0) {
          // Salvar no cache
          localStorage.setItem(CACHE_KEY, JSON.stringify(newPosts));
          localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
          return newPosts;
        }
        return currentPosts;
      });
    } catch (err) {
      console.error("Error fetching posts:", err);
      // Se houver erro e não tiver posts, mostrar erro
      setPosts((currentPosts) => {
        if (currentPosts.length === 0) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to load posts";
          setError(errorMessage);
        }
        return currentPosts;
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchPosts(true, true);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background pb-28">
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/80 animate-in fade-in slide-in-from-top-4 duration-700 ease-out shadow-sm">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3">
            <h1
              onClick={handleRefresh}
              className="text-lg sm:text-xl font-bold transition-all duration-500 ease-out cursor-pointer hover:scale-105 active:scale-95 select-none"
              title="Clique para atualizar"
            >
              Echo88
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
              Echo88
            </h1>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-2">Erro ao carregar posts</p>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/80 animate-in fade-in slide-in-from-top-4 duration-700 ease-out shadow-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3">
          <h1
            onClick={handleRefresh}
            className={cn(
              "text-lg sm:text-xl font-bold transition-all duration-500 ease-out",
              "cursor-pointer hover:scale-105 active:scale-95 select-none",
              isRefreshing && "animate-spin"
            )}
            title="Clique para atualizar"
          >
            Echo88
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

      {/* Feed */}
      <main className="flex-1">
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
            posts.map((post, index) => (
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
            ))
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
