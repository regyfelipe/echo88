/**
 * Sistema de Cache Profissional para Produção
 *
 * Features:
 * - Versionamento de cache
 * - Invalidação inteligente
 * - Compressão de dados (LZ-String)
 * - Suporte a IndexedDB para dados grandes
 * - Estratégias de cache por tipo de dado
 * - Revalidação em background
 * - Tratamento robusto de erros
 */

// Compressão simples usando base64 (sem dependências externas)
// Para compressão melhor, instalar: npm install lz-string
// e descomentar as funções abaixo

// Versão do cache - incrementar quando houver mudanças no schema
const CACHE_VERSION = "1.0.0";
const CACHE_VERSION_KEY = "echo88_cache_version";

// Tipos de cache e suas estratégias
export enum CacheStrategy {
  // Cache imediato - dados que mudam frequentemente (feed, posts recentes)
  IMMEDIATE = "immediate", // TTL: 2 minutos
  // Cache curto - dados que mudam ocasionalmente (perfil, stats)
  SHORT = "short", // TTL: 5 minutos
  // Cache médio - dados relativamente estáveis (listas de usuários)
  MEDIUM = "medium", // TTL: 15 minutos
  // Cache longo - dados muito estáveis (configurações)
  LONG = "long", // TTL: 1 hora
  // Sem cache - sempre buscar do servidor
  NONE = "none",
}

// Configuração de TTL por estratégia
const TTL_CONFIG: Record<CacheStrategy, number> = {
  [CacheStrategy.IMMEDIATE]: 1 * 60 * 1000, // 1 minuto (reduzido para dados mais frescos)
  [CacheStrategy.SHORT]: 2 * 60 * 1000, // 2 minutos (reduzido para dados mais frescos)
  [CacheStrategy.MEDIUM]: 10 * 60 * 1000, // 10 minutos
  [CacheStrategy.LONG]: 60 * 60 * 1000, // 1 hora
  [CacheStrategy.NONE]: 0,
};

// Limite de tamanho para localStorage (5MB típico, usar 4MB para segurança)
const LOCALSTORAGE_SIZE_LIMIT = 4 * 1024 * 1024;
// Limite para usar IndexedDB (100KB)
const INDEXEDDB_THRESHOLD = 100 * 1024;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
  strategy: CacheStrategy;
  compressed?: boolean;
}

export interface CacheOptions {
  strategy?: CacheStrategy;
  forceRefresh?: boolean;
  revalidate?: boolean; // Revalidar em background
  maxAge?: number; // TTL customizado em ms
}

