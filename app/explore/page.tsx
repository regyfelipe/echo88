"use client";

import { useState, useMemo, useCallback, lazy, Suspense } from "react";
import Image from "next/image";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  CancelCircleIcon,
  FavouriteIcon,
  Message01Icon,
  Image01Icon,
  ThumbsDownIcon,
  Navigation03Icon,
  Analytics03Icon,
  Bookmark02Icon,
  User03Icon,
  Tag01Icon,
  PlayCircle02Icon,
  Video01Icon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import type { PostType, MediaItem } from "@/components/posts/post-card";
import { cn } from "@/lib/utils";
import { useExplore } from "@/lib/hooks/use-explore";
import {
  PostCardSkeleton,
  MediaViewerSkeleton,
} from "@/components/shared/loading-skeleton";
import { OptimizedImage } from "@/components/shared/optimized-image";
import Link from "next/link";

// Componentes lazy já importados de @/components/lazy
import { PostCard, MediaViewer } from "@/components/lazy";

interface ExplorePost {
  id: string;
  author: {
    name: string;
    username: string;
    avatar?: string;
  };
  content?: string;
  type: PostType;
  media?: {
    url: string;
    thumbnail?: string;
    title?: string;
    artist?: string;
  };
  gallery?: MediaItem[];
  category?: {
    name: string;
    icon?: React.ReactNode;
  };
  likes: number;
  comments: number;
  shares: number;
  timeAgo: string;
}

type SearchType = "all" | "posts" | "users" | "hashtags";

interface SearchUser {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  followersCount?: number;
}

interface SearchHashtag {
  id: string;
  name: string;
  postsCount: number;
}

type ExploreMode = "popular" | "trending" | "search";

