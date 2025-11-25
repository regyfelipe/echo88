"use client";

import { useState } from "react";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Settings01Icon,
  Edit01Icon,
  LayoutGridIcon,
  Bookmark01Icon,
  Tag01Icon,
  FavouriteIcon,
  Message01Icon,
  Share07Icon,
  Calendar01Icon,
  IdVerifiedIcon,
  EyeIcon,
  Award01Icon,
  FlashIcon,
  Fire03Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

type TabType = "posts" | "saved" | "tagged";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>("posts");

  const user = {
    name: "Seu Nome",
    username: "seuusuario",
    bio: "Desenvolvedor apaixonado por tecnologia e design ✨\nCriando experiências incríveis",
    avatar: undefined,
    isVerified: true,
    isOnline: true,
    stats: {
      posts: 42,
      followers: 128,
      following: 89,
      views: 1250,
    },
    highlights: [
      {
        id: "1",
        name: "Trabalho",
        image:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=80",
      },
      {
        id: "2",
        name: "Viagens",
        image:
          "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&q=80",
      },
      {
        id: "3",
        name: "Projetos",
        image:
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&q=80",
      },
    ],
    achievements: [
      { icon: Award01Icon, label: "Top Creator" },
      { icon: Fire03Icon, label: "Hot Streak" },
    ],
  };

  const posts = [
    {
      id: "1",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      content: "Pôr do sol incrível de hoje! 🌅",
      likes: 128,
      comments: 15,
      shares: 8,
      timeAgo: "2h",
    },
    {
      id: "2",
      image:
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
      content: "Nova aventura começando! 🚀",
      likes: 94,
      comments: 7,
      shares: 3,
      timeAgo: "5h",
    },
    {
      id: "3",
      image:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
      content: "Momento perfeito capturado 📸",
      likes: 189,
      comments: 33,
      shares: 12,
      timeAgo: "1d",
    },
    {
      id: "4",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      content: "Inspiração do dia ✨",
      likes: 267,
      comments: 45,
      shares: 18,
      timeAgo: "2d",
    },
    {
      id: "5",
      image:
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
      content: "Novo projeto em andamento! 💻",
      likes: 67,
      comments: 12,
      shares: 5,
      timeAgo: "3d",
    },
    {
      id: "6",
      image:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
      content: "Aprendizado constante 🎓",
      likes: 312,
      comments: 52,
      shares: 24,
      timeAgo: "4d",
    },
  ];

  const tabs = [
    { id: "posts" as TabType, icon: LayoutGridIcon, label: "Posts" },
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
              {user.username}
            </h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="size-9 sm:size-10">
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
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8">
        {/* Seção Principal: Avatar + Stats + Botão */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-12 mb-8">
          {/* Avatar com Status Online */}
          <div className="relative shrink-0">
            <div className="size-24 sm:size-28 md:size-32 rounded-full bg-muted/30 flex items-center justify-center overflow-hidden ring-2 ring-background">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="size-full object-cover"
                  loading="eager"
                />
              ) : (
                <span className="text-foreground/50 font-light text-4xl sm:text-5xl">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {/* Status Online */}
            {user.isOnline && (
              <div className="absolute bottom-0 right-0 size-4 sm:size-5 bg-green-500 rounded-full ring-2 ring-background border-2 border-background animate-pulse" />
            )}
          </div>

          {/* Info + Stats + Botão */}
          <div className="flex-1 w-full space-y-4">
            {/* Nome + Verificado + Botão */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                    {user.username}
                  </h2>
                  {user.isVerified && (
                    <HugeiconsIcon
                      icon={IdVerifiedIcon}
                      className="size-5 sm:size-6 text-blue-500"
                    />
                  )}
                </div>
                <p className="text-sm text-muted-foreground/70">{user.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 h-9 px-4 rounded-lg text-sm font-medium"
                >
                  <HugeiconsIcon icon={Edit01Icon} className="size-4" />
                  <span className="hidden sm:inline">Editar perfil</span>
                  <span className="sm:hidden">Editar</span>
                </Button>
                <Button variant="ghost" size="icon" className="size-9">
                  <HugeiconsIcon icon={Settings01Icon} className="size-5" />
                </Button>
              </div>
            </div>

            {/* Stats - Horizontal */}
            <div className="flex items-center justify-center sm:justify-start gap-6 sm:gap-8">
              <button className="text-center group cursor-pointer">
                <p className="text-base sm:text-lg font-semibold text-foreground group-hover:text-foreground/80 transition-colors">
                  {user.stats.posts}
                </p>
                <p className="text-xs text-muted-foreground/70">posts</p>
              </button>
              <button className="text-center group cursor-pointer">
                <p className="text-base sm:text-lg font-semibold text-foreground group-hover:text-foreground/80 transition-colors">
                  {user.stats.followers}
                </p>
                <p className="text-xs text-muted-foreground/70">seguidores</p>
              </button>
              <button className="text-center group cursor-pointer">
                <p className="text-base sm:text-lg font-semibold text-foreground group-hover:text-foreground/80 transition-colors">
                  {user.stats.following}
                </p>
                <p className="text-xs text-muted-foreground/70">seguindo</p>
              </button>
              {/* Stat Único: Visualizações */}
              <button className="text-center group cursor-pointer hidden sm:flex items-center gap-1">
                <HugeiconsIcon
                  icon={EyeIcon}
                  className="size-4 text-muted-foreground/70"
                />
                <div>
                  <p className="text-base sm:text-lg font-semibold text-foreground group-hover:text-foreground/80 transition-colors">
                    {user.stats.views}
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    visualizações
                  </p>
                </div>
              </button>
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="text-center sm:text-left">
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                  {user.bio}
                </p>
              </div>
            )}

            {/* Achievements - Elemento Único */}
            {user.achievements && user.achievements.length > 0 && (
              <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                {user.achievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20"
                    >
                      <HugeiconsIcon
                        icon={Icon}
                        className="size-4 text-primary"
                      />
                      <span className="text-xs font-medium text-primary">
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
        {user.highlights && user.highlights.length > 0 && (
          <div className="mb-8 pb-6 border-b border-border/20">
            <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-2">
              {user.highlights.map((highlight) => (
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
              {/* Botão Adicionar Highlight */}
              <button className="flex flex-col items-center gap-2 shrink-0 cursor-pointer">
                <div className="size-16 sm:size-20 rounded-full border-2 border-dashed border-border/50 flex items-center justify-center group-hover:border-border transition-colors">
                  <span className="text-2xl text-muted-foreground/50">+</span>
                </div>
                <span className="text-xs text-muted-foreground/70">Novo</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs - Clean & Minimal */}
      <div className="sticky top-[73px] sm:top-[81px] z-30 bg-background/80 backdrop-blur-sm border-b border-border/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 transition-all duration-300 relative font-light text-sm sm:text-base",
                    isActive
                      ? "text-foreground border-b-2 border-foreground/30"
                      : "text-muted-foreground/60 hover:text-foreground/80"
                  )}
                >
                  <HugeiconsIcon
                    icon={Icon}
                    className={cn(
                      "size-4 sm:size-5 transition-all duration-300",
                      isActive && "text-foreground"
                    )}
                  />
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
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
          {activeTab === "posts" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              {posts.map((post, index) => (
                <article
                  key={post.id}
                  className="group cursor-pointer animate-in fade-in duration-500"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  {/* Post Image - Clean */}
                  <div className="relative aspect-square overflow-hidden bg-muted/30 rounded-lg mb-3">
                    <img
                      src={post.image}
                      alt={post.content || `Post ${post.id}`}
                      className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                  </div>

                  {/* Post Info - Minimalist */}
                  <div className="space-y-2">
                    {post.content && (
                      <p className="text-sm text-foreground/70 line-clamp-2 font-light leading-relaxed">
                        {post.content}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground/60 font-light">
                      <span>{post.likes} likes</span>
                      <span>·</span>
                      <span>{post.timeAgo}</span>
                    </div>
                  </div>
                </article>
              ))}
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
    </div>
  );
}
