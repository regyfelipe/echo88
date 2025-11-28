"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Button } from "@/components/ui/button";
// EditProfileModal agora é lazy loaded
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
  FileEditIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { Music } from "lucide-react";
import { BioRenderer } from "@/components/profile/bio-renderer";
import { cache } from "@/lib/cache/cache-manager";
import { OptimizedImage } from "@/components/shared/optimized-image";
import { PostCard, EditProfileModal } from "@/components/lazy";
import { Suspense } from "react";
import {
  PostCardFallback,
  ModalFallback,
} from "@/components/shared/lazy-fallback";

type TabType = "posts" | "content" | "saved" | "tagged";

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
  const [profileCustomization, setProfileCustomization] = useState<{
    coverImage: string | null;
    themeColor: string | null;
    accentColor: string | null;
    customFont: string | null;
    layoutStyle: string;
    customEmoji: string | null;
  }>({
    coverImage: null,
    themeColor: null,
    accentColor: null,
    customFont: null,
    layoutStyle: "default",
    customEmoji: null,
  });

  // Cache agora gerenciado pelo cacheManager

  // Buscar bio do usuário
  useEffect(() => {
    async function fetchUserBio() {
      if (!user?.id) {
        // Limpar dados se não houver usuário
        setUserBio(null);
        setProfileCustomization({
          coverImage: null,
          themeColor: null,
          accentColor: null,
          customFont: null,
          layoutStyle: "default",
          customEmoji: null,
        });
        return;
      }

      try {
        const response = await fetch("/api/users/profile", {
          cache: "no-store",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          // Verificar se os dados são do usuário atual
          if (data.id === user.id) {
            setUserBio(data.bio || null);
            setProfileCustomization({
              coverImage: data.coverImage || null,
              themeColor: data.themeColor || null,
              accentColor: data.accentColor || null,
              customFont: data.customFont || null,
              layoutStyle: data.layoutStyle || "default",
              customEmoji: data.customEmoji || null,
            });
          }
        }
      } catch (err) {
        console.error("Error fetching user bio:", err);
      }
    }

    fetchUserBio();
  }, [user?.id]);

  // Rastrear o último ID de usuário para detectar mudanças
  const [lastUserId, setLastUserId] = useState<string | null>(null);

  // Limpar dados quando o usuário mudar
  useEffect(() => {
    if (user?.id !== lastUserId) {
      // Se o usuário mudou, limpar todos os dados
      if (lastUserId !== null) {
        console.log("🔄 Usuário mudou no perfil, limpando dados");
        setPosts([]);
        setUserBio(null);
        setStats({ posts: 0, followers: 0, following: 0, views: 0 });
        setProfileCustomization({
          coverImage: null,
          themeColor: null,
          accentColor: null,
          customFont: null,
          layoutStyle: "default",
          customEmoji: null,
        });

        // Limpar cache do usuário anterior
        if (lastUserId) {
          cache.clearUser(lastUserId);
        }
      }
      setLastUserId(user?.id || null);
    }
  }, [user?.id, lastUserId]);

  // Buscar posts do usuário
  useEffect(() => {
    async function fetchUserPosts() {
      if (!user?.id) {
        setPosts([]);
        setPostsLoading(false);
        return;
      }

      // Tentar carregar do cache primeiro (mas sempre buscar atualizações)
      const cachedPosts = await cache.userPosts.get(user.id);
      if (cachedPosts && Array.isArray(cachedPosts)) {
        console.log("📦 Carregando posts do cache:", cachedPosts.length);
        setPosts(cachedPosts);
        // Não definir loading como false aqui - vamos buscar atualizações
      }

      // Sempre buscar do servidor para garantir dados atualizados
      setPostsLoading(true);
      try {
        const response = await fetch(`/api/posts/user/${user.id}`, {
          cache: "no-store",
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch user posts");
        }
        const data = await response.json();
        const newPosts = data.posts || [];

        // Debug: verificar posts de imagem
        const imagePosts = newPosts.filter(
          (p: { type?: string }) => p.type === "image"
        );
        const videoPosts = newPosts.filter(
          (p: { type?: string }) => p.type === "video"
        );
        const audioPosts = newPosts.filter(
          (p: { type?: string }) => p.type === "audio"
        );
        console.log("📊 Posts por tipo:", {
          total: newPosts.length,
          imagens: imagePosts.length,
          videos: videoPosts.length,
          audios: audioPosts.length,
        });

        // Log detalhado de TODOS os posts
        console.log(
          "📋 TODOS os posts recebidos:",
          newPosts.map(
            (p: {
              id: string;
              type?: string;
              media_url?: string;
              image?: string;
            }) => ({
              id: p.id,
              type: p.type,
              hasMediaUrl: !!p.media_url,
              hasImage: !!p.image,
              media_url: p.media_url,
            })
          )
        );

        if (imagePosts.length > 0) {
          console.log("🖼️ Primeiro post de imagem:", imagePosts[0]);
          console.log("🖼️ Todos os posts de imagem:", imagePosts);
        }

        if (videoPosts.length > 0) {
          console.log("🎥 Primeiro post de vídeo:", videoPosts[0]);
          console.log("🎥 Todos os posts de vídeo:", videoPosts);
        }

        // SEMPRE atualizar os posts no estado
        // A comparação de JSON pode falhar devido a ordem de propriedades ou outros fatores
        console.log("🔄 Atualizando posts no estado:", {
          newPostsLength: newPosts.length,
        });

        // SEMPRE atualizar o estado e salvar no cache
        setPosts(newPosts);
        await cache.userPosts.set(newPosts, user.id);

        console.log("✅ Posts atualizados no estado:", newPosts.length);
      } catch (err) {
        console.error("Error fetching user posts:", err);
      } finally {
        setPostsLoading(false);
      }
    }

    if (user?.id) {
      fetchUserPosts();
    } else {
      setPosts([]);
      setPostsLoading(false);
    }
  }, [user?.id]);

  // Buscar posts de áudio e documento
  useEffect(() => {
    async function fetchMediaPosts() {
      if (!user?.id) {
        setMediaPosts([]);
        setMediaPostsLoading(false);
        return;
      }

      setMediaPostsLoading(true);

      try {
        const response = await fetch(`/api/posts/user/${user.id}`, {
          cache: "no-store",
          credentials: "include",
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

    fetchMediaPosts();
  }, [user?.id, user?.fullName, user?.username, user?.avatar]);

  // Buscar estatísticas do usuário
  useEffect(() => {
    async function fetchUserStats() {
      if (!user?.id) {
        // Limpar stats se não houver usuário
        setStats({
          posts: 0,
          followers: 0,
          following: 0,
          views: 0,
        });
        setStatsLoading(false);
        return;
      }

      // Limpar cache de outros usuários (agora gerenciado pelo cacheManager)
      // O cacheManager já gerencia cache por usuário automaticamente

      // Tentar carregar do cache primeiro
      const cachedStats = await cache.userStats.get(user.id);
      if (
        cachedStats &&
        typeof cachedStats === "object" &&
        "posts" in cachedStats &&
        "followers" in cachedStats
      ) {
        setStats(
          cachedStats as {
            posts: number;
            followers: number;
            following: number;
            views: number;
          }
        );
        // Continuar buscando do servidor em background
      }

      // Sempre buscar do servidor para garantir dados atualizados
      setStatsLoading(true);
      try {
        const response = await fetch(`/api/users/${user.id}/stats`, {
          cache: "no-store",
          credentials: "include",
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

        // Sempre atualizar e salvar no cache
        setStats(newStats);
        if (user.id) {
          await cache.userStats.set(newStats, user.id);
        }
      } catch (err) {
        console.error("Error fetching user stats:", err);
      } finally {
        setStatsLoading(false);
      }
    }

    fetchUserStats();
  }, [user?.id]);

  // Se não houver usuário após o loading, redirecionar para login
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

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

  // Se não houver usuário, mostrar loading (o AuthContext já redireciona)
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
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
      id: "content" as TabType,
      icon: FileEditIcon,
      label: "Conteúdo",
    },
    { id: "saved" as TabType, icon: Bookmark01Icon, label: "Salvos" },
    { id: "tagged" as TabType, icon: Tag01Icon, label: "Marcação" },
  ];

  // Aplicar estilos personalizados
  const profileStyle = {
    ...(profileCustomization.themeColor && {
      "--profile-theme": profileCustomization.themeColor,
    }),
    ...(profileCustomization.accentColor && {
      "--profile-accent": profileCustomization.accentColor,
    }),
  } as React.CSSProperties;

  const layoutClasses = {
    default: "max-w-2xl",
    compact: "max-w-4xl",
    spacious: "max-w-xl",
    minimal: "max-w-lg",
  };

  const layoutSpacing = {
    default: "gap-4 sm:gap-6",
    compact: "gap-2 sm:gap-3",
    spacious: "gap-6 sm:gap-8",
    minimal: "gap-3 sm:gap-4",
  };

  const containerClasses = cn(
    "flex min-h-screen flex-col bg-background pb-28",
    profileCustomization.customFont && `font-${profileCustomization.customFont}`
  );

  const profileDataAttribute =
    profileCustomization.themeColor || profileCustomization.accentColor
      ? { "data-profile-theme": "true" }
      : {};

  return (
    <div
      className={containerClasses}
      style={profileStyle}
      {...profileDataAttribute}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-xl supports-backdrop-filter:bg-background/80 shadow-sm shadow-black/5 animate-in fade-in slide-in-from-top-4 duration-700 ease-out"
        style={
          profileCustomization.themeColor
            ? {
                borderBottomColor: `${profileCustomization.themeColor}20`,
              }
            : undefined
        }
      >
        <div
          className={cn(
            "mx-auto px-3 sm:px-4 py-3 sm:py-4",
            layoutClasses[
              profileCustomization.layoutStyle as keyof typeof layoutClasses
            ] || layoutClasses.default
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {profileCustomization.customEmoji && (
                <span className="text-2xl">
                  {profileCustomization.customEmoji}
                </span>
              )}
              <h1
                className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent transition-all duration-700 ease-out"
                style={
                  profileCustomization.themeColor
                    ? {
                        background: `linear-gradient(to right, ${profileCustomization.themeColor}, ${profileCustomization.themeColor}70)`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }
                    : undefined
                }
              >
                {userData.username}
              </h1>
            </div>
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
      <div
        className={cn(
          "mx-auto px-3 sm:px-6 py-4 sm:py-8",
          layoutClasses[
            profileCustomization.layoutStyle as keyof typeof layoutClasses
          ] || layoutClasses.default
        )}
      >
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
                <BioRenderer
                  bio={userData.bio}
                  className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line"
                />
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
                  {tab.icon && (
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
              {(() => {
                // Debug: verificar estado dos posts
                console.log("🎯 RENDER - Aba Posts:", {
                  postsLoading,
                  postsLength: posts.length,
                  posts: posts.map((p) => ({
                    id: p.id,
                    type: p.type,
                    hasImage: !!p.image,
                    hasMediaUrl: !!p.media_url,
                  })),
                });
                return null;
              })()}
              {postsLoading ? (
                <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
                  <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Carregando posts...</p>
                </div>
              ) : (() => {
                  // Debug: verificar todos os posts antes do filtro
                  console.log(
                    "🔍 Aba Posts - Total de posts antes do filtro:",
                    posts.length
                  );
                  console.log(
                    "🔍 Aba Posts - Posts antes do filtro:",
                    posts.map((p) => ({
                      id: p.id,
                      type: p.type,
                      hasImage: !!p.image,
                      hasMediaUrl: !!p.media_url,
                    }))
                  );

                  const filtered = posts.filter((post) => {
                    const isImage = post.type === "image";
                    const isVideo = post.type === "video";
                    // Para imagens, verificar image OU media_url
                    const hasImageUrl =
                      isImage && (post.image || post.media_url);
                    // Para vídeos, verificar media_url
                    const hasVideoUrl = isVideo && post.media_url;
                    const shouldShow =
                      (isImage && hasImageUrl) || (isVideo && hasVideoUrl);

                    // Debug para todos os tipos
                    if (isImage || isVideo) {
                      console.log(
                        `🔍 Post ${post.type} - shouldShow: ${shouldShow}`,
                        {
                          id: post.id,
                          type: post.type,
                          image: post.image,
                          media_url: post.media_url,
                          hasImageUrl,
                          hasVideoUrl,
                        }
                      );
                    }

                    return shouldShow;
                  });

                  console.log(
                    "✅ Aba Posts - Posts após filtro:",
                    filtered.length
                  );
                  console.log(
                    "✅ Aba Posts - Posts filtrados:",
                    filtered.map((p) => ({
                      id: p.id,
                      type: p.type,
                    }))
                  );

                  return filtered.length > 0;
                })() ? (
                <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
                  {posts
                    .filter((post) => {
                      // Debug: logar todos os posts antes do filtro
                      if (post.type === "image" || post.type === "video") {
                        console.log("🔍 Post antes do filtro:", {
                          id: post.id,
                          type: post.type,
                          image: post.image,
                          media_url: post.media_url,
                          hasImage: !!post.image,
                          hasMediaUrl: !!post.media_url,
                        });
                      }

                      const isImage = post.type === "image";
                      const isVideo = post.type === "video";
                      const isGallery = post.type === "gallery";

                      // Para imagens: aceitar se tiver image OU media_url
                      if (isImage) {
                        const hasUrl = !!(post.image || post.media_url);
                        if (!hasUrl) {
                          console.warn("⚠️ Post de imagem SEM URL:", post);
                        }
                        return hasUrl;
                      }

                      // Para vídeos: aceitar se tiver media_url
                      if (isVideo) {
                        return !!post.media_url;
                      }

                      // Para gallery: aceitar se tiver gallery_items com imagens/vídeos
                      if (isGallery) {
                        const hasGalleryItems = !!(
                          post.gallery_items &&
                          Array.isArray(post.gallery_items) &&
                          (post.gallery_items as Array<{ url?: string }>)
                            .length > 0
                        );
                        if (!hasGalleryItems) {
                          console.warn("⚠️ Post de gallery SEM itens:", post);
                        }
                        return hasGalleryItems;
                      }

                      // Outros tipos não devem aparecer na aba Posts
                      return false;
                    })
                    .map((post, index) => {
                      // Determinar a imagem/thumbnail a mostrar
                      let imageUrl: string | undefined;
                      let isVideoMedia = false;
                      const isImage = post.type === "image";
                      const isVideo = post.type === "video";
                      const isGallery = post.type === "gallery";

                      if (isImage) {
                        // Para imagens, verificar primeiro o campo image, depois media_url
                        imageUrl = post.image || post.media_url;
                        if (!imageUrl) {
                          console.warn("Post de imagem sem URL:", {
                            id: post.id,
                            type: post.type,
                            image: post.image,
                            media_url: post.media_url,
                            post: post,
                          });
                          return null;
                        }
                        console.log("✅ Renderizando post de imagem:", {
                          id: post.id,
                          imageUrl,
                        });
                      } else if (isVideo) {
                        imageUrl = post.media_url;
                        isVideoMedia = true;
                        if (!imageUrl) {
                          console.warn("⚠️ Post de vídeo SEM URL:", {
                            id: post.id,
                            type: post.type,
                            media_url: post.media_url,
                            post: post,
                          });
                          return null;
                        }
                        console.log("✅ Renderizando post de vídeo:", {
                          id: post.id,
                          imageUrl,
                          media_url: post.media_url,
                        });
                      } else if (isGallery) {
                        // Para gallery, pegar o primeiro item
                        if (
                          post.gallery_items &&
                          Array.isArray(post.gallery_items) &&
                          (
                            post.gallery_items as Array<{
                              url?: string;
                              type?: string;
                            }>
                          ).length > 0
                        ) {
                          const firstItem = (
                            post.gallery_items as Array<{
                              url?: string;
                              type?: string;
                            }>
                          )[0];
                          imageUrl = firstItem.url;
                          isVideoMedia = firstItem.type === "video";
                          if (!imageUrl) {
                            console.warn(
                              "⚠️ Post de gallery SEM URL no primeiro item:",
                              post
                            );
                            return null;
                          }
                          console.log("✅ Renderizando post de gallery:", {
                            id: post.id,
                            imageUrl,
                            type: firstItem.type,
                          });
                        } else {
                          console.warn("⚠️ Post de gallery SEM itens:", post);
                          return null;
                        }
                      } else {
                        console.warn(
                          "⚠️ Tipo de post inesperado na aba Posts:",
                          {
                            id: post.id,
                            type: post.type,
                          }
                        );
                        return null;
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
                          {isVideoMedia ? (
                            <div className="relative w-full h-full bg-black">
                              <video
                                src={imageUrl}
                                className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
                                muted
                                playsInline
                                preload="metadata"
                                onError={(e) => {
                                  console.error(
                                    "❌ Erro ao carregar vídeo:",
                                    imageUrl,
                                    post
                                  );
                                  e.currentTarget.style.display = "none";
                                }}
                                onLoadedMetadata={() => {
                                  console.log(
                                    "✅ Vídeo metadata carregado:",
                                    imageUrl
                                  );
                                }}
                              />
                              {/* Indicador de vídeo */}
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="bg-black/50 rounded-full p-3">
                                  <svg
                                    className="size-6 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          ) : imageUrl ? (
                            <OptimizedImage
                              src={imageUrl}
                              alt={post.content || `Post ${post.id}`}
                              fill
                              className="!relative object-cover transition-transform duration-300 ease-out group-hover:scale-110"
                              sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
                              quality={85}
                            />
                          ) : (
                            <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                              <span className="text-muted-foreground text-xs">
                                Sem mídia
                              </span>
                            </div>
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

          {activeTab === "content" && (
            <div className="space-y-4">
              {postsLoading ? (
                <div className="text-center py-8">
                  <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    Carregando conteúdo...
                  </p>
                </div>
              ) : (() => {
                  // Debug: verificar posts na aba Conteúdo
                  console.log(
                    "📝 Aba Conteúdo - Total de posts:",
                    posts.length
                  );
                  const contentPosts = posts.filter(
                    (post) =>
                      post.type === "text" ||
                      post.type === "audio" ||
                      post.type === "document"
                  );
                  console.log(
                    "📝 Aba Conteúdo - Posts filtrados:",
                    contentPosts.length
                  );
                  console.log(
                    "📝 Aba Conteúdo - Posts:",
                    contentPosts.map((p) => ({
                      id: p.id,
                      type: p.type,
                    }))
                  );
                  return contentPosts.length > 0;
                })() ? (
                <div className="space-y-4">
                  {posts
                    .filter(
                      (post) =>
                        post.type === "text" ||
                        post.type === "audio" ||
                        post.type === "document"
                    )
                    .map((post) => (
                      <Suspense key={post.id} fallback={<PostCardFallback />}>
                        <PostCard
                          id={post.id}
                          author={{
                            name: user?.fullName || "",
                            username: user?.username || "",
                            avatar: user?.avatar,
                          }}
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
                          media={
                            post.type === "audio" && post.media_url
                              ? {
                                  url: post.media_url,
                                  thumbnail: undefined,
                                  title: undefined,
                                  artist: undefined,
                                }
                              : undefined
                          }
                          document={
                            post.type === "document" && post.document_url
                              ? {
                                  url: post.document_url,
                                  name: post.document_name || "Documento",
                                }
                              : undefined
                          }
                          likes={post.likes || 0}
                          comments={post.comments || 0}
                          shares={post.shares || 0}
                          timeAgo={post.timeAgo || ""}
                          isLiked={false}
                          isSaved={false}
                        />
                      </Suspense>
                    ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center animate-in fade-in zoom-in-95 duration-700">
                  <div className="size-16 sm:size-20 rounded-full bg-muted/50 flex items-center justify-center mb-4 sm:mb-6">
                    <HugeiconsIcon
                      icon={FileEditIcon}
                      className="size-8 sm:size-10 text-muted-foreground/50"
                    />
                  </div>
                  <p className="text-foreground/80 text-base sm:text-lg font-medium mb-1.5">
                    Nenhum conteúdo ainda
                  </p>
                  <p className="text-muted-foreground/70 text-sm sm:text-base">
                    Quando você criar textos, áudios ou documentos, eles
                    aparecerão aqui
                  </p>
                </div>
              )}
            </div>
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
      {isEditModalOpen && (
        <Suspense fallback={<ModalFallback />}>
          <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSuccess={async () => {
              // Recarregar dados do perfil após edição
              router.refresh();
              // Recarregar posts também
              window.location.reload();
            }}
          />
        </Suspense>
      )}
    </div>
  );
}
