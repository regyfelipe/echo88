/**
 * Service Worker para Cache Offline
 * 
 * Estratégia de cache:
 * - Network First: Para HTML/API (sempre buscar atualizações)
 * - Cache First: Para assets estáticos (CSS, JS, fonts)
 * - Stale While Revalidate: Para imagens (mostrar cache, atualizar em background)
 * - Cache Only: Para assets versionados (com hash)
 */

const CACHE_VERSION = "v1.0.0";
const CACHE_NAME = `aivlo-cache-${CACHE_VERSION}`;
const IMAGE_CACHE_NAME = `aivlo-images-${CACHE_VERSION}`;
const API_CACHE_NAME = `aivlo-api-${CACHE_VERSION}`;

// Assets estáticos para cache imediato
const STATIC_ASSETS = [
  "/",
  "/feed",
  "/explore",
  "/profile",
  "/create",
  "/notifications",
  "/messages",
];

// Tempos de expiração (em milissegundos)
const CACHE_DURATIONS = {
  static: 7 * 24 * 60 * 60 * 1000, // 7 dias
  images: 30 * 24 * 60 * 60 * 1000, // 30 dias
  api: 5 * 60 * 1000, // 5 minutos
};

/**
 * Instalação do Service Worker
 */
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...", CACHE_VERSION);

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache apenas assets críticos na instalação
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("[SW] Failed to cache some assets:", err);
      });
    })
  );

  // Força ativação imediata
  self.skipWaiting();
});

/**
 * Ativação do Service Worker
 */
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...", CACHE_VERSION);

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Remove caches antigos
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== IMAGE_CACHE_NAME &&
            cacheName !== API_CACHE_NAME &&
            cacheName.startsWith("aivlo-")
          ) {
            console.log("[SW] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Assume controle imediato de todas as páginas
  return self.clients.claim();
});

/**
 * Intercepta requisições de rede
 */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições não-GET
  if (request.method !== "GET") {
    return;
  }

  // Ignorar requisições de extensões do navegador
  if (url.protocol === "chrome-extension:") {
    return;
  }

  // Ignorar recursos externos (Google AdSense, Google Fonts, etc.)
  // Esses recursos devem ser carregados diretamente da rede, não pelo service worker
  const isExternalResource = 
    url.hostname.includes("googlesyndication.com") ||
    url.hostname.includes("googleapis.com") ||
    url.hostname.includes("gstatic.com") ||
    url.hostname.includes("doubleclick.net");
  
  if (isExternalResource) {
    return; // Deixar o navegador lidar com recursos externos
  }

  const startTime = performance.now();
  let requestType = "other";

  // Estratégia baseada no tipo de recurso
  let responsePromise;
  if (isImageRequest(request)) {
    requestType = "image";
    responsePromise = handleImageRequest(request);
  } else if (isApiRequest(request)) {
    requestType = "api";
    responsePromise = handleApiRequest(request);
  } else if (isStaticAsset(request)) {
    requestType = "static";
    responsePromise = handleStaticAsset(request);
  } else {
    responsePromise = handleNetworkFirst(request);
  }

  // Rastrear métricas
  event.respondWith(
    responsePromise.then((response) => {
      const responseTime = performance.now() - startTime;
      const fromCache = response.headers.get("X-From-Cache") === "true";

      // Enviar métrica para o cliente
      sendMetricsToClient({
        url: request.url,
        fromCache,
        responseTime,
        type: requestType,
      });

      return response;
    })
  );
});

/**
 * Verifica se é uma requisição de imagem
 */
function isImageRequest(request) {
  const url = new URL(request.url);
  return (
    request.destination === "image" ||
    url.pathname.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i) ||
    url.pathname.includes("/storage/v1/object/public/")
  );
}

/**
 * Verifica se é uma requisição de API
 */
function isApiRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith("/api/");
}

/**
 * Verifica se é um asset estático
 */
function isStaticAsset(request) {
  const url = new URL(request.url);
  
  // Ignorar recursos externos (Google AdSense, Google Fonts, etc.)
  const isExternalResource = 
    url.hostname.includes("googlesyndication.com") ||
    url.hostname.includes("googleapis.com") ||
    url.hostname.includes("gstatic.com") ||
    url.hostname.includes("doubleclick.net");
  
  if (isExternalResource) {
    return false; // Não cachear recursos externos
  }
  
  return (
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "font" ||
    url.pathname.match(/\.(js|css|woff|woff2|ttf|eot)$/i)
  );
}

