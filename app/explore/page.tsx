"use client";

import { useState, useMemo } from "react";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  CancelCircleIcon,
  FavouriteIcon,
  Message01Icon,
  Image01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { PostDetailModal } from "@/components/post-detail-modal";
import { cn } from "@/lib/utils";
import type { PostType, MediaItem } from "@/components/post-card";

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

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState<ExplorePost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const explorePosts: ExplorePost[] = [
    {
      id: "1",
      author: {
        name: "Maria Santos",
        username: "mariasantos",
      },
      content: "Pôr do sol de hoje foi simplesmente perfeito! 🌅",
      type: "image",
      media: {
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      },
      likes: 128,
      comments: 15,
      shares: 23,
      timeAgo: "5h",
    },
    {
      id: "2",
      author: {
        name: "Carlos Mendes",
        username: "carlosmendes",
      },
      type: "image",
      media: {
        url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
      },
      likes: 94,
      comments: 7,
      shares: 3,
      timeAgo: "3d",
    },
    {
      id: "3",
      author: {
        name: "Lucas Almeida",
        username: "lucasalmeida",
      },
      content: "Minha viagem incrível! 📸✨",
      type: "gallery",
      gallery: [
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
        },
      ],
      category: {
        name: "Digital",
      },
      likes: 234,
      comments: 28,
      shares: 15,
      timeAgo: "12h",
    },
    {
      id: "4",
      author: {
        name: "Ana Oliveira",
        username: "anaoliveira",
      },
      type: "image",
      media: {
        url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
      },
      likes: 189,
      comments: 33,
      shares: 18,
      timeAgo: "2d",
    },
    {
      id: "5",
      author: {
        name: "Fernanda Lima",
        username: "fernandalima",
      },
      content: "Meu projeto em desenvolvimento! 🎬",
      type: "gallery",
      gallery: [
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
        },
      ],
      category: {
        name: "Pixelise",
      },
      likes: 156,
      comments: 19,
      shares: 7,
      timeAgo: "1sem",
    },
    {
      id: "6",
      author: {
        name: "Pedro Costa",
        username: "pedrocosta",
      },
      type: "image",
      media: {
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      },
      likes: 267,
      comments: 45,
      shares: 12,
      timeAgo: "1d",
    },
    {
      id: "7",
      author: {
        name: "Julia Ferreira",
        username: "juliaferreira",
      },
      type: "image",
      media: {
        url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
      },
      likes: 67,
      comments: 12,
      shares: 8,
      timeAgo: "4d",
    },
    {
      id: "8",
      author: {
        name: "Rafael Silva",
        username: "rafaelsilva",
      },
      type: "image",
      media: {
        url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
      },
      likes: 312,
      comments: 52,
      shares: 24,
      timeAgo: "6h",
    },
    {
      id: "9",
      author: {
        name: "Camila Souza",
        username: "camilasouza",
      },
      type: "gallery",
      gallery: [
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
        },
      ],
      likes: 445,
      comments: 67,
      shares: 31,
      timeAgo: "8h",
    },
    {
      id: "10",
      author: {
        name: "Gabriel Martins",
        username: "gabrielmartins",
      },
      type: "image",
      media: {
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      },
      likes: 178,
      comments: 21,
      shares: 9,
      timeAgo: "1d",
    },
    {
      id: "11",
      author: {
        name: "Isabella Costa",
        username: "isabellacosta",
      },
      type: "image",
      media: {
        url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
      },
      likes: 289,
      comments: 38,
      shares: 16,
      timeAgo: "3h",
    },
    {
      id: "12",
      author: {
        name: "Thiago Alves",
        username: "thiagoalves",
      },
      type: "image",
      media: {
        url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
      },
      likes: 203,
      comments: 29,
      shares: 13,
      timeAgo: "5h",
    },
    {
      id: "13",
      author: {
        name: "Larissa Rocha",
        username: "larissarocha",
      },
      type: "gallery",
      gallery: [
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
        },
      ],
      likes: 356,
      comments: 41,
      shares: 19,
      timeAgo: "7h",
    },
    {
      id: "14",
      author: {
        name: "Bruno Lima",
        username: "brunolima",
      },
      type: "image",
      media: {
        url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
      },
      likes: 142,
      comments: 18,
      shares: 6,
      timeAgo: "2d",
    },
    {
      id: "15",
      author: {
        name: "Mariana Dias",
        username: "marianadias",
      },
      type: "image",
      media: {
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      },
      likes: 421,
      comments: 58,
      shares: 27,
      timeAgo: "4h",
    },
  ];

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return explorePosts;
    const query = searchQuery.toLowerCase();
    return explorePosts.filter(
      (post) =>
        post.author.name.toLowerCase().includes(query) ||
        post.author.username.toLowerCase().includes(query) ||
        post.content?.toLowerCase().includes(query) ||
        post.category?.name.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handlePostClick = (post: ExplorePost) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const getPostImage = (post: ExplorePost) => {
    if (post.gallery && post.gallery.length > 0) {
      return post.gallery[0].url;
    }
    return post.media?.url;
  };

  const getPostThumbnail = (post: ExplorePost) => {
    if (post.gallery && post.gallery.length > 0) {
      return post.gallery[0].thumbnail || post.gallery[0].url;
    }
    return post.media?.thumbnail || post.media?.url;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60 shadow-sm shadow-black/5 animate-in fade-in slide-in-from-top-4 duration-700 ease-out">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 py-3 sm:py-4">
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
              className="pl-9 sm:pl-10 pr-9 sm:pr-10 h-10 sm:h-11 text-sm sm:text-base transition-all duration-500 ease-out focus:ring-2 focus:ring-primary/30 focus:border-primary/50 bg-muted/30 border-border/50 hover:bg-muted/50 focus:bg-background"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 size-9 sm:size-10 h-9 sm:h-10 rounded-full hover:bg-accent/60 transition-all duration-300 hover:scale-110 active:scale-95 touch-manipulation"
                onClick={() => setSearchQuery("")}
              >
                <HugeiconsIcon icon={CancelCircleIcon} className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-0.5 sm:p-1 md:p-2">
        {filteredPosts.length === 0 ? (
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
        ) : (
          <div className="mx-auto max-w-7xl">
            {/* Grid de imagens estilo Instagram */}
            <div className="grid grid-cols-3 gap-0.5 sm:gap-1 md:gap-1.5">
              {filteredPosts.map((post, index) => {
                const imageUrl = getPostImage(post);
                const hasMultiple = post.gallery && post.gallery.length > 1;

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

                    <img
                      src={imageUrl}
                      alt={post.content || `Post de ${post.author.name}`}
                      className="w-full h-full object-cover transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.08] group-active:scale-[1.05]"
                      loading="lazy"
                    />

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
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out">
                      <div className="flex items-center gap-5 text-white transform translate-y-2 group-hover:translate-y-0 transition-all duration-700 ease-out">
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full shadow-xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-110">
                          <HugeiconsIcon
                            icon={FavouriteIcon}
                            className="size-4 fill-white"
                          />
                          <span className="text-sm font-semibold tracking-wide">
                            {post.likes}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full shadow-xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-110">
                          <HugeiconsIcon
                            icon={Message01Icon}
                            className="size-4"
                          />
                          <span className="text-sm font-semibold tracking-wide">
                            {post.comments}
                          </span>
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
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Modal de detalhes */}
      {selectedPost && (
        <PostDetailModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setTimeout(() => setSelectedPost(null), 300);
          }}
          author={selectedPost.author}
          content={selectedPost.content}
          media={selectedPost.media}
          gallery={selectedPost.gallery}
          category={selectedPost.category}
          likes={selectedPost.likes}
          comments={selectedPost.comments}
          shares={selectedPost.shares}
          timeAgo={selectedPost.timeAgo}
        />
      )}
    </div>
  );
}
