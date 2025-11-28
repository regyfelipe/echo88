/**
 * Componente de Imagem Otimizada
 *
 * Wrapper inteligente para next/image com:
 * - Fallback automático
 * - Lazy loading otimizado
 * - Placeholder blur
 * - Suporte a imagens externas (Supabase)
 * - Error handling robusto
 */

"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { getCachedImage, preloadAndCacheImage } from "@/lib/utils/image-cache";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  onError?: () => void;
  onLoad?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = false,
  sizes,
  objectFit = "cover",
  quality = 85,
  placeholder = "empty",
  blurDataURL,
  onError,
  onLoad,
}: OptimizedImageProps) {
  // All hooks must be called at the top, before any conditional returns
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Tentar carregar do cache primeiro
  useEffect(() => {
    let cancelled = false;

    async function loadFromCache() {
      if (!src) return;

      try {
        // Tentar obter do cache
        const cachedUrl = await getCachedImage(src);
        if (cachedUrl && !cancelled) {
          setImgSrc(cachedUrl);
          setIsLoading(false);
        }

        // Preload e cache em background
        preloadAndCacheImage(src).then((cached) => {
          if (cached && !cancelled) {
            setImgSrc((current) => {
              // Only update if different to avoid unnecessary re-renders
              return cached !== current ? cached : current;
            });
          }
        });
      } catch (error) {
        console.warn("[OptimizedImage] Erro ao carregar do cache:", error);
        // Continuar com URL original
        if (!cancelled) {
          setImgSrc(src);
        }
      }
    }

    loadFromCache();

    return () => {
      cancelled = true;
    };
  }, [src]);

  // Reset quando src mudar
  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  // Verificar se a URL é de vídeo antes de processar
  // Isso previne que Next.js Image tente processar vídeos como imagens
  const isVideoUrl =
    src.match(/\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv|m4v)$/i) ||
    src.includes("/video/") ||
    src.includes("video=true");

  // Se for vídeo, mostrar placeholder imediatamente (não tentar renderizar como imagem)
  if (isVideoUrl) {
    console.warn(
      "[OptimizedImage] URL de vídeo detectada, não pode ser usada como imagem:",
      src
    );
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className
        )}
        style={
          fill
            ? undefined
            : width && height
            ? { width, height }
            : { aspectRatio: "1/1" }
        }
      >
        <svg
          className="size-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  // Gerar blur placeholder simples se não fornecido
  const defaultBlurDataURL =
    blurDataURL ||
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQADAD8AktJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  // Se houver erro, mostrar placeholder
  if (hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className
        )}
        style={
          fill
            ? undefined
            : width && height
            ? { width, height }
            : { aspectRatio: "1/1" }
        }
      >
        <svg
          className="size-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  // Determinar sizes se não fornecido
  const imageSizes =
    sizes ||
    (fill
      ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      : undefined);

  // Verificar novamente antes de passar para Next.js Image (segurança extra)
  const finalIsVideoUrl = imgSrc.match(
    /\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv|m4v)$/i
  );
  if (finalIsVideoUrl) {
    console.warn("[OptimizedImage] URL de vídeo detectada no imgSrc:", imgSrc);
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className
        )}
        style={
          fill
            ? undefined
            : width && height
            ? { width, height }
            : { aspectRatio: "1/1" }
        }
      >
        <svg
          className="size-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  // Props base para Image
  const imageProps = {
    src: imgSrc,
    alt,
    className: cn(
      "transition-opacity duration-300",
      isLoading && "opacity-0",
      !isLoading && "opacity-100",
      className
    ),
    priority,
    quality,
    onError: handleError,
    onLoad: handleLoad,
    placeholder: placeholder as "blur" | "empty",
    blurDataURL: placeholder === "blur" ? defaultBlurDataURL : undefined,
    style: {
      objectFit,
    },
    sizes: imageSizes,
    // Adicionar unoptimized para URLs externas de vídeo (segurança extra)
    unoptimized: false,
  };

  // Renderizar com fill ou width/height
  if (fill) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <Image {...imageProps} fill />
      </div>
    );
  }

  if (width && height) {
    return <Image {...imageProps} width={width} height={height} />;
  }

  // Fallback: usar aspect ratio se não tiver dimensões
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ aspectRatio: "1/1" }}
    >
      <Image {...imageProps} fill />
    </div>
  );
}

/**
 * Hook para gerar blur placeholder de uma imagem
 */
export function useBlurDataURL(src: string): string {
  const [blurDataURL, setBlurDataURL] = useState<string>("");

  useEffect(() => {
    if (!src) return;

    // Para imagens do Supabase, podemos usar um placeholder simples
    // ou fazer uma requisição para gerar um blur real
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      // Gerar blur placeholder simples
      const canvas = document.createElement("canvas");
      canvas.width = 20;
      canvas.height = 20;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, 20, 20);
        setBlurDataURL(canvas.toDataURL());
      }
    };
  }, [src]);

  return blurDataURL;
}
