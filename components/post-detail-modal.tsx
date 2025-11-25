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
      className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

      {/* Modal Content - Estilo Instagram */}
      <div
        className="relative w-full max-w-5xl max-h-[100vh] sm:max-h-[95vh] bg-background overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 sm:top-4 sm:right-4 z-50 size-10 sm:size-11 bg-black/50 backdrop-blur-md hover:bg-black/70 text-white rounded-full shadow-lg transition-all hover:scale-110 border-0 touch-manipulation"
          onClick={onClose}
        >
          <HugeiconsIcon icon={CancelCircleIcon} className="size-5" />
        </Button>

        {/* Media Display - Lado esquerdo (desktop) ou topo (mobile) */}
        <div className="relative w-full md:w-[60%] bg-black flex items-center justify-center aspect-square sm:aspect-square md:aspect-auto md:min-h-[95vh] max-h-[50vh] sm:max-h-[60vh] md:max-h-none">
          {isVideo ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                src={currentMedia?.url || media?.url}
                poster={currentMedia?.thumbnail || media?.thumbnail}
                className="w-full h-full max-h-[95vh] object-contain"
                controls
                autoPlay={isVideoPlaying}
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
              />
              {!isVideoPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    size="lg"
                    className="size-16 rounded-full bg-white/90 backdrop-blur-md hover:bg-white shadow-xl transition-all hover:scale-110"
                    onClick={() => setIsVideoPlaying(true)}
                  >
                    <HugeiconsIcon
                      icon={PlayIcon}
                      className="size-8 ml-1 text-black"
                    />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <img
              src={currentMedia?.url || media?.url}
              alt={content || "Post image"}
              className="w-full h-full object-contain max-h-[95vh]"
            />
          )}

          {/* Navigation for gallery */}
          {hasMultipleMedia && (
            <>
              {currentMediaIndex > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 size-11 sm:size-12 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white rounded-full shadow-xl transition-all hover:scale-110 border-0 touch-manipulation"
                  onClick={prevMedia}
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} className="size-5" />
                </Button>
              )}
              {currentMediaIndex < gallery!.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 size-11 sm:size-12 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white rounded-full shadow-xl transition-all hover:scale-110 border-0 touch-manipulation"
                  onClick={nextMedia}
                >
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-5" />
                </Button>
              )}
              {/* Gallery dots indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 px-2 py-1.5 bg-black/50 backdrop-blur-md rounded-full">
                {gallery?.map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      "rounded-full transition-all duration-300",
                      index === currentMediaIndex
                        ? "bg-white w-2 h-2"
                        : "bg-white/40 w-1.5 h-1.5 hover:bg-white/60"
                    )}
                    onClick={() => setCurrentMediaIndex(index)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Info Section - Lado direito (desktop) ou abaixo (mobile) - Estilo Instagram */}
        <div className="flex-1 w-full md:w-[40%] flex flex-col max-h-[50vh] sm:max-h-[60vh] md:max-h-[95vh] overflow-hidden">
          {/* Header com autor */}
          <div className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border shrink-0">
            <div className="size-9 sm:size-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden shrink-0">
              {author.avatar ? (
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="size-full object-cover"
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
              <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-md shrink-0">
                {category.name}
              </span>
            )}
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2.5 sm:py-3 space-y-2 sm:space-y-3">
            {/* Content */}
            {content && (
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-sm font-semibold shrink-0">
                    {author.username}
                  </span>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {content}
                  </p>
                </div>
                {timeAgo && (
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    {timeAgo}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Actions - Estilo Instagram */}
          <div className="border-t border-border px-3 sm:px-4 py-2.5 sm:py-3 space-y-2 sm:space-y-3 shrink-0">
            {/* Action buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "size-11 sm:size-12 transition-all duration-300 hover:scale-110 touch-manipulation",
                    liked && "text-red-500"
                  )}
                  onClick={() => setLiked(!liked)}
                >
                  <HugeiconsIcon
                    icon={FavouriteIcon}
                    className={cn(
                      "size-6 sm:size-7 transition-all duration-300",
                      liked && "fill-current"
                    )}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-11 sm:size-12 transition-all duration-300 hover:scale-110 touch-manipulation"
                >
                  <HugeiconsIcon
                    icon={Message01Icon}
                    className="size-6 sm:size-7"
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-11 sm:size-12 transition-all duration-300 hover:scale-110 touch-manipulation"
                >
                  <HugeiconsIcon
                    icon={Share07Icon}
                    className="size-6 sm:size-7"
                  />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "size-11 sm:size-12 transition-all duration-300 hover:scale-110 touch-manipulation",
                  saved && "text-primary"
                )}
                onClick={() => setSaved(!saved)}
              >
                <HugeiconsIcon
                  icon={Bookmark01Icon}
                  className={cn(
                    "size-6 sm:size-7 transition-all duration-300",
                    saved && "fill-current"
                  )}
                />
              </Button>
            </div>

            {/* Likes and comments count */}
            <div className="space-y-1">
              {likes > 0 && (
                <p className="text-sm font-semibold">
                  {likes.toLocaleString()} curtidas
                </p>
              )}
              {comments > 0 && (
                <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Ver todos os {comments} comentários
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