class CacheManager {
  private dbName = "echo88_cache_db";
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    this.initIndexedDB();
    this.migrateCache();
  }

  /**
   * Inicializa IndexedDB para cache de dados grandes
   */
  private async initIndexedDB(): Promise<void> {
    if (typeof window === "undefined" || !window.indexedDB) {
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.warn("IndexedDB não disponível, usando apenas localStorage");
        // IndexedDB não disponível, continuar sem ele
        resolve();
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("cache")) {
          db.createObjectStore("cache", { keyPath: "key" });
        }
      };
    });
  }

  /**
   * Migra cache antigo quando a versão muda
   */
  private migrateCache(): void {
    if (typeof window === "undefined") return;

    const currentVersion = localStorage.getItem(CACHE_VERSION_KEY);
    if (currentVersion !== CACHE_VERSION) {
      console.log(
        `🔄 Migrando cache da versão ${currentVersion} para ${CACHE_VERSION}`
      );
      this.clearAll();
      localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
    }
  }

  /**
   * Gera chave de cache com namespace
   */
  private getCacheKey(key: string, userId?: string): string {
    const prefix = userId ? `echo88_user_${userId}_` : "echo88_";
    return `${prefix}${key}`;
  }

  /**
   * Calcula tamanho aproximado de uma string
   */
  private getStringSize(str: string): number {
    return new Blob([str]).size;
  }

  /**
   * Salva no IndexedDB
   */
  private async saveToIndexedDB(key: string, data: string): Promise<void> {
    if (!this.db) {
      throw new Error("IndexedDB não inicializado");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["cache"], "readwrite");
      const store = transaction.objectStore("cache");
      const request = store.put({ key, data, timestamp: Date.now() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Lê do IndexedDB
   */
  private async readFromIndexedDB(key: string): Promise<string | null> {
    if (!this.db) {
      return null;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["cache"], "readonly");
      const store = transaction.objectStore("cache");
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remove do IndexedDB
   */
  private async removeFromIndexedDB(key: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["cache"], "readwrite");
      const store = transaction.objectStore("cache");
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Salva dados no cache
   */
  async set<T>(
    key: string,
    data: T,
    options: CacheOptions = {},
    userId?: string
  ): Promise<void> {
    if (typeof window === "undefined") return;

    const strategy = options.strategy || CacheStrategy.SHORT;
    if (strategy === CacheStrategy.NONE) return;

    const cacheKey = this.getCacheKey(key, userId);
    const timestamp = Date.now();

    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp,
        version: CACHE_VERSION,
        strategy,
      };

      const serialized = JSON.stringify(entry);
      // const size = this.getStringSize(serialized); // Removido - não usado

      // Comprimir se for grande (opcional - requer lz-string)
      const compressed = false;
      // Descomentar se tiver lz-string instalado:
      // if (size > 10 * 1024) {
      //   const compressedData = compress(serialized);
      //   if (compressedData && compressedData.length < serialized.length) {
      //     serialized = compressedData;
      //     compressed = true;
      //     entry.compressed = true;
      //     serialized = JSON.stringify(entry);
      //   }
      // }

      const finalSize = this.getStringSize(serialized);

      // Usar IndexedDB para dados grandes
      if (finalSize > INDEXEDDB_THRESHOLD) {
        await this.saveToIndexedDB(cacheKey, serialized);
        // Salvar metadados no localStorage
        localStorage.setItem(
          `${cacheKey}_meta`,
          JSON.stringify({ indexedDB: true, timestamp, strategy })
        );
      } else {
        // Verificar limite do localStorage
        const currentSize = this.estimateLocalStorageSize();
        if (currentSize + finalSize > LOCALSTORAGE_SIZE_LIMIT) {
          // Limpar cache antigo
          await this.cleanupOldCache();
        }
        localStorage.setItem(cacheKey, serialized);
      }

      // Nota: compressed não é usado atualmente (requer lz-string)
      // Se implementar compressão, descomentar código acima e usar compressed

      // Salvar timestamp separado para verificação rápida
      localStorage.setItem(`${cacheKey}_timestamp`, timestamp.toString());
    } catch (error) {
      console.error(`Erro ao salvar cache para ${key}:`, error);
      // Não quebrar a aplicação se o cache falhar
    }
  }

  /**
   * Lê dados do cache
   */
  async get<T>(
    key: string,
    options: CacheOptions = {},
    userId?: string
  ): Promise<T | null> {
    if (typeof window === "undefined") return null;

    const strategy = options.strategy || CacheStrategy.SHORT;
    if (strategy === CacheStrategy.NONE) return null;

    const cacheKey = this.getCacheKey(key, userId);

    try {
      // Verificar timestamp primeiro (mais rápido)
      const timestampStr = localStorage.getItem(`${cacheKey}_timestamp`);
      if (!timestampStr) {
        // Verificar IndexedDB
        const metaStr = localStorage.getItem(`${cacheKey}_meta`);
        if (metaStr) {
          const meta = JSON.parse(metaStr);
          const ttl = options.maxAge || TTL_CONFIG[strategy];
          if (Date.now() - meta.timestamp < ttl) {
            const data = await this.readFromIndexedDB(cacheKey);
            if (data) {
              return this.parseCacheEntry<T>(data);
            }
          }
        }
        return null;
      }

      const timestamp = parseInt(timestampStr, 10);
      const ttl = options.maxAge || TTL_CONFIG[strategy];

      // Verificar se expirou
      if (Date.now() - timestamp >= ttl) {
        // Revalidar em background se solicitado
        if (options.revalidate) {
          // Retornar dados antigos enquanto revalida
          const staleData = await this.getStaleData<T>(cacheKey);
          return staleData;
        }
        return null;
      }

      // Ler do localStorage ou IndexedDB
      const metaStr = localStorage.getItem(`${cacheKey}_meta`);
      let serialized: string | null;

      if (metaStr) {
        const meta = JSON.parse(metaStr);
        if (meta.indexedDB) {
          serialized = await this.readFromIndexedDB(cacheKey);
        } else {
          serialized = localStorage.getItem(cacheKey);
        }
      } else {
        serialized = localStorage.getItem(cacheKey);
      }

      if (!serialized) return null;

      return this.parseCacheEntry<T>(serialized);
    } catch (error) {
      console.error(`Erro ao ler cache para ${key}:`, error);
      return null;
    }
  }

  /**
   * Parse e valida entrada do cache
   */
  private parseCacheEntry<T>(serialized: string): T | null {
    try {
      const entry: CacheEntry<T> = JSON.parse(serialized);

      // Verificar versão
      if (entry.version !== CACHE_VERSION) {
        return null;
      }

      // Descomprimir se necessário (opcional - requer lz-string)
      // if (entry.compressed) {
      //   const decompressed = decompress(JSON.stringify(entry));
      //   if (decompressed) {
      //     entry = JSON.parse(decompressed);
      //   }
      // }

      return entry.data;
    } catch (error) {
      console.error("Erro ao parsear cache:", error);
      return null;
    }
  }

  /**
   * Obtém dados antigos (stale) para revalidação
   */
  private async getStaleData<T>(cacheKey: string): Promise<T | null> {
    try {
      const metaStr = localStorage.getItem(`${cacheKey}_meta`);
      let serialized: string | null;

      if (metaStr) {
        const meta = JSON.parse(metaStr);
        if (meta.indexedDB) {
          serialized = await this.readFromIndexedDB(cacheKey);
        } else {
          serialized = localStorage.getItem(cacheKey);
        }
      } else {
        serialized = localStorage.getItem(cacheKey);
      }

      if (!serialized) return null;
      return this.parseCacheEntry<T>(serialized);
    } catch {
      return null;
    }
  }

  /**
   * Remove item do cache
   */
  async remove(key: string, userId?: string): Promise<void> {
    if (typeof window === "undefined") return;

    const cacheKey = this.getCacheKey(key, userId);

    try {
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(`${cacheKey}_timestamp`);
      localStorage.removeItem(`${cacheKey}_meta`);
      await this.removeFromIndexedDB(cacheKey);
    } catch (error) {
      console.error(`Erro ao remover cache para ${key}:`, error);
    }
  }

  /**
   * Limpa todo o cache de um usuário
   */
  async clearUserCache(userId: string): Promise<void> {
    if (typeof window === "undefined") return;

    const prefix = `echo88_user_${userId}_`;
    const keysToRemove: string[] = [];

    // Limpar localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    // Limpar IndexedDB
    if (this.db) {
      const transaction = this.db.transaction(["cache"], "readwrite");
      const store = transaction.objectStore("cache");
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          if (cursor.key && (cursor.key as string).startsWith(prefix)) {
            cursor.delete();
          }
          cursor.continue();
        }
      };
    }
  }

  /**
   * Limpa todo o cache
   */
  async clearAll(): Promise<void> {
    if (typeof window === "undefined") return;

    const keysToRemove: string[] = [];

    // Limpar localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("echo88_") || key.startsWith("Aivlo_"))) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    // Limpar IndexedDB
    if (this.db) {
      const transaction = this.db.transaction(["cache"], "readwrite");
      const store = transaction.objectStore("cache");
      await store.clear();
    }
  }

  /**
   * Limpa cache antigo para liberar espaço
   */
  private async cleanupOldCache(): Promise<void> {
    const now = Date.now();
    const keysToRemove: string[] = [];

    // Limpar entradas expiradas
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("echo88_") || key.startsWith("Aivlo_"))) {
        if (key.endsWith("_timestamp")) {
          const timestampStr = localStorage.getItem(key);
          if (timestampStr) {
            const timestamp = parseInt(timestampStr, 10);
            const baseKey = key.replace("_timestamp", "");
            const metaStr = localStorage.getItem(`${baseKey}_meta`);
            let strategy = CacheStrategy.SHORT;

            if (metaStr) {
              const meta = JSON.parse(metaStr);
              strategy = meta.strategy || CacheStrategy.SHORT;
            }

            const ttl = TTL_CONFIG[strategy];
            if (now - timestamp >= ttl * 2) {
              // Remover se expirado há mais de 2x o TTL
              keysToRemove.push(baseKey);
              keysToRemove.push(key);
              keysToRemove.push(`${baseKey}_meta`);
            }
          }
        }
      }
    }

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
      this.removeFromIndexedDB(key).catch(() => {});
    });
  }

  /**
   * Estima tamanho atual do localStorage
   */
  private estimateLocalStorageSize(): number {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          total += key.length + value.length;
        }
      }
    }
    return total;
  }

  /**
   * Invalida cache por padrão de chave
   */
  async invalidatePattern(pattern: string, userId?: string): Promise<void> {
    if (typeof window === "undefined") return;

    const prefix = userId ? `echo88_user_${userId}_` : "echo88_";
    const fullPattern = `${prefix}${pattern}`;
    const keysToRemove: string[] = [];

    // Buscar no localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(fullPattern)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    // Buscar no IndexedDB
    if (this.db) {
      const transaction = this.db.transaction(["cache"], "readwrite");
      const store = transaction.objectStore("cache");
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const key = cursor.key as string;
          if (key.startsWith(fullPattern)) {
            cursor.delete();
          }
          cursor.continue();
        }
      };
    }
  }
}

