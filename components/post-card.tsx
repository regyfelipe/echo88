"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Play,
  Pause,
  Music,
  Image as ImageIcon,
  Video,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PostDetailModal } from "./post-detail-modal";

export type PostType = "text" | "image" | "video" | "audio" | "gallery";

export type MediaItem = {
  url: string;
  type: "image" | "video";
  thumbnail?: string;
  title?: string;
  artist?: string;
};

interface PostCardProps {
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
  isLiked?: boolean;
  isSaved?: boolean;
}

export function PostCard({
  author,
  content,
  type,
  media,
  gallery,
  category,
  likes,
  comments,
  shares,
  timeAgo,
  isLiked = false,
  isSaved = false,
}: PostCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentMedia = gallery?.[currentMediaIndex];
  const hasMultipleMedia = gallery && gallery.length > 1;

  // Distância mínima para considerar um swipe
  const minSwipeDistance = 50;

  const nextMedia = () => {
    if (gallery && currentMediaIndex < gallery.length - 1) {
      setCurrentMediaIndex(currentMediaIndex + 1);
    }
  };

  const prevMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(currentMediaIndex - 1);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const currentTouch = e.targetTouches[0].clientX;
    const diff = touchStart - currentTouch;
    // Limitar o offset para não ir além dos limites
    const maxOffset = 100;
    setSwipeOffset(Math.max(-maxOffset, Math.min(maxOffset, diff)));
    setTouchEnd(currentTouch);
  };

  const onTouchEnd = () => {
    if (!touchStart) {
      setIsDragging(false);
      setSwipeOffset(0);
      return;
    }

    if (!touchEnd) {
      // Clique simples sem movimento
      setIsModalOpen(true);
      setIsDragging(false);
      setSwipeOffset(0);
      setTouchStart(null);
      setTouchEnd(null);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentMediaIndex < (gallery?.length || 0) - 1) {
      nextMedia();
    } else if (isRightSwipe && currentMediaIndex > 0) {
      prevMedia();
    } else if (Math.abs(distance) < minSwipeDistance) {
      // Clique simples, não foi swipe
      setIsModalOpen(true);
    }

    setIsDragging(false);
    setSwipeOffset(0);
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Mouse events para desktop
  const [mouseStart, setMouseStart] = useState<number | null>(null);
  const [mouseEnd, setMouseEnd] = useState<number | null>(null);

  const onMouseDown = (e: React.MouseEvent) => {
    setMouseEnd(null);
    setMouseStart(e.clientX);
    setIsDragging(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!mouseStart || !isDragging) return;
    const currentMouse = e.clientX;
    const diff = mouseStart - currentMouse;
    // Limitar o offset para não ir além dos limites
    const maxOffset = 100;
    setSwipeOffset(Math.max(-maxOffset, Math.min(maxOffset, diff)));
    setMouseEnd(currentMouse);
  };

  const onMouseUp = () => {
    if (!mouseStart) {
      setIsDragging(false);
      setSwipeOffset(0);
      return;
    }

    if (!mouseEnd) {
      // Clique simples sem movimento
      setIsModalOpen(true);
      setIsDragging(false);
      setSwipeOffset(0);
      setMouseStart(null);
      setMouseEnd(null);
      return;
    }

    const distance = mouseStart - mouseEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentMediaIndex < (gallery?.length || 0) - 1) {
      nextMedia();
    } else if (isRightSwipe && currentMediaIndex > 0) {
      prevMedia();
    } else if (Math.abs(distance) < minSwipeDistance) {
      // Clique simples, não foi swipe
      setIsModalOpen(true);
    }

    setIsDragging(false);
    setSwipeOffset(0);
    setMouseStart(null);
    setMouseEnd(null);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
    setSwipeOffset(0);
    setMouseStart(null);
    setMouseEnd(null);
  };

  const renderMedia = () => {
    // Gallery (múltiplas imagens/vídeos) - lado a lado quando 2 imagens
    if (type === "gallery" && gallery && gallery.length > 0) {
      // Se tiver exatamente 2 imagens, mostrar lado a lado
      if (
        gallery.length === 2 &&
        gallery.every((item) => item.type === "image")
      ) {
        return (
          <div className="grid grid-cols-2 gap-2 mb-3 -mx-4">
            {gallery.map((item, index) => (
              <div
                key={index}
                className="relative rounded-lg overflow-hidden bg-muted aspect-square group cursor-pointer animate-in fade-in zoom-in duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModalOpen(true);
                }}
              >
                <img
                  src={item.url}
                  alt={content || `Imagem ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>
        );
      }

      // Para mais de 2 ou com vídeos, usar carrossel
      return (
        <div className="rounded-lg overflow-hidden mb-3 bg-muted -mx-4 relative group touch-pan-y select-none">
          <div
            className="relative aspect-video bg-muted overflow-hidden cursor-pointer"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            onClick={(e) => {
              // Só abre modal se não foi um swipe (usando timeout para verificar após o swipe)
              setTimeout(() => {
                if (Math.abs(swipeOffset) < 10 && !isDragging) {
                  setIsModalOpen(true);
                }
              }, 100);
            }}
          >
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{
                transform: isDragging
                  ? `translateX(calc(-${
                      currentMediaIndex * 100
                    }% + ${swipeOffset}px))`
                  : `translateX(-${currentMediaIndex * 100}%)`,
                transitionDuration: isDragging ? "0ms" : "300ms",
              }}
            >
              {gallery.map((item, index) => {
                const isActive = index === currentMediaIndex;
                const distance = Math.abs(index - currentMediaIndex);
                return (
                  <div
                    key={index}
                    className="min-w-full h-full relative"
                    style={{
                      opacity:
                        isDragging && distance > 0
                          ? Math.max(0.3, 1 - distance * 0.3)
                          : isActive
                          ? 1
                          : 0.7,
                      transform:
                        isDragging && distance > 0 ? "scale(0.95)" : "scale(1)",
                      transition: isDragging
                        ? "none"
                        : "opacity 0.3s ease-out, transform 0.3s ease-out",
                    }}
                  >
                    {item.type === "image" ? (
                      <img
                        src={item.url}
                        alt={content || `Imagem ${index + 1}`}
                        className="w-full h-full object-cover select-none"
                        draggable={false}
                      />
                    ) : (
                      <video
                        src={item.url}
                        poster={item.thumbnail}
                        className="w-full h-full object-cover"
                        controls
                        onMouseDown={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Navigation buttons */}
            {hasMultipleMedia && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 size-11 bg-background/90 backdrop-blur-md hover:bg-background transition-all duration-500 ease-out shadow-xl opacity-0 group-hover:opacity-100 hover:scale-110 rounded-full",
                    currentMediaIndex === 0 && "opacity-0 pointer-events-none"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    prevMedia();
                  }}
                >
                  <ChevronLeft className="size-5 transition-transform duration-300 hover:-translate-x-0.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "absolute right-3 top-1/2 -translate-y-1/2 size-11 bg-background/90 backdrop-blur-md hover:bg-background transition-all duration-500 ease-out shadow-xl opacity-0 group-hover:opacity-100 hover:scale-110 rounded-full",
                    currentMediaIndex === gallery.length - 1 &&
                      "opacity-0 pointer-events-none"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    nextMedia();
                  }}
                >
                  <ChevronRight className="size-5 transition-transform duration-300 hover:translate-x-0.5" />
                </Button>
              </>
            )}

            {/* Dots indicator */}
            {hasMultipleMedia && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-3 py-1.5 bg-background/90 backdrop-blur-md rounded-full shadow-xl animate-in fade-in duration-500">
                {gallery.map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      "rounded-full transition-all duration-500 ease-out hover:scale-125",
                      index === currentMediaIndex
                        ? "bg-primary w-6 h-2 shadow-md"
                        : "bg-background/40 hover:bg-background/60 w-2 h-2"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentMediaIndex(index);
                    }}
                    aria-label={`Ir para mídia ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Counter */}
            {hasMultipleMedia && (
              <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-semibold shadow-lg border border-border/50">
                {currentMediaIndex + 1} / {gallery.length}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (!media) return null;

    switch (type) {
      case "image":
        return (
          <div
            className="rounded-lg overflow-hidden mb-3 bg-muted -mx-4 group cursor-pointer animate-in fade-in zoom-in duration-500"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
          >
            <div className="aspect-square bg-muted relative">
              <img
                src={media.url}
                alt={content || "Post image"}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>
        );

      case "video":
        return (
          <div className="rounded-2xl overflow-hidden mb-3 bg-muted -mx-4 relative group shadow-sm">
            <div className="aspect-video bg-muted">
              <video
                src={media.url}
                poster={media.thumbnail}
                className="w-full h-full object-cover"
                controls
              />
            </div>
          </div>
        );

      case "audio":
        return (
          <div className="rounded-2xl overflow-hidden mb-3 bg-gradient-to-r from-primary/10 via-primary/8 to-primary/5 border border-primary/20 -mx-4 animate-in fade-in slide-in-from-left-4 duration-700 ease-out shadow-sm">
            <div className="p-5 flex items-center gap-4">
              <div className="size-16 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 transition-all duration-300 hover:scale-110 hover:bg-primary/30 shadow-sm">
                <Music className="size-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {media.title || "Música"}
                </p>
                {media.artist && (
                  <p className="text-xs text-muted-foreground truncate">
                    {media.artist}
                  </p>
                )}
                <audio
                  src={media.url}
                  controls
                  className="w-full mt-2 h-8"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case "image":
        return <ImageIcon className="size-4" />;
      case "video":
        return <Video className="size-4" />;
      case "audio":
        return <Music className="size-4" />;
      case "gallery":
        return <ImageIcon className="size-4" />;
      default:
        return <FileText className="size-4" />;
    }
  };

  return (
    <article className="bg-background animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out hover:shadow-sm transition-all duration-500">
      <div className="p-4 hover:bg-accent/20 transition-colors duration-500 ease-out">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <Link
            href={`/@${author.username}`}
            className="flex items-center gap-2.5 flex-1 min-w-0 transition-all hover:opacity-80"
          >
            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden shrink-0 transition-all duration-500 ease-out hover:scale-110 hover:ring-2 hover:ring-primary/30 hover:shadow-md">
              {author.avatar ? (
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="size-full object-cover"
                />
              ) : (
                <span className="text-primary font-semibold text-sm">
                  {author.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-semibold text-sm truncate">
                  {author.name}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                @{author.username}
              </p>
              {category && (
                <div className="flex items-center gap-1.5 mt-1.5 animate-in fade-in slide-in-from-left-2 duration-500 delay-100">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-foreground/5 rounded-md transition-all duration-300 hover:bg-foreground/10 hover:scale-105">
                    {category.icon && (
                      <span className="text-[10px] transition-transform duration-300">
                        {category.icon}
                      </span>
                    )}
                    <span className="text-[10px] font-medium text-foreground/70">
                      {category.name}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Link>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 transition-all duration-300 hover:scale-110 active:scale-95 hover:bg-accent/50 rounded-full"
            >
              <MoreHorizontal className="size-4 transition-transform duration-300" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {content && (
          <p className="text-sm mb-2.5 whitespace-pre-wrap leading-relaxed text-foreground/90 animate-in fade-in duration-500 delay-75">
            {content}
          </p>
        )}

        {/* Media */}
        {renderMedia()}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2.5 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "gap-1.5 h-8 px-3 transition-all duration-500 ease-out hover:scale-110 active:scale-95 rounded-full",
                isLiked && "text-red-500 hover:text-red-500 hover:bg-red-500/10"
              )}
            >
              <Heart
                className={cn(
                  "size-4 transition-all duration-500 ease-out",
                  isLiked && "fill-current animate-pulse"
                )}
              />
              <span className="text-xs font-medium transition-all duration-300">
                {likes}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 h-8 px-3 transition-all duration-500 ease-out hover:scale-110 active:scale-95 rounded-full hover:bg-accent/70"
            >
              <MessageCircle className="size-4 transition-transform duration-300 hover:scale-110" />
              <span className="text-xs font-medium">{comments}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 h-8 px-3 transition-all duration-500 ease-out hover:scale-110 active:scale-95 rounded-full hover:bg-accent/70"
            >
              <Share2 className="size-4 transition-transform duration-300 hover:scale-110 hover:rotate-12" />
              <span className="text-xs font-medium">{shares}</span>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-3 transition-all duration-500 ease-out hover:scale-110 active:scale-95 rounded-full",
              isSaved && "text-primary hover:bg-primary/10"
            )}
          >
            <Bookmark
              className={cn(
                "size-4 transition-all duration-500 ease-out",
                isSaved && "fill-current"
              )}
            />
          </Button>
        </div>
      </div>

      {/* Detail Modal */}
      {(type === "image" || type === "gallery" || type === "video") && (
        <PostDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          author={author}
          content={content}
          media={media}
          gallery={gallery}
          category={category}
          likes={likes}
          comments={comments}
          shares={shares}
          timeAgo={timeAgo}
          isLiked={isLiked}
          isSaved={isSaved}
        />
      )}
    </article>
  );
}
