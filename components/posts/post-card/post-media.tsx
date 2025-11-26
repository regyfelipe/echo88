"use client";

import { memo, useState } from "react";
import { ChevronLeft, ChevronRight, Music, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MediaItem } from "./post-card";

interface PostMediaProps {
  type: "text" | "image" | "video" | "audio" | "gallery" | "document";
  media?: {
    url: string;
    thumbnail?: string;
    title?: string;
    artist?: string;
  };
  gallery?: MediaItem[];
  document?: {
    url: string;
    name: string;
  };
  content?: string;
  onMediaClick: () => void;
}

export const PostMedia = memo(function PostMedia({
  type,
  media,
  gallery,
  document,
  content,
  onMediaClick,
}: PostMediaProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [mouseStart, setMouseStart] = useState<number | null>(null);
  const [mouseEnd, setMouseEnd] = useState<number | null>(null);

  const hasMultipleMedia = gallery && gallery.length > 1;
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
      onMediaClick();
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
      onMediaClick();
    }

    setIsDragging(false);
    setSwipeOffset(0);
    setTouchStart(null);
    setTouchEnd(null);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setMouseEnd(null);
    setMouseStart(e.clientX);
    setIsDragging(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!mouseStart || !isDragging) return;
    const currentMouse = e.clientX;
    const diff = mouseStart - currentMouse;
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
      onMediaClick();
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
      onMediaClick();
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

  // Gallery (múltiplas imagens/vídeos)
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
              className="relative rounded-lg overflow-hidden bg-muted min-h-[200px] max-h-[400px] flex items-center justify-center group cursor-pointer animate-in fade-in zoom-in duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={(e) => {
                e.stopPropagation();
                onMediaClick();
              }}
            >
              <img
                src={item.url}
                alt={content || `Imagem ${index + 1}`}
                className="w-full h-auto max-h-[400px] object-contain transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          ))}
        </div>
      );
    }

    // Para mais de 2 ou com vídeos, usar carrossel
    return (
      <div className="rounded-lg overflow-hidden mb-3 bg-muted -mx-4 relative group touch-pan-y select-none">
        <div
          className="relative min-h-[300px] max-h-[600px] bg-muted overflow-hidden cursor-pointer flex items-center justify-center"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onClick={(e) => {
            setTimeout(() => {
              if (Math.abs(swipeOffset) < 10 && !isDragging) {
                onMediaClick();
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
                  className="min-w-full min-h-[300px] max-h-[600px] relative flex items-center justify-center"
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
                      className="w-full h-auto max-h-[600px] object-contain select-none"
                      draggable={false}
                    />
                  ) : (
                    <video
                      src={item.url}
                      poster={item.thumbnail}
                      className="w-full h-auto max-h-[600px] object-contain"
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
        <div className="rounded-lg overflow-hidden mb-3 bg-muted -mx-4 group animate-in fade-in zoom-in duration-500">
          <div className="bg-muted relative flex items-center justify-center min-h-[300px] max-h-[600px]">
            <img
              src={media.url}
              alt={content || "Post image"}
              className="w-full h-auto max-h-[600px] object-contain transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
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
              <audio src={media.url} controls className="w-full mt-2 h-8" />
            </div>
          </div>
        </div>
      );

    case "document":
      if (!document) return null;
      return (
        <div className="rounded-2xl overflow-hidden mb-3 bg-muted/50 border border-border/50 -mx-4 animate-in fade-in slide-in-from-left-4 duration-700 ease-out shadow-sm">
          <a
            href={document.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-5 flex items-center gap-4 hover:bg-muted/70 transition-colors"
          >
            <div className="size-16 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 transition-all duration-300 hover:scale-110 hover:bg-primary/30 shadow-sm">
              <FileText className="size-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">
                {document.name || "Documento"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Clique para abrir
              </p>
            </div>
          </a>
        </div>
      );

    default:
      return null;
  }
});
