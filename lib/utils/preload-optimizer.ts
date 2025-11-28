/**
 * Otimizador de Preload
 * 
 * Preload inteligente baseado em comportamento do usuário
 */

interface PreloadStrategy {
  type: "hover" | "scroll" | "idle" | "viewport" | "route";
  threshold?: number;
  delay?: number;
}

interface UserBehavior {
  scrollDepth: number;
  hoveredElements: Set<string>;
  visitedRoutes: Set<string>;
  idleTime: number;
  lastInteraction: number;
}

class PreloadOptimizer {
  private behavior: UserBehavior;
  private preloadedUrls: Set<string> = new Set();
  private observers: Map<string, IntersectionObserver> = new Map();

  constructor() {
    this.behavior = {
      scrollDepth: 0,
      hoveredElements: new Set(),
      visitedRoutes: new Set(),
      idleTime: 0,
      lastInteraction: Date.now(),
    };

    this.initTracking();
  }

  /**
   * Inicializa rastreamento de comportamento
   */
  private initTracking(): void {
    if (typeof window === "undefined") return;

    // Rastrear scroll
    let maxScroll = 0;
    window.addEventListener("scroll", () => {
      const scrollPercent =
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) *
        100;
      maxScroll = Math.max(maxScroll, scrollPercent);
      this.behavior.scrollDepth = maxScroll;
    });

    // Rastrear idle time
    let idleTimer: NodeJS.Timeout;
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      this.behavior.lastInteraction = Date.now();
      idleTimer = setTimeout(() => {
        this.behavior.idleTime = Date.now() - this.behavior.lastInteraction;
      }, 3000); // 3 segundos de inatividade
    };

    ["mousedown", "mousemove", "keypress", "scroll", "touchstart"].forEach(
      (event) => {
        window.addEventListener(event, resetIdleTimer, { passive: true });
      }
    );

    resetIdleTimer();
  }

  /**
   * Preload quando elemento entra no viewport
   */
  preloadOnViewport(
    url: string,
    element: HTMLElement,
    threshold = 0.1
  ): () => void {
    if (this.preloadedUrls.has(url)) {
      return () => {}; // Já preloadado
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.preload(url, { type: "viewport", threshold });
            observer.disconnect();
          }
        });
      },
      { threshold, rootMargin: "50px" } // Preload 50px antes de aparecer
    );

    observer.observe(element);
    this.observers.set(url, observer);

    return () => {
      observer.disconnect();
      this.observers.delete(url);
    };
  }

  /**
   * Preload quando usuário faz hover
   */
  preloadOnHover(url: string, element: HTMLElement): () => void {
    if (this.preloadedUrls.has(url)) {
      return () => {};
    }

    const handleMouseEnter = () => {
      this.preload(url, { type: "hover" });
    };

    element.addEventListener("mouseenter", handleMouseEnter, { once: true });

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
    };
  }

  /**
   * Preload quando próximo do scroll
   */
  preloadOnScroll(url: string, distance = 200): () => void {
    if (this.preloadedUrls.has(url)) {
      return () => {};
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Se próximo do final da página
      if (scrollY + windowHeight + distance >= documentHeight) {
        this.preload(url, { type: "scroll", threshold: distance });
        window.removeEventListener("scroll", handleScroll);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }

  /**
   * Preload em idle time
   */
  preloadOnIdle(urls: string[], delay = 2000): void {
    if (typeof window === "undefined") return;

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(
        () => {
          setTimeout(() => {
            urls.forEach((url) => {
              this.preload(url, { type: "idle", delay });
            });
          }, delay);
        },
        { timeout: 5000 }
      );
    } else {
      setTimeout(() => {
        urls.forEach((url) => {
          this.preload(url, { type: "idle", delay });
        });
      }, delay);
    }
  }

  /**
   * Preload baseado em rota provável
   */
  preloadRoute(url: string, probability = 0.5): void {
    // Preload se usuário visitou rota similar antes
    const routePattern = url.split("/")[1]; // Primeiro segmento da rota
    if (this.behavior.visitedRoutes.has(routePattern)) {
      this.preload(url, { type: "route" });
    } else if (Math.random() < probability) {
      // Preload aleatório baseado em probabilidade
      this.preload(url, { type: "route" });
    }
  }

  /**
   * Executa preload
   */
  private async preload(
    url: string,
    strategy: PreloadStrategy
  ): Promise<void> {
    if (this.preloadedUrls.has(url)) {
      return; // Já preloadado
    }

    this.preloadedUrls.add(url);

    try {
      // Preload de imagem
      if (this.isImageUrl(url)) {
        const { preloadAndCacheImage } = await import(
          "@/lib/utils/image-cache"
        );
        await preloadAndCacheImage(url);
      } else {
        // Preload genérico
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.href = url;
        document.head.appendChild(link);
      }

      console.log(`[PreloadOptimizer] Preloaded: ${url} (${strategy.type})`);
    } catch (error) {
      console.warn(`[PreloadOptimizer] Failed to preload ${url}:`, error);
      this.preloadedUrls.delete(url);
    }
  }

  /**
   * Verifica se URL é de imagem
   */
  private isImageUrl(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(url) ||
      url.includes("/storage/v1/object/public/");
  }

  /**
   * Obtém estatísticas de comportamento
   */
  getBehaviorStats() {
    return {
      ...this.behavior,
      preloadedCount: this.preloadedUrls.size,
    };
  }

  /**
   * Limpa preloads
   */
  clear(): void {
    this.preloadedUrls.clear();
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
  }
}

// Singleton
export const preloadOptimizer = new PreloadOptimizer();

/**
 * Hook React para preload otimizado
 */
export function usePreloadOptimizer() {
  if (typeof window === "undefined") {
    return {
      preloadOnViewport: () => () => {},
      preloadOnHover: () => () => {},
      preloadOnScroll: () => () => {},
      preloadOnIdle: () => {},
      preloadRoute: () => {},
    };
  }

  return {
    preloadOnViewport: (
      url: string,
      element: HTMLElement | null,
      threshold?: number
    ) => {
      if (!element) return () => {};
      return preloadOptimizer.preloadOnViewport(url, element, threshold);
    },
    preloadOnHover: (url: string, element: HTMLElement | null) => {
      if (!element) return () => {};
      return preloadOptimizer.preloadOnHover(url, element);
    },
    preloadOnScroll: (url: string, distance?: number) => {
      return preloadOptimizer.preloadOnScroll(url, distance);
    },
    preloadOnIdle: (urls: string[], delay?: number) => {
      preloadOptimizer.preloadOnIdle(urls, delay);
    },
    preloadRoute: (url: string, probability?: number) => {
      preloadOptimizer.preloadRoute(url, probability);
    },
  };
}