/**
 * Estratégia: Stale While Revalidate para imagens
 * Mostra cache imediatamente, atualiza em background
 */
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE_NAME);

  // Tentar buscar do cache primeiro
  const cachedResponse = await cache.match(request);

  // Buscar da rede em background
  const networkPromise = fetch(request)
    .then((response) => {
      // Cache apenas se resposta for válida
      if (response.ok) {
        const responseClone = response.clone();
        cache.put(request, responseClone).catch((err) => {
          console.warn("[SW] Failed to cache image:", err);
        });
      }
      return response;
    })
    .catch(() => {
      // Se falhar, retornar null (usaremos cache)
      return null;
    });

  // Retornar cache imediatamente se disponível
  if (cachedResponse) {
    // Atualizar em background
    networkPromise.catch(() => {});
    return cachedResponse;
  }

  // Se não tiver cache, aguardar rede
  const networkResponse = await networkPromise;
  if (networkResponse) {
    return networkResponse;
  }

  // Fallback: retornar placeholder se tudo falhar
  return new Response(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-family="sans-serif" font-size="14">Imagem não disponível</text></svg>',
    {
      headers: { "Content-Type": "image/svg+xml" },
    }
  );
}

/**
 * Estratégia: Network First para APIs
 * Sempre buscar atualizações, usar cache apenas se offline
 */
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);

  try {
    // Tentar rede primeiro
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache resposta válida
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone).catch((err) => {
        console.warn("[SW] Failed to cache API response:", err);
      });
    }

    return networkResponse;
  } catch (error) {
    // Se offline, tentar cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      // Adicionar header indicando que é cache
      const headers = new Headers(cachedResponse.headers);
      headers.set("X-From-Cache", "true");
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers,
      });
    }

    // Se não tiver cache, retornar erro
    return new Response(
      JSON.stringify({ error: "Offline e sem cache disponível" }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Estratégia: Cache First para assets estáticos
 * Usar cache se disponível, buscar rede apenas se necessário
 */
async function handleStaticAsset(request) {
  const cache = await caches.open(CACHE_NAME);

  // Tentar cache primeiro
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Se não tiver cache, buscar da rede
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone).catch((err) => {
        console.warn("[SW] Failed to cache static asset:", err);
      });
    }
    return networkResponse;
  } catch (error) {
    // Se falhar, retornar erro
    return new Response("Asset não disponível offline", { status: 503 });
  }
}

/**
 * Estratégia: Network First genérica
 * Buscar rede primeiro, usar cache se offline
 */
async function handleNetworkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone).catch(() => {});
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

/**
 * Limpeza periódica de cache expirado
 */
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CLEAN_CACHE") {
    cleanExpiredCache();
  }
});

async function cleanExpiredCache() {
  const cacheNames = await caches.keys();
  const now = Date.now();

  for (const cacheName of cacheNames) {
    if (!cacheName.startsWith("aivlo-")) continue;

    const cache = await caches.open(cacheName);
    const requests = await cache.keys();

    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const cachedDate = response.headers.get("sw-cached-date");
        if (cachedDate) {
          const age = now - parseInt(cachedDate, 10);
          const maxAge =
            cacheName === IMAGE_CACHE_NAME
              ? CACHE_DURATIONS.images
              : cacheName === API_CACHE_NAME
                ? CACHE_DURATIONS.api
                : CACHE_DURATIONS.static;

          if (age > maxAge) {
            await cache.delete(request);
          }
        }
      }
    }
  }
}

// Limpar cache expirado a cada hora
setInterval(cleanExpiredCache, 60 * 60 * 1000);

/**
 * Envia métricas para o cliente
 */
function sendMetricsToClient(metrics) {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: "CACHE_METRIC",
        metrics,
      });
    });
  });
}

/**
 * Escuta mensagens do cliente
 */
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CLEAN_CACHE") {
    cleanExpiredCache();
  } else if (event.data && event.data.type === "GET_CACHE_STATS") {
    getCacheStats().then((stats) => {
      event.ports[0].postMessage(stats);
    });
  }
});

/**
 * Obtém estatísticas do cache
 */
async function getCacheStats() {
  const cacheNames = await caches.keys();
  const stats = {
    totalCaches: 0,
    totalSize: 0,
    entries: 0,
  };

  for (const cacheName of cacheNames) {
    if (!cacheName.startsWith("aivlo-")) continue;

    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    stats.totalCaches++;
    stats.entries += requests.length;

    // Estimar tamanho (aproximado)
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        stats.totalSize += blob.size;
      }
    }
  }

  return stats;
}

