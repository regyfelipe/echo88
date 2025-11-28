/**
 * Utilitários para Cache de Imagens
 *
 * Gerencia cache de imagens com estratégias otimizadas:
 * - Cache em IndexedDB para imagens grandes
 * - Cache em Memory Cache para acesso rápido
 * - Preload inteligente
 * - Limpeza automática
 */

interface CachedImage {
  url: string;
  blob: Blob;
  timestamp: number;
  size: number;
}

const MEMORY_CACHE = new Map<string, string>();
const MAX_MEMORY_CACHE_SIZE = 50; // Máximo de 50 imagens em memória
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB máximo
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 dias

/**
 * Abre o IndexedDB para cache de imagens
 */
async function openImageDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("aivlo-image-cache", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("images")) {
        const store = db.createObjectStore("images", { keyPath: "url" });
        store.createIndex("timestamp", "timestamp", { unique: false });
        store.createIndex("size", "size", { unique: false });
      }
    };
  });
}

/**
 * Obtém imagem do cache
 */
export async function getCachedImage(url: string): Promise<string | null> {
  // Verificar cache em memória primeiro
  if (MEMORY_CACHE.has(url)) {
    return MEMORY_CACHE.get(url) || null;
  }

  // Verificar IndexedDB
  try {
    const db = await openImageDB();
    const transaction = db.transaction(["images"], "readonly");
    const store = transaction.objectStore("images");
    const request = store.get(url);

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const result = request.result as CachedImage | undefined;
        if (result) {
          // Verificar se não expirou
          const age = Date.now() - result.timestamp;
          if (age < CACHE_DURATION) {
            const objectUrl = URL.createObjectURL(result.blob);
            // Adicionar ao cache em memória
            addToMemoryCache(url, objectUrl);
            resolve(objectUrl);
          } else {
            // Remover expirado
            store.delete(url);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  } catch (error) {
    console.warn("[ImageCache] Erro ao acessar IndexedDB:", error);
    return null;
  }
}

/**
 * Adiciona imagem ao cache
 */
export async function cacheImage(url: string, blob: Blob): Promise<void> {
  try {
    // Adicionar ao cache em memória
    const objectUrl = URL.createObjectURL(blob);
    addToMemoryCache(url, objectUrl);

    // Adicionar ao IndexedDB
    const db = await openImageDB();
    const transaction = db.transaction(["images"], "readwrite");
    const store = transaction.objectStore("images");

    const cachedImage: CachedImage = {
      url,
      blob,
      timestamp: Date.now(),
      size: blob.size,
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.put(cachedImage);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Limpar cache se necessário
    await cleanupCache();
  } catch (error) {
    console.warn("[ImageCache] Erro ao cachear imagem:", error);
  }
}

/**
 * Adiciona ao cache em memória com limite
 */
function addToMemoryCache(url: string, objectUrl: string): void {
  // Se exceder limite, remover mais antigo
  if (MEMORY_CACHE.size >= MAX_MEMORY_CACHE_SIZE) {
    const firstKey = MEMORY_CACHE.keys().next().value;
    if (firstKey !== undefined) {
      const firstUrl = MEMORY_CACHE.get(firstKey);
      if (firstUrl) {
        URL.revokeObjectURL(firstUrl);
      }
      MEMORY_CACHE.delete(firstKey);
    }
  }

  MEMORY_CACHE.set(url, objectUrl);
}

/**
 * Preload imagem e cacheia
 */
export async function preloadAndCacheImage(
  url: string
): Promise<string | null> {
  // Verificar se já está em cache
  const cached = await getCachedImage(url);
  if (cached) {
    return cached;
  }

  try {
    // Buscar imagem
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();
    await cacheImage(url, blob);

    return await getCachedImage(url);
  } catch (error) {
    console.warn("[ImageCache] Erro ao preload imagem:", error);
    return null;
  }
}

/**
 * Limpa cache expirado e excedente
 */
async function cleanupCache(): Promise<void> {
  try {
    const db = await openImageDB();
    const transaction = db.transaction(["images"], "readwrite");
    const store = transaction.objectStore("images");
    const index = store.index("timestamp");

    // Calcular tamanho total do cache
    let totalSize = 0;
    const images: CachedImage[] = [];

    await new Promise<void>((resolve) => {
      const request = index.openCursor();
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const image = cursor.value as CachedImage;
          const age = Date.now() - image.timestamp;

          // Remover expirados
          if (age > CACHE_DURATION) {
            cursor.delete();
          } else {
            totalSize += image.size;
            images.push(image);
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => resolve();
    });

    // Se exceder tamanho máximo, remover mais antigos
    if (totalSize > MAX_CACHE_SIZE) {
      images.sort((a, b) => a.timestamp - b.timestamp);
      let sizeToRemove = totalSize - MAX_CACHE_SIZE;

      for (const image of images) {
        if (sizeToRemove <= 0) break;
        await new Promise<void>((resolve) => {
          const request = store.delete(image.url);
          request.onsuccess = () => resolve();
          request.onerror = () => resolve();
        });
        sizeToRemove -= image.size;
      }
    }
  } catch (error) {
    console.warn("[ImageCache] Erro ao limpar cache:", error);
  }
}

/**
 * Limpa todo o cache de imagens
 */
export async function clearImageCache(): Promise<void> {
  // Limpar cache em memória
  MEMORY_CACHE.forEach((url) => URL.revokeObjectURL(url));
  MEMORY_CACHE.clear();

  // Limpar IndexedDB
  try {
    const db = await openImageDB();
    const transaction = db.transaction(["images"], "readwrite");
    const store = transaction.objectStore("images");
    await new Promise<void>((resolve) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
  } catch (error) {
    console.warn("[ImageCache] Erro ao limpar IndexedDB:", error);
  }
}

/**
 * Obtém estatísticas do cache
 */
export async function getCacheStats(): Promise<{
  memoryCount: number;
  dbCount: number;
  totalSize: number;
}> {
  let dbCount = 0;
  let totalSize = 0;

  try {
    const db = await openImageDB();
    const transaction = db.transaction(["images"], "readonly");
    const store = transaction.objectStore("images");
    const index = store.index("size");

    await new Promise<void>((resolve) => {
      const request = index.openCursor();
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const image = cursor.value as CachedImage;
          dbCount++;
          totalSize += image.size;
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => resolve();
    });
  } catch (error) {
    console.warn("[ImageCache] Erro ao obter stats:", error);
  }

  return {
    memoryCount: MEMORY_CACHE.size,
    dbCount,
    totalSize,
  };
}
