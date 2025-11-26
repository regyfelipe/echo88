"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  LayoutGridIcon,
  Bookmark01Icon,
  Tag01Icon,
  IdVerifiedIcon,
  EyeIcon,
  ArrowLeft01Icon,
  Message01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { MediaViewer } from "@/components/posts/media-viewer";

type TabType = "posts" | "saved" | "tagged";

interface ProfileUser {
  id: string;
  fullName: string;
  username: string;
  avatar?: string;
  emailVerified: boolean;
  createdAt: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const username = params.username as string;

  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("posts");
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
  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    following: 0,
    views: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{
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
    currentIndex?: number;
  } | null>(null);

  // Cache keys
  const getUserCacheKey = (username: string) => `echo88_user_${username}`;
  const getPostsCacheKey = (userId: string) => `echo88_user_posts_${userId}`;
  const getStatsCacheKey = (userId: string) => `echo88_user_stats_${userId}`;
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  // Buscar dados do usuário pelo username
  useEffect(() => {
    async function fetchUser() {
      // Tentar carregar do cache primeiro
      const cacheKey = getUserCacheKey(username);
      const cachedData = localStorage.getItem(cacheKey);
      const cachedTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);

      if (cachedData && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp, 10);
        const now = Date.now();

        if (now - timestamp < CACHE_DURATION) {
          try {
            const cachedUser = JSON.parse(cachedData);
            setProfileUser(cachedUser);
            setIsLoading(false);
          } catch (e) {
            console.error("Error parsing cached user:", e);
          }
        }
      } else {
        setIsLoading(true);
      }

      try {
        const response = await fetch(`/api/users/username/${username}`, {
          cache: "default",
        });
        if (!response.ok) {
          if (response.status === 404) {
            router.push("/explore");
            return;
          }
          throw new Error("Failed to fetch user");
        }
        const data = await response.json();
        const user = data.user;

        // Verificar se há mudanças
        const hasChanges = !cachedData || JSON.stringify(user) !== cachedData;

        if (hasChanges) {
          setProfileUser(user);
          localStorage.setItem(cacheKey, JSON.stringify(user));
          localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        if (!cachedData) {
          router.push("/explore");
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (username) {
      fetchUser();
    }
  }, [username, router]);

  // Buscar posts do usuário
  useEffect(() => {
    async function fetchUserPosts() {
      if (!profileUser?.id) return;

      // Tentar carregar do cache primeiro
      const cacheKey = getPostsCacheKey(profileUser.id);
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
        const response = await fetch(`/api/posts/user/${profileUser.id}`, {
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

    fetchUserPosts();
  }, [profileUser?.id]);

  // Buscar estatísticas do usuário
  useEffect(() => {
    async function fetchUserStats() {
      if (!profileUser?.id) return;

      // Tentar carregar do cache primeiro
      const cacheKey = getStatsCacheKey(profileUser.id);
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
        const response = await fetch(`/api/users/${profileUser.id}/stats`, {
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

    fetchUserStats();
  }, [profileUser?.id]);

  // Verificar se está seguindo
  useEffect(() => {
    async function checkFollowing() {
      if (
        !currentUser?.id ||
        !profileUser?.id ||
        currentUser.id === profileUser.id
      ) {
        setIsFollowing(false);
        return;
      }

      try {
        const response = await fetch(`/api/follow/${profileUser.id}/status`, {
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          setIsFollowing(data.isFollowing || false);
        } else {
          setIsFollowing(false);
        }
      } catch (err) {
        console.error("Error checking follow status:", err);
        setIsFollowing(false);
      }
    }

    if (profileUser?.id) {
      checkFollowing();
    }
  }, [currentUser?.id, profileUser?.id]);

  // Função para seguir/deixar de seguir
  const handleFollow = async () => {
    if (
      !currentUser?.id ||
      !profileUser?.id ||
      currentUser.id === profileUser.id
    ) {
      return;
    }

    try {
      setIsFollowingLoading(true);
      const method = isFollowing ? "DELETE" : "POST";
      const response = await fetch(`/api/follow/${profileUser.id}`, {
        method,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to toggle follow");
      }

      // Atualizar estado otimisticamente
      const newFollowingState = !isFollowing;
      setIsFollowing(newFollowingState);

      // Atualizar contador de seguidores
      setStats((prev) => ({
        ...prev,
        followers: isFollowing ? prev.followers - 1 : prev.followers + 1,
      }));

      // Aguardar um pouco e verificar novamente o status do servidor para garantir sincronização
      setTimeout(async () => {
        try {
          const statusResponse = await fetch(
            `/api/follow/${profileUser.id}/status`,
            {
              cache: "no-store",
            }
          );
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            setIsFollowing(statusData.isFollowing || false);
          }
        } catch (statusErr) {
          console.error("Error verifying follow status:", statusErr);
        }
      }, 500);
    } catch (err) {
      console.error("Error toggling follow:", err);
      // Reverter estado em caso de erro
      setIsFollowing(isFollowing);
    } finally {
      setIsFollowingLoading(false);
    }
  };

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

  if (!profileUser) {
    return null;
  }

  const isOwnProfile = currentUser?.id === profileUser.id;

  const tabs = [
    { id: "posts" as TabType, icon: LayoutGridIcon, label: "Posts" },
    { id: "saved" as TabType, icon: Bookmark01Icon, label: "Salvos" },
    { id: "tagged" as TabType, icon: Tag01Icon, label: "Marcados" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-xl supports-backdrop-filter:bg-background/80 shadow-sm shadow-black/5">
        <div className="mx-auto max-w-2xl px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="size-9 sm:size-10"
                onClick={() => router.back()}
              >
                <HugeiconsIcon
                  icon={ArrowLeft01Icon}
                  className="size-5 sm:size-6"
                />
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold">
                {profileUser.username}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Header */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-12 mb-8">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="size-24 sm:size-28 md:size-32 rounded-full bg-muted/30 flex items-center justify-center overflow-hidden ring-2 ring-background">
              {profileUser.avatar ? (
                <img
                  src={profileUser.avatar}
                  alt={profileUser.fullName}
                  className="size-full object-cover"
                  loading="eager"
                />
              ) : (
                <span className="text-foreground/50 font-light text-4xl sm:text-5xl">
                  {profileUser.fullName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Info + Stats + Botão */}
          <div className="flex-1 w-full space-y-4">
            {/* Nome + Verificado + Botão */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                    {profileUser.username}
                  </h2>
                  {profileUser.emailVerified && (
                    <HugeiconsIcon
                      icon={IdVerifiedIcon}
                      className="size-5 sm:size-6 text-blue-500"
                    />
                  )}
                </div>
                <p className="text-sm text-muted-foreground/70">
                  {profileUser.fullName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isOwnProfile ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 h-9 px-4 rounded-lg text-sm font-medium"
                    >
                      Editar perfil
                    </Button>
                    <Button variant="ghost" size="icon" className="size-9">
                      <HugeiconsIcon icon={Message01Icon} className="size-5" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant={isFollowing ? "outline" : "default"}
                      size="sm"
                      className="gap-2 h-9 px-4 rounded-lg text-sm font-medium"
                      onClick={handleFollow}
                      disabled={isFollowingLoading}
                    >
                      {isFollowing ? "Seguindo" : "Seguir"}
                    </Button>
                    <Button variant="outline" size="sm" className="h-9 px-4">
                      Mensagem
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center sm:justify-start gap-6 sm:gap-8">
              <button className="text-center group cursor-pointer">
                <p className="text-base sm:text-lg font-semibold text-foreground group-hover:text-foreground/80 transition-colors">
                  {stats.posts}
                </p>
                <p className="text-xs text-muted-foreground/70">posts</p>
              </button>
              <Link
                href={`/profile/${username}/followers`}
                className="text-center group cursor-pointer"
              >
                <p className="text-base sm:text-lg font-semibold text-foreground group-hover:text-foreground/80 transition-colors">
                  {stats.followers}
                </p>
                <p className="text-xs text-muted-foreground/70">seguidores</p>
              </Link>
              <Link
                href={`/profile/${username}/following`}
                className="text-center group cursor-pointer"
              >
                <p className="text-base sm:text-lg font-semibold text-foreground group-hover:text-foreground/80 transition-colors">
                  {stats.following}
                </p>
                <p className="text-xs text-muted-foreground/70">seguindo</p>
              </Link>
              <div className="text-center">
                <p className="text-base sm:text-lg font-semibold text-foreground">
                  {stats.views}
                </p>
                <p className="text-xs text-muted-foreground/70">
                  visualizações
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-border/50">
          <div className="flex items-center justify-center sm:justify-start gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 py-4 border-b-2 transition-colors",
                  activeTab === tab.id
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground/70"
                )}
              >
                <HugeiconsIcon icon={tab.icon} className="size-5" />
                <span className="text-sm font-medium hidden sm:inline">
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        {activeTab === "posts" && (
          <div className="mt-6">
            {postsLoading ? (
              <div className="text-center py-12">
                <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
                <p className="text-muted-foreground">Carregando posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum post ainda</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
                {posts.map((post) => {
                  // Garantir que gallery_items seja tratado como array
                  const galleryItems = Array.isArray(post.gallery_items)
                    ? (post.gallery_items as Array<{ url?: string }>)
                    : [];
                  const mediaUrl =
                    post.media_url ||
                    (galleryItems.length > 0 && galleryItems[0]?.url) ||
                    post.image;
                  const gallery =
                    galleryItems.length > 0
                      ? galleryItems
                          .map((item) => ({
                            url: item.url || "",
                            type: (post.type === "video"
                              ? "video"
                              : "image") as "image" | "video",
                          }))
                          .filter((item) => !!item.url)
                      : [];

                  return (
                    <div
                      key={post.id}
                      className="relative aspect-square bg-muted/30 rounded-lg overflow-hidden group cursor-pointer"
                      onClick={() => {
                        if (post.type === "image" && mediaUrl) {
                          setSelectedMedia({
                            media:
                              gallery.length === 0
                                ? { url: mediaUrl }
                                : undefined,
                            gallery: gallery.length > 0 ? gallery : undefined,
                            currentIndex: gallery.length > 0 ? 0 : undefined,
                          });
                        } else if (post.type === "video" && mediaUrl) {
                          setSelectedMedia({
                            media: { url: mediaUrl },
                          });
                        }
                      }}
                    >
                      {mediaUrl ? (
                        <img
                          src={mediaUrl}
                          alt={post.content || "Post"}
                          className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="size-full flex items-center justify-center">
                          <span className="text-muted-foreground text-sm">
                            {post.type}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
                        <div className="flex items-center gap-1 text-white">
                          <HugeiconsIcon icon={EyeIcon} className="size-4" />
                          <span className="text-sm font-semibold">
                            {post.likes}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-white">
                          <HugeiconsIcon
                            icon={Message01Icon}
                            className="size-4"
                          />
                          <span className="text-sm font-semibold">
                            {post.comments}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "saved" && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Posts salvos aparecerão aqui
            </p>
          </div>
        )}

        {activeTab === "tagged" && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Posts marcados aparecerão aqui
            </p>
          </div>
        )}
      </div>

      {selectedMedia && profileUser && (
        <MediaViewer
          isOpen={true}
          onClose={() => setSelectedMedia(null)}
          author={{
            name: profileUser.fullName || profileUser.username,
            username: profileUser.username,
            avatar: profileUser.avatar,
          }}
          media={selectedMedia.media}
          gallery={selectedMedia.gallery}
        />
      )}

      <BottomNavigation />
    </div>
  );
}
