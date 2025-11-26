"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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

interface MediaViewerProps {
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
  likes?: number;
  comments?: number;
  shares?: number;
  timeAgo?: string;
  isLiked?: boolean;
  isSaved?: boolean;
}

export function MediaViewer({
  isOpen,
  onClose,
  author,
  content,
  media,
  gallery,
  likes = 0,
  comments = 0,
  shares = 0,
  timeAgo,
  isLiked = false,
  isSaved = false,
}: MediaViewerProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [liked, setLiked] = useState(isLiked);
  const [saved, setSaved] = useState(isSaved);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

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
      setIsZoomed(false);
    }
  }, [isOpen, isLiked, isSaved]);

  const nextMedia = () => {
    if (gallery && currentMediaIndex < gallery.length - 1) {
      setCurrentMediaIndex(currentMediaIndex + 1);
      setIsVideoPlaying(false);
    }
  };

  const prevMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(currentMediaIndex - 1);
      setIsVideoPlaying(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const viewerContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* Backdrop com gradiente único */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-purple-900/40 to-black/80 backdrop-blur-xl" />

      {/* Viewer Container - Flutuante e único */}
      <div
        className="relative w-[95vw] max-w-4xl h-[90vh] max-h-[800px] bg-background/95 backdrop-blur-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 rounded-2xl border border-border/50 flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)",
        }}
      >
        {/* Header Flutuante Superior */}
        <div className="absolute top-0 left-0 right-0 z-50 px-4 py-3 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden ring-2 ring-background/50">
                {author.avatar ? (
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="size-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-primary font-semibold text-sm">
                    {author.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {author.username}
                </p>
                {timeAgo && <p className="text-xs text-white/70">{timeAgo}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="size-8 bg-white/10 hover:bg-white/20 text-white border-0 rounded-full"
                onClick={() => setIsZoomed(!isZoomed)}
                aria-label="Zoom"
              >
                <span className="text-xs font-bold">🔍</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 bg-white/10 hover:bg-white/20 text-white border-0 rounded-full"
                onClick={onClose}
                aria-label="Fechar"
              >
                <HugeiconsIcon icon={CancelCircleIcon} className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Media Container - Centralizado */}
        <div
          className={cn(
            "relative flex-1 flex items-center justify-center bg-black overflow-hidden transition-all duration-500",
            isZoomed && "cursor-zoom-out"
          )}
          onClick={() => isZoomed && setIsZoomed(false)}
        >
          {isVideo ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                src={currentMedia?.url || media?.url}
                poster={currentMedia?.thumbnail || media?.thumbnail}
                className={cn(
                  "w-full h-full object-contain transition-transform duration-500",
                  isZoomed ? "scale-150 cursor-zoom-out" : "scale-100"
                )}
                controls
                autoPlay={isVideoPlaying}
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
                playsInline
              />
              {!isVideoPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Button
                    size="lg"
                    className="size-16 rounded-full bg-white/90 hover:bg-white shadow-2xl transition-all hover:scale-110 active:scale-95"
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
              className={cn(
                "w-full h-full object-contain transition-transform duration-500",
                isZoomed
                  ? "scale-150 cursor-zoom-out"
                  : "scale-100 cursor-zoom-in"
              )}
              loading="eager"
              onClick={() => !isZoomed && setIsZoomed(true)}
            />
          )}

          {/* Navigation para galeria */}
          {hasMultipleMedia && (
            <>
              {currentMediaIndex > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 size-10 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full shadow-xl transition-all hover:scale-110 z-10"
                  onClick={prevMedia}
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} className="size-5" />
                </Button>
              )}
              {currentMediaIndex < gallery!.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 size-10 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full shadow-xl transition-all hover:scale-110 z-10"
                  onClick={nextMedia}
                >
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-5" />
                </Button>
              )}
              {/* Indicador de galeria */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-3 py-2 bg-black/60 backdrop-blur-md rounded-full z-10">
                {gallery?.map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      "rounded-full transition-all duration-300",
                      index === currentMediaIndex
                        ? "bg-white w-2.5 h-2.5"
                        : "bg-white/40 w-2 h-2 hover:bg-white/60"
                    )}
                    onClick={() => setCurrentMediaIndex(index)}
                    aria-label={`Ir para imagem ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer Flutuante Inferior */}
        <div className="absolute bottom-0 left-0 right-0 z-50 px-4 py-4 bg-gradient-to-t from-black/90 via-black/80 to-transparent backdrop-blur-md">
          {/* Conteúdo */}
          {content && (
            <div className="mb-3">
              <p className="text-sm text-white leading-relaxed line-clamp-2">
                <span className="font-semibold mr-2">{author.username}</span>
                {content}
              </p>
            </div>
          )}

          {/* Ações */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "size-9 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110",
                  liked && "bg-red-500/20 text-red-400"
                )}
                onClick={() => setLiked(!liked)}
              >
                <HugeiconsIcon
                  icon={FavouriteIcon}
                  className={cn("size-5", liked && "fill-current")}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-9 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110"
              >
                <HugeiconsIcon icon={Message01Icon} className="size-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-9 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110"
              >
                <HugeiconsIcon icon={Share07Icon} className="size-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "size-9 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110",
                  saved && "bg-primary/20 text-primary"
                )}
                onClick={() => setSaved(!saved)}
              >
                <HugeiconsIcon
                  icon={Bookmark01Icon}
                  className={cn("size-5", saved && "fill-current")}
                />
              </Button>
            </div>
            <div className="flex items-center gap-4 text-white">
              {likes > 0 && (
                <span className="text-sm font-semibold">
                  {likes.toLocaleString()} curtidas
                </span>
              )}
              {comments > 0 && (
                <span className="text-sm">
                  {comments} comentário{comments !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Renderizar usando portal fora da hierarquia do DOM (fora do main)
  return createPortal(viewerContent, document.body);
}
