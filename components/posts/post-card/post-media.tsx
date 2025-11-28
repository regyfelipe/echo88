"use client";

import { memo, useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Music,
  FileText,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/shared/optimized-image";
import { usePreloadOptimizer } from "@/lib/utils/preload-optimizer";
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
  const imageRef = useRef<HTMLDivElement>(null);
  const { preloadOnViewport, preloadOnHover } = usePreloadOptimizer();

  const hasMultipleMedia = gallery && gallery.length > 1;
  const minSwipeDistance = 50;

  // Preload otimizado para próxima imagem na galeria
  useEffect(() => {
    if (gallery && gallery.length > currentMediaIndex + 1) {
      const nextItem = gallery[currentMediaIndex + 1];
      if (nextItem && nextItem.type === "image") {
        preloadOnViewport(nextItem.url, imageRef.current || null, 0.1);
      }
    }
  }, [currentMediaIndex, gallery, preloadOnViewport]);

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
      gallery.every((item) => {
        const isVideoUrl = item.url.match(/\.(mp4|webm|ogg|mov|avi)$/i);
        return item.type === "image" && !isVideoUrl;
      })
    ) {
      return (
        <div className="grid grid-cols-2 gap-2 mb-3 -mx-4">
          {gallery.map((item, index) => {
            const isVideoUrl = item.url.match(/\.(mp4|webm|ogg|mov|avi)$/i);

            return (
              <div
                key={index}
                className="relative rounded-lg overflow-hidden bg-muted min-h-[200px] max-h-[400px] flex items-center justify-center group cursor-pointer animate-in fade-in zoom-in duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={(e) => {
                  e.stopPropagation();
                  onMediaClick();
                }}
              >
                {isVideoUrl ? (
                  <video
                    src={item.url}
                    poster={item.thumbnail}
                    className="w-full h-full object-contain"
                    controls
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <OptimizedImage
                      src={item.url}
                      alt={content || `Imagem ${index + 1}`}
                      fill
                      className="object-contain transition-transform duration-700 ease-out group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 33vw"
                      quality={85}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </>
                )}
              </div>
            );
          })}
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
                  {(() => {
                    // Verificar se é realmente uma imagem (não vídeo)
                    const isVideoUrl = item.url.match(
                      /\.(mp4|webm|ogg|mov|avi)$/i
                    );
                    const isActuallyImage =
                      item.type === "image" && !isVideoUrl;

                    if (isActuallyImage) {
                      return (
                        <OptimizedImage
                          src={item.url}
                          alt={content || `Imagem ${index + 1}`}
                          fill
                          className="object-contain select-none"
                          sizes="100vw"
                          quality={90}
                          priority={index === 0}
                        />
                      );
                    } else {
                      // Renderizar como vídeo
                      return (
                        <video
                          src={item.url}
                          poster={item.thumbnail}
                          className="w-full h-auto max-h-[600px] object-contain"
                          controls
                          onMouseDown={(e) => e.stopPropagation()}
                        />
                      );
                    }
                  })()}
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
      // Verificar se a URL é realmente uma imagem (não vídeo)
      const isVideoUrl = media.url.match(/\.(mp4|webm|ogg|mov|avi)$/i);

      // Se for vídeo, renderizar como vídeo mesmo que o tipo seja "image"
      if (isVideoUrl) {
        return (
          <VideoPlayer
            src={media.url}
            thumbnail={media.thumbnail}
            content={content}
            onMediaClick={onMediaClick}
          />
        );
      }

      return (
        <div
          ref={imageRef}
          className="rounded-lg overflow-hidden mb-3 bg-muted -mx-4 group animate-in fade-in zoom-in duration-500"
          onMouseEnter={() => {
            // Preload em hover para melhor UX
            if (gallery && gallery.length > 1) {
              gallery.slice(1, 3).forEach((item) => {
                if (item.type === "image") {
                  preloadOnHover(item.url, imageRef.current);
                }
              });
            }
          }}
        >
          <div className="bg-muted relative flex items-center justify-center min-h-[300px] max-h-[600px]">
            <OptimizedImage
              src={media.url}
              alt={content || "Post image"}
              fill
              className="!relative object-contain transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              quality={90}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </div>
        </div>
      );

    case "video":
      return (
        <VideoPlayer
          src={media.url}
          thumbnail={media.thumbnail}
          content={content}
          onMediaClick={onMediaClick}
        />
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

// Componente de Player de Vídeo Moderno
function VideoPlayer({
  src,
  thumbnail,
  content,
  onMediaClick,
}: {
  src: string;
  thumbnail?: string;
  content?: string;
  onMediaClick: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handleLoadedData = () => {
      setIsLoading(false);
      setDuration(video.duration);
    };
    const handlePlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => {
      setIsLoading(false);
    };
    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateDuration);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("play", handlePlay);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("pause", handlePause);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateDuration);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  useEffect(() => {
    if (isFullscreen) {
      const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
      };
      document.addEventListener("fullscreenchange", handleFullscreenChange);
      return () => {
        document.removeEventListener(
          "fullscreenchange",
          handleFullscreenChange
        );
      };
    }
  }, [isFullscreen]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    setIsHovered(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
      setIsHovered(false);
    }, 3000);
  };

  const handleMouseLeave = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      setShowControls(false);
    }
    setIsHovered(false);
  };

  return (
    <div
      ref={containerRef}
      className="rounded-2xl overflow-hidden mb-3 bg-black -mx-4 relative group shadow-2xl"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => {
        setShowControls(true);
        setIsHovered(true);
      }}
    >
      <div className="relative w-full bg-black">
        <video
          ref={videoRef}
          src={src}
          poster={thumbnail}
          className="w-full h-auto max-h-[800px] object-contain"
          playsInline
          muted={isMuted}
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
        />

        {/* Loading Indicator - apenas quando realmente carregando */}
        {isLoading && !isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
            <Loader2 className="size-12 text-white animate-spin" />
          </div>
        )}

        {/* Overlay com gradiente */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 pointer-events-none z-20",
            showControls || isHovered ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Controles do Player */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 z-30",
            showControls || isHovered || !isPlaying
              ? "translate-y-0 opacity-100"
              : "translate-y-full opacity-0"
          )}
        >
          {/* Barra de Progresso */}
          <div className="mb-3 group/progress">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer slider-thumb"
              style={{
                background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${
                  (currentTime / duration) * 100
                }%, rgba(255, 255, 255, 0.2) ${
                  (currentTime / duration) * 100
                }%, rgba(255, 255, 255, 0.2) 100%)`,
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Controles Inferiores */}
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <Button
              variant="ghost"
              size="icon"
              className="size-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border-0 hover:scale-110 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
            >
              {isPlaying ? (
                <Pause className="size-5" />
              ) : (
                <Play className="size-5 ml-0.5" />
              )}
            </Button>

            {/* Volume */}
            <div className="flex items-center gap-2 flex-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border-0 hover:scale-110 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="size-5" />
                ) : (
                  <Volume2 className="size-5" />
                )}
              </Button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="flex-1 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer slider-thumb max-w-[100px]"
                style={{
                  background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${
                    volume * 100
                  }%, rgba(255, 255, 255, 0.2) ${
                    volume * 100
                  }%, rgba(255, 255, 255, 0.2) 100%)`,
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Tempo */}
            <div className="text-white text-xs font-medium bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="icon"
              className="size-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border-0 hover:scale-110 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
            >
              <Maximize2 className="size-5" />
            </Button>
          </div>
        </div>

        {/* Botão Play Central (apenas quando pausado, não carregando e controles não visíveis) */}
        {!isPlaying && !isLoading && !showControls && !isHovered && (
          <div
            className="absolute inset-0 flex items-center justify-center z-20 cursor-pointer group/play"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
          >
            <div className="size-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover/play:scale-110 group-hover/play:bg-white/30 transition-all">
              <Play className="size-10 text-white ml-1" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
