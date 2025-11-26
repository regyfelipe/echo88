"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Button } from "@/components/ui/button";
import { EditProfileModal } from "@/components/profile/edit-profile-modal";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Settings01Icon,
  Edit01Icon,
  LayoutGridIcon,
  Bookmark01Icon,
  Tag01Icon,
  IdVerifiedIcon,
  EyeIcon,
  FavouriteIcon,
  Message01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { PostCard } from "@/components/posts/post-card";
import { Music, FileText } from "lucide-react";

type TabType = "posts" | "media" | "saved" | "tagged";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>("posts");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<
    Array<{
      id: string;
      image?: string;
      content?: string;
      type?: string;
      media_url?: string;
      gallery_items?: unknown;
      document_url?: string;
      document_name?: string;
      likes: number;
      comments: number;
      shares: number;
      timeAgo: string;
    }>
  >([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [mediaPosts, setMediaPosts] = useState<
    Array<{
      id: string;
      author: {
        name: string;
        username: string;
        avatar?: string;
      };
      content?: string;
      type: string;
      media?: {
        url: string;
        thumbnail?: string;
        title?: string;
        artist?: string;
      };
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
    }>
  >([]);
  const [mediaPostsLoading, setMediaPostsLoading] = useState(true);
  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    following: 0,
    views: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [userBio, setUserBio] = useState<string | null>(null);

  // Cache keys
  const getPostsCacheKey = (userId: string) => `echo88_user_posts_${userId}`;
  const getStatsCacheKey = (userId: string) => `echo88_user_stats_${userId}`;
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  // Buscar bio do usuário
  useEffect(() => {
    async function fetchUserBio() {
      if (!user?.id) return;

      try {
        const response = await fetch("/api/users/profile");
        if (response.ok) {
          const data = await response.json();
          setUserBio(data.bio || null);
        }
      } catch (err) {
        console.error("Error fetching user bio:", err);
      }
    }

    if (user?.id) {
      fetchUserBio();
    }
  }, [user?.id]);

  // Buscar posts do usuário
  useEffect(() => {
    async function fetchUserPosts() {
      if (!user?.id) return;

      // Tentar carregar do cache primeiro
      const cacheKey = getPostsCacheKey(user.id);
      const cachedData = localStorage.getItem(cacheKey);
      const cachedTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);

      if (cachedData && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp, 10);
        const now = Date.now();

        if (now - timestamp < CACHE_DURATION) {
          try {
            const cachedPosts = JSON.parse(cachedData);
            setPosts(cachedPosts);
            setPostsLoading(false);
          } catch (e) {
            console.error("Error parsing cached posts:", e);
          }
        }
      } else {
        setPostsLoading(true);
      }

      try {
        const response = await fetch(`/api/posts/user/${user.id}`, {
          cache: "default",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch user posts");
        }
        const data = await response.json();
        const newPosts = data.posts || [];

        // Verificar se há mudanças
        const hasChanges =
          !cachedData || JSON.stringify(newPosts) !== cachedData;

        if (hasChanges) {
          setPosts(newPosts);
          localStorage.setItem(cacheKey, JSON.stringify(newPosts));
          localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
        }
      } catch (err) {
        console.error("Error fetching user posts:", err);
      } finally {
        setPostsLoading(false);
      }
    }

    if (user?.id) {
      fetchUserPosts();
    }
  }, [user?.id]);

  // Buscar posts de áudio e documento
  useEffect(() => {
    async function fetchMediaPosts() {
      if (!user?.id) return;

      setMediaPostsLoading(true);

      try {
        const response = await fetch(`/api/posts/user/${user.id}`, {
          cache: "default",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch media posts");
        }
        const data = await response.json();
        const allPosts = data.posts || [];

        // Filtrar apenas áudios e documentos
        interface PostRow {
          type: string;
          id: string;
          content?: string | null;
          media_url?: string | null;
          media_thumbnail?: string | null;
          media_title?: string | null;
          media_artist?: string | null;
          document_url?: string | null;
          document_name?: string | null;
          likes?: number;
          comments?: number;
          shares?: number;
          timeAgo?: string;
        }
        const audioAndDocPosts = (allPosts as PostRow[]).filter(
          (post) => post.type === "audio" || post.type === "document"
        );

        // Transformar para o formato do PostCard
        const formattedPosts = audioAndDocPosts.map((post) => ({
          id: post.id,
          author: {
            name: user.fullName,
            username: user.username,
            avatar: user.avatar,
          },
          content: post.content ?? undefined,
          type: post.type,
          media:
            post.type === "audio" && post.media_url
              ? {
                  url: post.media_url,
                  thumbnail: post.media_thumbnail ?? undefined,
                  title: post.media_title ?? undefined,
                  artist: post.media_artist ?? undefined,
                }
              : undefined,
          document:
            post.type === "document" && post.document_url
              ? {
                  url: post.document_url,
                  name: post.document_name || "Documento",
                }
              : undefined,
          likes: post.likes || 0,
          comments: post.comments || 0,
          shares: post.shares || 0,
          timeAgo: post.timeAgo || "",
          isLiked: false, // Será buscado depois se necessário
          isSaved: false, // Será buscado depois se necessário
        }));

        setMediaPosts(formattedPosts);
      } catch (err) {
        console.error("Error fetching media posts:", err);
      } finally {
        setMediaPostsLoading(false);
      }
    }

    if (user?.id) {
      fetchMediaPosts();
    }
  }, [user?.id]);

  // Buscar estatísticas do usuário
  useEffect(() => {
    async function fetchUserStats() {
      if (!user?.id) return;

      // Tentar carregar do cache primeiro
      const cacheKey = getStatsCacheKey(user.id);
      const cachedData = localStorage.getItem(cacheKey);
      const cachedTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);

      if (cachedData && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp, 10);
        const now = Date.now();

        if (now - timestamp < CACHE_DURATION) {
          try {
            const cachedStats = JSON.parse(cachedData);
            setStats(cachedStats);
            setStatsLoading(false);
          } catch (e) {
            console.error("Error parsing cached stats:", e);
          }
        }
      } else {
        setStatsLoading(true);
      }

      try {
        const response = await fetch(`/api/users/${user.id}/stats`, {
          cache: "default",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch user stats");
        }
        const data = await response.json();
        const newStats = {
          posts: data.posts || 0,
          followers: data.followers || 0,
          following: data.following || 0,
          views: data.views || 0,
        };

        // Verificar se há mudanças
        const hasChanges =
          !cachedData || JSON.stringify(newStats) !== cachedData;

        if (hasChanges) {
          setStats(newStats);
          localStorage.setItem(cacheKey, JSON.stringify(newStats));
          localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
        }
      } catch (err) {
        console.error("Error fetching user stats:", err);
      } finally {
        setStatsLoading(false);
      }
    }

    if (user?.id) {
      fetchUserStats();
    }
  }, [user?.id]);

  // Mostra loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não houver usuário, mostra mensagem (o AuthContext já redireciona)
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecionando...</p>
        </div>
      </div>
    );
  }

  // Dados do usuário logado
  type Highlight = {
    id: string;
    name: string;
    image: string;
  };

  type Achievement = {
    icon: typeof IdVerifiedIcon;
    label: string;
  };

  const userData = {
    name: user.fullName,
    username: user.username,
    bio: userBio,
    avatar: user.avatar,
    isVerified: user.emailVerified,
    stats: stats,
    highlights: [] as Highlight[],
    achievements: [
      ...(user.emailVerified
        ? [{ icon: IdVerifiedIcon, label: "Verificado" }]
        : []),
    ] as Achievement[],
  };

  const tabs = [
    { id: "posts" as TabType, icon: LayoutGridIcon, label: "Posts" },
    {
      id: "media" as TabType,
      icon: Music,
      label: "Áudios e Documentos",
    },
    { id: "saved" as TabType, icon: Bookmark01Icon, label: "Salvos" },
    { id: "tagged" as TabType, icon: Tag01Icon, label: "Marcados" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-xl supports-backdrop-filter:bg-background/80 shadow-sm shadow-black/5 animate-in fade-in slide-in-from-top-4 duration-700 ease-out">
        <div className="mx-auto max-w-2xl px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent transition-all duration-700 ease-out">
              {userData.username}
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="size-9 sm:size-10"
                onClick={() => router.push("/settings")}
              >
                <HugeiconsIcon
                  icon={Settings01Icon}
                  className="size-5 sm:size-6"
                />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Header - Estilo Instagram com Elementos Únicos */}
      <div className="mx-auto max-w-2xl px-3 sm:px-6 py-4 sm:py-8">
        {/* Seção Principal: Avatar + Stats + Botão */}
        <div className="flex flex-row items-start gap-3 sm:gap-12 mb-6 sm:mb-8">
          {/* Avatar com Status Online */}
          <div className="relative shrink-0">
            <div className="size-20 sm:size-28 md:size-32 rounded-full bg-muted/30 flex items-center justify-center overflow-hidden ring-2 ring-background">
              {userData.avatar ? (
                <img
                  src={userData.avatar}
                  alt={userData.name}
                  className="size-full object-cover"
                  loading="eager"
                />
              ) : (
                <span className="text-foreground/50 font-light text-4xl sm:text-5xl">
                  {userData.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Info + Stats + Botão */}
          <div className="flex-1 w-full space-y-3 sm:space-y-4">
            {/* Nome + Verificado + Botão */}
            <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-4">
              <div className="flex-1 text-left">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                  <h2 className="text-lg sm:text-2xl font-semibold text-foreground">
                    {userData.username}
                  </h2>
                  {userData.isVerified && (
                    <HugeiconsIcon
                      icon={IdVerifiedIcon}
                      className="size-4 sm:size-6 text-blue-500"
                    />
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground/70">
                  {userData.name}
                </p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 sm:gap-2 h-8 sm:h-9 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <HugeiconsIcon
                    icon={Edit01Icon}
                    className="size-3.5 sm:size-4"
                  />
                  <span className="hidden sm:inline">Editar perfil</span>
                  <span className="sm:hidden">Editar</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 sm:size-9"
                  onClick={() => router.push("/settings")}
                >
                  <HugeiconsIcon
                    icon={Settings01Icon}
                    className="size-4 sm:size-5"
                  />
                </Button>
              </div>
            </div>

            {/* Stats - Horizontal */}
            <div className="flex items-center justify-start gap-4 sm:gap-8">
              <button className="text-center group cursor-pointer">
                <p className="text-sm sm:text-lg font-semibold text-foreground group-hover:text-foreground/80 transition-colors">
                  {userData.stats.posts}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground/70">
                  posts
                </p>
              </button>
              <button className="text-center group cursor-pointer">
                <p className="text-sm sm:text-lg font-semibold text-foreground group-hover:text-foreground/80 transition-colors">
                  {userData.stats.followers}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground/70">
                  seguidores
                </p>
              </button>
              <button className="text-center group cursor-pointer">
                <p className="text-sm sm:text-lg font-semibold text-foreground group-hover:text-foreground/80 transition-colors">
                  {userData.stats.following}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground/70">
                  seguindo
                </p>
              </button>
              {/* Stat Único: Visualizações */}
              <button className="text-center group cursor-pointer flex items-center gap-0.5 sm:gap-1">
                <HugeiconsIcon
                  icon={EyeIcon}
                  className="size-3 sm:size-4 text-muted-foreground/70"
                />
                <div>
                  <p className="text-sm sm:text-lg font-semibold text-foreground group-hover:text-foreground/80 transition-colors">
                    {userData.stats.views}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground/70">
                    visualizações
                  </p>
                </div>
              </button>
            </div>

            {/* Bio */}
            {userData.bio && (
              <div className="text-left">
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                  {userData.bio}
                </p>
              </div>
            )}

            {/* Achievements - Elemento Único */}
            {userData.achievements && userData.achievements.length > 0 && (
              <div className="flex items-center justify-start gap-2 sm:gap-3 flex-wrap">
                {userData.achievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-primary/10 border border-primary/20"
                    >
                      <HugeiconsIcon
                        icon={Icon}
                        className="size-3 sm:size-4 text-primary"
                      />
                      <span className="text-[10px] sm:text-xs font-medium text-primary">
                        {achievement.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Highlights - Elemento Único */}
        {userData.highlights && userData.highlights.length > 0 && (
          <div className="mb-8 pb-6 border-b border-border/20">
            <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-2">
              {userData.highlights.map((highlight) => (
                <button
                  key={highlight.id}
                  className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer"
                >
                  <div className="size-16 sm:size-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 p-0.5 group-hover:scale-105 transition-transform">
                    <div className="size-full rounded-full overflow-hidden bg-background p-0.5">
                      <img
                        src={highlight.image}
                        alt={highlight.name}
                        className="size-full rounded-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <span className="text-xs text-foreground/80 font-medium max-w-[70px] truncate">
                    {highlight.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs - Clean & Minimal */}
      <div className="sticky top-[73px] sm:top-[81px] z-30 bg-background/80 backdrop-blur-sm border-b border-border/30">
        <div className="mx-auto max-w-2xl px-2 sm:px-6">
          <div className="flex items-center justify-center gap-0.5 sm:gap-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const isMediaTab = tab.id === "media";
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-4 transition-all duration-300 relative font-light text-xs sm:text-base",
                    isActive
                      ? "text-foreground border-b-2 border-foreground/30"
                      : "text-muted-foreground/60 hover:text-foreground/80"
                  )}
                >
                  {isMediaTab ? (
                    <Music
                      className={cn(
                        "size-4 sm:size-5 transition-all duration-300",
                        isActive && "text-foreground"
                      )}
                    />
                  ) : (
                    <HugeiconsIcon
                      icon={tab.icon as typeof LayoutGridIcon}
                      className={cn(
                        "size-4 sm:size-5 transition-all duration-300",
                        isActive && "text-foreground"
                      )}
                    />
                  )}
                  <span className="hidden sm:inline-block lowercase">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content - Clean Grid */}
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-12">
          {activeTab === "posts" && (
            <>
              {postsLoading ? (
                <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
                  <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Carregando posts...</p>
                </div>
              ) : posts.filter(
                  (post) =>
                    post.type === "image" ||
                    post.type === "video" ||
                    post.type === "gallery"
                ).length > 0 ? (
                <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
                  {posts
                    .filter(
                      (post) =>
                        post.type === "image" ||
                        post.type === "video" ||
                        post.type === "gallery"
                    )
                    .map((post, index) => {
                      // Determinar a imagem/thumbnail a mostrar
                      let imageUrl: string | undefined;
                      if (post.type === "image" && post.media_url) {
                        imageUrl = post.media_url;
                      } else if (post.type === "video" && post.media_url) {
                        imageUrl = post.media_url; // Pode usar thumbnail se disponível
                      } else if (
                        post.type === "gallery" &&
                        post.gallery_items
                      ) {
                        const firstItem = Array.isArray(post.gallery_items)
                          ? post.gallery_items[0]
                          : null;
                        imageUrl = firstItem?.url || firstItem?.thumbnail;
                      } else if (
                        post.type === "document" &&
                        post.document_url
                      ) {
                        // Para documentos, mostrar um placeholder
                        imageUrl = undefined;
                      }

                      return (
                        <article
                          key={post.id}
                          className="group relative aspect-square overflow-hidden bg-muted/30 cursor-pointer"
                          style={{
                            animationDelay: `${index * 30}ms`,
                          }}
                        >
                          {/* Post Media - Square Grid Style */}
                          {imageUrl ? (
                            <>
                              {post.type === "video" ? (
                                <video
                                  src={imageUrl}
                                  className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
                                  muted
                                  playsInline
                                />
                              ) : (
                                <img
                                  src={imageUrl}
                                  alt={post.content || `Post ${post.id}`}
                                  className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
                                  loading="lazy"
                                />
                              )}
                              {/* Overlay com informações no hover */}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
                                <div className="flex items-center gap-1 text-white">
                                  <HugeiconsIcon
                                    icon={FavouriteIcon}
                                    className="size-5 fill-white"
                                  />
                                  <span className="text-sm font-semibold">
                                    {post.likes}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-white">
                                  <HugeiconsIcon
                                    icon={Message01Icon}
                                    className="size-5"
                                  />
                                  <span className="text-sm font-semibold">
                                    {post.comments}
                                  </span>
                                </div>
                              </div>
                            </>
                          ) : post.type === "document" ? (
                            <div className="w-full h-full flex items-center justify-center bg-muted/50">
                              <div className="text-center">
                                <span className="text-3xl mb-1 block">📄</span>
                                <p className="text-xs text-muted-foreground line-clamp-2 px-2">
                                  {post.document_name || "Documento"}
                                </p>
                              </div>
                            </div>
                          ) : post.type === "text" ? (
                            <div className="w-full h-full flex items-center justify-center bg-muted/50 p-3">
                              <p className="text-xs text-foreground/70 line-clamp-4 text-center">
                                {post.content || "Post de texto"}
                              </p>
                            </div>
                          ) : null}
                        </article>
                      );
                    })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center animate-in fade-in zoom-in-95 duration-700">
                  <div className="size-16 sm:size-20 rounded-full bg-muted/50 flex items-center justify-center mb-4 sm:mb-6">
                    <HugeiconsIcon
                      icon={LayoutGridIcon}
                      className="size-8 sm:size-10 text-muted-foreground/50"
                    />
                  </div>
                  <p className="text-foreground/80 text-base sm:text-lg font-medium mb-1.5">
                    Nenhum post ainda
                  </p>
                  <p className="text-muted-foreground/70 text-sm sm:text-base">
                    Quando você criar posts, eles aparecerão aqui
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === "media" && (
            <>
              {mediaPostsLoading ? (
                <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
                  <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    Carregando áudios e documentos...
                  </p>
                </div>
              ) : mediaPosts.length > 0 ? (
                <div className="space-y-4">
                  {mediaPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      id={post.id}
                      author={post.author}
                      content={post.content}
                      type={
                        post.type as
                          | "text"
                          | "image"
                          | "video"
                          | "audio"
                          | "gallery"
                          | "document"
                      }
                      media={post.media}
                      document={post.document}
                      likes={post.likes}
                      comments={post.comments}
                      shares={post.shares}
                      timeAgo={post.timeAgo}
                      isLiked={post.isLiked}
                      isSaved={post.isSaved}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center animate-in fade-in zoom-in-95 duration-700">
                  <div className="size-16 sm:size-20 rounded-full bg-muted/50 flex items-center justify-center mb-4 sm:mb-6">
                    <Music className="size-8 sm:size-10 text-muted-foreground/50" />
                  </div>
                  <p className="text-foreground/80 text-base sm:text-lg font-medium mb-1.5">
                    Nenhum áudio ou documento ainda
                  </p>
                  <p className="text-muted-foreground/70 text-sm sm:text-base">
                    Quando você criar posts de áudio ou documentos, eles
                    aparecerão aqui
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === "saved" && (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center animate-in fade-in zoom-in-95 duration-700">
              <div className="size-16 sm:size-20 rounded-full bg-muted/50 flex items-center justify-center mb-4 sm:mb-6">
                <HugeiconsIcon
                  icon={Bookmark01Icon}
                  className="size-8 sm:size-10 text-muted-foreground/50"
                />
              </div>
              <p className="text-foreground/80 text-base sm:text-lg font-medium mb-1.5">
                Nenhum post salvo
              </p>
              <p className="text-muted-foreground/70 text-sm sm:text-base">
                Posts que você salvar aparecerão aqui
              </p>
            </div>
          )}

          {activeTab === "tagged" && (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center animate-in fade-in zoom-in-95 duration-700">
              <div className="size-16 sm:size-20 rounded-full bg-muted/50 flex items-center justify-center mb-4 sm:mb-6">
                <HugeiconsIcon
                  icon={Tag01Icon}
                  className="size-8 sm:size-10 text-muted-foreground/50"
                />
              </div>
              <p className="text-foreground/80 text-base sm:text-lg font-medium mb-1.5">
                Nenhuma foto marcada
              </p>
              <p className="text-muted-foreground/70 text-sm sm:text-base">
                Fotos em que você foi marcado aparecerão aqui
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={async () => {
          // Recarregar dados do perfil após edição
          try {
            const response = await fetch("/api/users/profile");
            if (response.ok) {
              const data = await response.json();
              setUserBio(data.bio || null);
            }
          } catch (err) {
            console.error("Error reloading profile:", err);
          }
          router.refresh();
        }}
      />
    </div>
  );
}
