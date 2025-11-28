/**
 * Utilitários para pré-carregamento inteligente
 */

/**
 * Pré-carrega uma imagem
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Pré-carrega múltiplas imagens
 */
export async function preloadImages(srcs: string[]): Promise<void> {
  await Promise.allSettled(srcs.map(preloadImage));
}

/**
 * Pré-carrega um vídeo (thumbnail)
 */
export function preloadVideo(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => resolve();
    video.onerror = reject;
    video.src = src;
  });
}

/**
 * Pré-carrega recursos quando estão próximos de serem visíveis
 */
export function preloadOnIntersection(
  element: HTMLElement,
  preloadFn: () => void,
  options?: IntersectionObserverInit
): () => void {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          preloadFn();
          observer.disconnect();
        }
      });
    },
    {
      rootMargin: "200px", // Pré-carregar quando estiver a 200px de distância
      threshold: 0.1,
      ...options,
    }
  );

  observer.observe(element);

  return () => observer.disconnect();
}