export default function ExplorePage() {
  const [searchType, setSearchType] = useState<SearchType>("all");
  const [selectedPost, setSelectedPost] = useState<ExplorePost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    exploreMode,
    setExploreMode,
    posts,
    users,
    hashtags,
    trendingHashtags,
    userSuggestions,
    searchHistory,
    isLoading,
    handleSearchFromHistory,
    clearSearchHistory,
  } = useExplore();

  // Usar posts reais da API
  const displayPosts = useMemo(() => posts as ExplorePost[], [posts]);

  const handlePostClick = useCallback((post: ExplorePost) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  }, []);

  const getPostImage = useCallback((post: ExplorePost) => {
    if (post.gallery && post.gallery.length > 0) {
      return post.gallery[0].url;
    }
    // Para vídeos, preferir thumbnail, senão usar a URL do vídeo
    if (post.type === "video") {
      return post.media?.thumbnail || post.media?.url;
    }
    return post.media?.url;
  }, []);

  const getPostThumbnail = useCallback((post: ExplorePost) => {
    if (post.gallery && post.gallery.length > 0) {
      return post.gallery[0].thumbnail || post.gallery[0].url;
    }
    return post.media?.thumbnail || post.media?.url;
  }, []);

  const hasValidMedia = useCallback((post: ExplorePost) => {
    // Verificar se o post tem mídia válida para exibir
    if (post.type === "text" || post.type === "document") {
      return false; // Textos e documentos não aparecem no grid
    }
    if (post.gallery && post.gallery.length > 0) {
      return true;
    }
    if (post.type === "video" || post.type === "image") {
      return !!post.media?.url;
    }
    if (post.type === "audio") {
      return false; // Áudios não aparecem no grid
    }
    return false;
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedPost(null);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, [setSearchQuery]);

  return (
    <div className="flex min-h-screen flex-col bg-background pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60 shadow-sm shadow-black/5 animate-in fade-in slide-in-from-top-4 duration-700 ease-out">
        <div className="mx-auto max-w-2xl px-3 sm:px-4 py-3 sm:py-4">
          <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent transition-all duration-700 ease-out">
            Explorar
          </h1>
          <div className="relative group">
            <HugeiconsIcon
              icon={Search01Icon}
              className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60 pointer-events-none transition-all duration-500 group-focus-within:text-primary/80 group-focus-within:scale-110"
            />
            <Input
              type="search"
              placeholder="Buscar pessoas, posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                }
              }}
              className="pl-9 sm:pl-10 pr-9 sm:pr-10 h-10 sm:h-11 text-sm sm:text-base transition-all duration-500 ease-out focus:ring-2 focus:ring-primary/30 focus:border-primary/50 bg-muted/30 border-border/50 hover:bg-muted/50 focus:bg-background"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 size-9 sm:size-10 h-9 sm:h-10 rounded-full hover:bg-accent/60 transition-all duration-300 hover:scale-110 active:scale-95 touch-manipulation"
                onClick={handleClearSearch}
              >
                <HugeiconsIcon icon={CancelCircleIcon} className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Tabs de modo (Popular/Trending) ou busca */}
      {!searchQuery.trim() ? (
        <div className="border-b border-border bg-background/50 backdrop-blur-sm">
          <div className="mx-auto max-w-2xl px-3 sm:px-4">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
              {(["popular", "trending"] as ExploreMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setExploreMode(mode)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-all duration-300 border-b-2 whitespace-nowrap",
                    exploreMode === mode
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {mode === "popular" && "Popular"}
                  {mode === "trending" && "Em Alta"}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="border-b border-border bg-background/50 backdrop-blur-sm">
          <div className="mx-auto max-w-2xl px-3 sm:px-4">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
              {(["all", "posts", "users", "hashtags"] as SearchType[]).map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => setSearchType(type)}
                    className={cn(
                      "px-4 py-2 text-sm font-medium transition-all duration-300 border-b-2 whitespace-nowrap",
                      searchType === type
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {type === "all" && "Tudo"}
                    {type === "posts" && "Posts"}
                    {type === "users" && "Usuários"}
                    {type === "hashtags" && "Hashtags"}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 p-0.5 sm:p-1 md:p-2">
        {/* Histórico de buscas quando input está focado e vazio */}
        {!searchQuery.trim() && searchHistory.length > 0 && (
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">
                Buscas recentes
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearchHistory}
                className="text-xs h-7"
              >
                Limpar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleSearchFromHistory(query)}
                  className="px-3 py-1.5 text-sm rounded-full bg-muted/50 hover:bg-muted border border-border/50 transition-colors"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Seções quando não há busca */}
        {!searchQuery.trim() && exploreMode !== "search" && (
          <div className="mx-auto max-w-2xl px-4 space-y-6 pb-6">
            {/* Sugestões de usuários */}
            {userSuggestions.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">
                  Sugestões para você
                </h2>
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                  {userSuggestions.map((user) => (
                    <Link
                      key={user.id}
                      href={`/profile/${user.username}`}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors min-w-[120px] shrink-0"
                    >
                      <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                        {user.avatar ? (
                          <OptimizedImage
                            src={user.avatar}
                            alt={user.username}
                            width={64}
                            height={64}
                            className="rounded-full object-cover"
                            quality={80}
                          />
                        ) : (
                          <span className="text-primary font-semibold text-xl">
                            {user.name[0]?.toUpperCase() || "U"}
                          </span>
                        )}
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-sm truncate w-full">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate w-full">
                          @{user.username}
                        </p>
                        {user.followersCount !== undefined && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {user.followersCount} seguidores
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Hashtags Trending */}
            {trendingHashtags.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Hashtags em alta</h2>
                <div className="flex flex-wrap gap-2">
                  {trendingHashtags.slice(0, 10).map((hashtag) => (
                    <Link
                      key={hashtag.id}
                      href={`/hashtag/${hashtag.name}`}
                      className="px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-colors flex items-center gap-2"
                    >
                      <HugeiconsIcon
                        icon={Tag01Icon}
                        className="size-4 text-primary"
                      />
                      <span className="font-semibold text-sm">
                        #{hashtag.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {hashtag.postsCount}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="size-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Buscando...</p>
          </div>
        ) : searchQuery.trim() &&
          searchType === "users" &&
          users.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in zoom-in-95 duration-700">
            <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <HugeiconsIcon
                icon={User03Icon}
                className="size-7 text-muted-foreground/50"
              />
            </div>
            <p className="text-foreground/80 text-lg font-medium mb-1.5">
              Nenhum usuário encontrado
            </p>
            <p className="text-muted-foreground/70 text-sm">
              Tente buscar por outro termo
            </p>
          </div>
        ) : searchQuery.trim() &&
          searchType === "hashtags" &&
          hashtags.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in zoom-in-95 duration-700">
            <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <HugeiconsIcon
                icon={Tag01Icon}
                className="size-7 text-muted-foreground/50"
              />
            </div>
            <p className="text-foreground/80 text-lg font-medium mb-1.5">
              Nenhuma hashtag encontrada
            </p>
            <p className="text-muted-foreground/70 text-sm">
              Tente buscar por outro termo
            </p>
          </div>
        ) : searchQuery.trim() && searchType === "users" ? (
          <div className="mx-auto max-w-2xl px-4 py-4 space-y-3">
            {users.map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.username}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.username}
                      width={48}
                      height={48}
                      className="size-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-primary font-semibold">
                      {user.name[0]?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{user.name}</p>
                  <p className="text-muted-foreground text-xs truncate">
                    @{user.username}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : searchQuery.trim() && searchType === "hashtags" ? (
          <div className="mx-auto max-w-2xl px-4 py-4 space-y-3">
            {hashtags.map((hashtag) => (
              <Link
                key={hashtag.id}
                href={`/hashtags/${hashtag.name}`}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <HugeiconsIcon
                      icon={Tag01Icon}
                      className="size-5 text-primary"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-base">#{hashtag.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {hashtag.postsCount} post
                      {hashtag.postsCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : searchQuery.trim() && displayPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in zoom-in-95 duration-700">
            <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <HugeiconsIcon
                icon={Search01Icon}
                className="size-7 text-muted-foreground/50"
              />
            </div>
            <p className="text-foreground/80 text-lg font-medium mb-1.5">
              Nenhum resultado encontrado
            </p>
            <p className="text-muted-foreground/70 text-sm">
              Tente buscar por outro termo
            </p>
          </div>
        ) : !searchQuery.trim() && displayPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in zoom-in-95 duration-700">
            <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <HugeiconsIcon
                icon={Image01Icon}
                className="size-7 text-muted-foreground/50"
              />
            </div>
            <p className="text-foreground/80 text-lg font-medium mb-1.5">
              Nenhum post ainda
            </p>
            <p className="text-muted-foreground/70 text-sm">
              Quando houver posts, eles aparecerão aqui
            </p>
          </div>
        ) : displayPosts.length > 0 ? (
          <div className="mx-auto max-w-2xl">
            {/* Grid de imagens estilo Instagram */}
            <div className="grid grid-cols-3 gap-0.5 sm:gap-1 md:gap-1.5">
              {displayPosts
                .filter((post) => hasValidMedia(post))
                .map((post, index) => {
                  const imageUrl = getPostImage(post);
                  const thumbnailUrl = getPostThumbnail(post);
                  const hasMultiple = post.gallery && post.gallery.length > 1;
                  const isVideo = post.type === "video";
                  const isGallery = post.type === "gallery";
                  const hasVideoInGallery =
                    isGallery &&
                    post.gallery?.some((item) => item.type === "video");

                  if (!imageUrl) return null;

                  return (
                    <div
                      key={post.id}
                      className="relative group cursor-pointer aspect-square overflow-hidden bg-muted/30 rounded-none sm:rounded-md md:rounded-lg animate-in fade-in zoom-in-95 duration-700 ease-out"
                      style={{
                        animationDelay: `${(index % 15) * 30}ms`,
                      }}
                      onClick={() => handlePostClick(post)}
                    >
                      {/* Imagem com efeito de brilho sutil */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 ease-out z-10" />

                      {/* Renderizar vídeo ou imagem */}
                      {isVideo ? (
                        <>
                          {/* Usar thumbnail se disponível, senão usar a URL do vídeo como fallback */}
                          {thumbnailUrl ? (
                            <OptimizedImage
                              src={thumbnailUrl}
                              alt={
                                post.content || `Vídeo de ${post.author.name}`
                              }
                              fill
                              className="!relative object-cover transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.08] group-active:scale-[1.05]"
                              sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
                              quality={85}
                            />
                          ) : (
                            <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                              <HugeiconsIcon
                                icon={PlayCircle02Icon}
                                className="size-12 text-muted-foreground/50"
                              />
                            </div>
                          )}
                          {/* Indicador de play no centro */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="size-12 sm:size-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out shadow-xl border border-white/20">
                              <HugeiconsIcon
                                icon={PlayCircle02Icon}
                                className="size-6 sm:size-8 text-white"
                              />
                            </div>
                          </div>
                          {/* Badge de vídeo no canto */}
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1.5 rounded-full shadow-lg border border-white/10">
                            <HugeiconsIcon
                              icon={Video01Icon}
                              className="size-3.5 text-white"
                            />
                            <span className="text-white text-[11px] font-semibold tracking-wide">
                              Vídeo
                            </span>
                          </div>
                        </>
                      ) : hasVideoInGallery ? (
                        <>
                          <OptimizedImage
                            src={thumbnailUrl || imageUrl || ""}
                            alt={post.content || `Post de ${post.author.name}`}
                            fill
                            className="!relative object-cover transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.08] group-active:scale-[1.05]"
                            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
                            quality={85}
                          />
                          {/* Indicador de vídeo na galeria */}
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1.5 rounded-full shadow-lg border border-white/10">
                            <HugeiconsIcon
                              icon={Video01Icon}
                              className="size-3.5 text-white"
                            />
                            <span className="text-white text-[11px] font-semibold tracking-wide">
                              Vídeo
                            </span>
                          </div>
                        </>
                      ) : (
                        <OptimizedImage
                          src={imageUrl || ""}
                          alt={post.content || `Post de ${post.author.name}`}
                          fill
                          className="!relative object-cover transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.08] group-active:scale-[1.05]"
                          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
                          quality={85}
                        />
                      )}

                      {/* Overlay gradiente no hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out" />

                      {/* Indicador de múltiplas imagens */}
                      {hasMultiple && (
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out transform translate-y-1 group-hover:translate-y-0 shadow-lg border border-white/10">
                          <HugeiconsIcon
                            icon={Image01Icon}
                            className="size-3.5 text-white"
                          />
                          <span className="text-white text-[11px] font-semibold tracking-wide">
                            {post.gallery?.length}
                          </span>
                        </div>
                      )}

                      {/* Informações no hover com animação elegante */}
                      <div className="absolute inset-0 flex items-center justify-between px-3 sm:px-4 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out">
                        {/* Lado esquerdo: ThumbsDownIcon, FavouriteIcon, Message01Icon */}
                        <div className="flex items-center gap-2 sm:gap-3 text-white transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-700 ease-out">
                          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-md px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full shadow-xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-110 active:scale-95 touch-manipulation">
                            <HugeiconsIcon
                              icon={ThumbsDownIcon}
                              className="size-3.5 sm:size-4"
                            />
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-md px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full shadow-xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-110 active:scale-95 touch-manipulation">
                            <HugeiconsIcon
                              icon={FavouriteIcon}
                              className="size-3.5 sm:size-4 fill-white"
                            />
                            <span className="text-xs sm:text-sm font-semibold tracking-wide">
                              {post.likes}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-md px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full shadow-xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-110 active:scale-95 touch-manipulation">
                            <HugeiconsIcon
                              icon={Message01Icon}
                              className="size-3.5 sm:size-4"
                            />
                            <span className="text-xs sm:text-sm font-semibold tracking-wide">
                              {post.comments}
                            </span>
                          </div>
                        </div>

                        {/* Lado direito: Navigation03Icon, Analytics03Icon, Bookmark02Icon */}
                        <div className="flex items-center gap-2 sm:gap-3 text-white transform translate-x-[10px] group-hover:translate-x-0 transition-all duration-700 ease-out">
                          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-md px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full shadow-xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-110 active:scale-95 touch-manipulation">
                            <HugeiconsIcon
                              icon={Navigation03Icon}
                              className="size-3.5 sm:size-4"
                            />
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-md px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full shadow-xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-110 active:scale-95 touch-manipulation">
                            <HugeiconsIcon
                              icon={Analytics03Icon}
                              className="size-3.5 sm:size-4"
                            />
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-md px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full shadow-xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-110 active:scale-95 touch-manipulation">
                            <HugeiconsIcon
                              icon={Bookmark02Icon}
                              className="size-3.5 sm:size-4"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Efeito de brilho sutil no canto */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 ease-out blur-xl" />
                    </div>
                  );
                })}
            </div>
          </div>
        ) : null}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Media Viewer */}
      {selectedPost &&
        (selectedPost.type === "image" ||
          selectedPost.type === "gallery" ||
          selectedPost.type === "video") && (
          <Suspense fallback={<MediaViewerSkeleton />}>
            <MediaViewer
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              author={selectedPost.author}
              content={selectedPost.content}
              media={selectedPost.media}
              gallery={selectedPost.gallery}
              likes={selectedPost.likes}
              comments={selectedPost.comments}
              shares={selectedPost.shares}
              timeAgo={selectedPost.timeAgo}
            />
          </Suspense>
        )}
    </div>
  );
}