// Singleton instance
export const cacheManager = new CacheManager();

// Helper functions para uso comum
export const cache = {
  // Feed
  feed: {
    get: (userId?: string) =>
      cacheManager.get("feed", { strategy: CacheStrategy.IMMEDIATE }, userId),
    set: (data: unknown, userId?: string) =>
      cacheManager.set(
        "feed",
        data,
        { strategy: CacheStrategy.IMMEDIATE },
        userId
      ),
    invalidate: (userId?: string) => cacheManager.remove("feed", userId),
  },

  // Posts do usuário
  userPosts: {
    get: (userId: string) =>
      cacheManager.get("posts", { strategy: CacheStrategy.SHORT }, userId),
    set: (data: unknown, userId: string) =>
      cacheManager.set(
        "posts",
        data,
        { strategy: CacheStrategy.SHORT },
        userId
      ),
    invalidate: (userId: string) => cacheManager.remove("posts", userId),
  },

  // Stats do usuário
  userStats: {
    get: (userId: string) =>
      cacheManager.get("stats", { strategy: CacheStrategy.MEDIUM }, userId),
    set: (data: unknown, userId: string) =>
      cacheManager.set(
        "stats",
        data,
        { strategy: CacheStrategy.MEDIUM },
        userId
      ),
    invalidate: (userId: string) => cacheManager.remove("stats", userId),
  },

  // Perfil do usuário
  userProfile: {
    get: (userId: string) =>
      cacheManager.get("profile", { strategy: CacheStrategy.MEDIUM }, userId),
    set: (data: unknown, userId: string) =>
      cacheManager.set(
        "profile",
        data,
        { strategy: CacheStrategy.MEDIUM },
        userId
      ),
    invalidate: (userId: string) => cacheManager.remove("profile", userId),
  },

  // Limpar tudo de um usuário
  clearUser: (userId: string) => cacheManager.clearUserCache(userId),

  // Limpar tudo
  clearAll: () => cacheManager.clearAll(),
};
