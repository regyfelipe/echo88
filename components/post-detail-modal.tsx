"use client";

import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CancelCircleIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  FavouriteIcon,
  Message01Icon,
  Share07Icon,
  Bookmark01Icon,
  PlayIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  author: {
    name: string;
    username: string;
    avatar?: string;
  };
  content?: string;
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
  category?: {
    name: string;
    icon?: React.ReactNode;
  };
  likes?: number;
  comments?: number;
  shares?: number;
  timeAgo?: string;
  isLiked?: boolean;
  isSaved?: boolean;
}

export function PostDetailModal({
  isOpen,
  onClose,
  author,
  content,
  media,
  gallery,
  category,
  likes = 0,
  comments = 0,
  shares = 0,
  timeAgo,
  isLiked = false,
  isSaved = false,
}: PostDetailModalProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [liked, setLiked] = useState(isLiked);
  const [saved, setSaved] = useState(isSaved);

  const currentMedia = gallery?.[currentMediaIndex] || media;
  const hasMultipleMedia = gallery && gallery.length > 1;
  const isVideo =
    (gallery &&
      currentMedia &&
      "type" in currentMedia &&
      currentMedia.type === "video") ||
    (!gallery && media && media.url?.includes("video"));

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setCurrentMediaIndex(0);
      setLiked(isLiked);
      setSaved(isSaved);
    }
  }, [isOpen, isLiked, isSaved]);

  if (!isOpen) return null;

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-300 p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

      {/* Modal Content - Estilo Instagram */}
      <div
        className="relative w-full h-full sm:h-auto sm:max-h-[95vh] sm:max-w-5xl bg-background overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col md:flex-row sm:rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 sm:top-4 sm:right-4 z-50 size-9 sm:size-10 md:size-11 bg-black/50 backdrop-blur-md hover:bg-black/70 active:bg-black/80 text-white rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 border-0 touch-manipulation"
          onClick={onClose}
        >
          <HugeiconsIcon icon={CancelCircleIcon} className="size-4 sm:size-5" />
        </Button>

        {/* Media Display - Lado esquerdo (desktop) ou topo (mobile) */}
        <div className="relative w-full md:w-[60%] lg:w-[65%] bg-black flex items-center justify-center min-h-[40vh] sm:min-h-[50vh] md:min-h-[95vh] max-h-[60vh] sm:max-h-[70vh] md:max-h-[95vh] overflow-hidden">
          {isVideo ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                src={currentMedia?.url || media?.url}
                poster={currentMedia?.thumbnail || media?.thumbnail}
                className="w-full h-full object-contain"
                controls
                autoPlay={isVideoPlaying}
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
                playsInline
              />
              {!isVideoPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Button
                    size="lg"
                    className="size-14 sm:size-16 md:size-20 rounded-full bg-white/90 backdrop-blur-md hover:bg-white active:bg-white/80 shadow-xl transition-all hover:scale-110 active:scale-95 touch-manipulation"
                    onClick={() => setIsVideoPlaying(true)}
                  >
                    <HugeiconsIcon
                      icon={PlayIcon}
                      className="size-7 sm:size-8 md:size-10 ml-1 text-black"
                    />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <img
              src={currentMedia?.url || media?.url}
              alt={content || "Post image"}
              className="w-full h-full object-contain"
              loading="eager"
            />
          )}

          {/* Navigation for gallery */}
          {hasMultipleMedia && (
            <>
              {currentMediaIndex > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 size-10 sm:size-11 md:size-12 bg-white/20 backdrop-blur-md hover:bg-white/30 active:bg-white/40 text-white rounded-full shadow-xl transition-all hover:scale-110 active:scale-95 border-0 touch-manipulation z-10"
                  onClick={prevMedia}
                >
                  <HugeiconsIcon
                    icon={ArrowLeft01Icon}
                    className="size-4 sm:size-5"
                  />
                </Button>
              )}
              {currentMediaIndex < gallery!.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 size-10 sm:size-11 md:size-12 bg-white/20 backdrop-blur-md hover:bg-white/30 active:bg-white/40 text-white rounded-full shadow-xl transition-all hover:scale-110 active:scale-95 border-0 touch-manipulation z-10"
                  onClick={nextMedia}
                >
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    className="size-4 sm:size-5"
                  />
                </Button>
              )}
              {/* Gallery dots indicator */}
              <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 px-2 py-1.5 bg-black/50 backdrop-blur-md rounded-full z-10">
                {gallery?.map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      "rounded-full transition-all duration-300 touch-manipulation",
                      index === currentMediaIndex
                        ? "bg-white w-2 h-2 sm:w-2.5 sm:h-2.5"
                        : "bg-white/40 w-1.5 h-1.5 sm:w-2 sm:h-2 hover:bg-white/60 active:bg-white/50"
                    )}
                    onClick={() => setCurrentMediaIndex(index)}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Info Section - Lado direito (desktop) ou abaixo (mobile) - Estilo Instagram */}
        <div className="flex-1 w-full md:w-[40%] lg:w-[35%] flex flex-col min-h-0 overflow-hidden">
          {/* Header com autor */}
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border shrink-0">
            <div className="size-8 sm:size-9 md:size-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden shrink-0">
              {author.avatar ? (
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="size-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="text-primary font-semibold text-xs sm:text-sm">
                  {author.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-semibold truncate">
                {author.username}
              </p>
            </div>
            {category && (
              <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-md shrink-0 hidden sm:inline-block">
                {category.name}
              </span>
            )}
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-4 py-2.5 sm:py-3 space-y-2 sm:space-y-3 custom-scrollbar">
            {/* Content */}
            {content && (
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-sm sm:text-base font-semibold shrink-0">
                    {author.username}
                  </span>
                  <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-wrap">
                    {content}
                  </p>
                </div>
                {timeAgo && (
                  <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">
                    {timeAgo}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Actions - Estilo Instagram */}
          <div className="border-t border-border px-3 sm:px-4 py-2.5 sm:py-3 space-y-2 sm:space-y-3 shrink-0 bg-background">
            {/* Action buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "size-10 sm:size-11 md:size-12 transition-all duration-300 hover:scale-110 active:scale-95 touch-manipulation",
                    liked && "text-red-500"
                  )}
                  onClick={() => setLiked(!liked)}
                  aria-label={liked ? "Descurtir" : "Curtir"}
                >
                  <HugeiconsIcon
                    icon={FavouriteIcon}
                    className={cn(
                      "size-5 sm:size-6 md:size-7 transition-all duration-300",
                      liked && "fill-current"
                    )}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-10 sm:size-11 md:size-12 transition-all duration-300 hover:scale-110 active:scale-95 touch-manipulation"
                  aria-label="Comentar"
                >
                  <HugeiconsIcon
                    icon={Message01Icon}
                    className="size-5 sm:size-6 md:size-7"
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-10 sm:size-11 md:size-12 transition-all duration-300 hover:scale-110 active:scale-95 touch-manipulation"
                  aria-label="Compartilhar"
                >
                  <HugeiconsIcon
                    icon={Share07Icon}
                    className="size-5 sm:size-6 md:size-7"
                  />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "size-10 sm:size-11 md:size-12 transition-all duration-300 hover:scale-110 active:scale-95 touch-manipulation",
                  saved && "text-primary"
                )}
                onClick={() => setSaved(!saved)}
                aria-label={saved ? "Remover dos salvos" : "Salvar"}
              >
                <HugeiconsIcon
                  icon={Bookmark01Icon}
                  className={cn(
                    "size-5 sm:size-6 md:size-7 transition-all duration-300",
                    saved && "fill-current"
                  )}
                />
              </Button>
            </div>

            {/* Likes and comments count */}
            <div className="space-y-1">
              {likes > 0 && (
                <p className="text-sm sm:text-base font-semibold">
                  {likes.toLocaleString()} curtida{likes !== 1 ? "s" : ""}
                </p>
              )}
              {comments > 0 && (
                <button className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors active:text-foreground touch-manipulation">
                  Ver todos os {comments} comentário{comments !== 1 ? "s" : ""}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
