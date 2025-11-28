/**
 * Utilitário de Limpeza Completa para Logout
 *
 * Limpa todos os dados do usuário para garantir que o logout
 * resete completamente o estado da aplicação
 */

import type { QueryClient } from "@tanstack/react-query";

// Estender Window para incluir QueryClient (se ainda não estiver declarado)
declare global {
  interface Window {
    __REACT_QUERY_CLIENT__?: QueryClient;
  }
}

/**
 * Limpa todos os dados de armazenamento do navegador
 */
export async function performCompleteLogout(): Promise<void> {
  // 1. Limpar localStorage COMPLETAMENTE (exceto configurações globais)
  try {
    const keysToKeep = [
      // Manter apenas configurações globais que não são específicas do usuário
      "theme",
      "language",
    ];

    // Coletar TODAS as chaves primeiro (para evitar problemas de iteração)
    const allKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !keysToKeep.includes(key)) {
        allKeys.push(key);
      }
    }

    // Remover todas as chaves
    allKeys.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn(`[Logout] Erro ao remover chave ${key}:`, error);
      }
    });

    // Limpar também chaves relacionadas a cache que podem ter sido criadas dinamicamente
    // Limpar padrões conhecidos de cache (incluindo cache de perfil por username)
    const cachePatterns = [
      /^echo88_/, // Todos os caches echo88
      /^echo88_user_/, // Cache de usuários (por userId ou username)
      /^echo88_user_posts_/, // Posts de usuários
      /^echo88_user_stats_/, // Stats de usuários
      /^Aivlo_/,
      /^aivlo_/,
      /_cache$/,
      /_timestamp$/,
      /_meta$/,
      /^errorLog$/,
      /^echo88_search_history$/,
      /^echo88_cache_metrics$/,
      /^echo88_request_history$/,
      /^user_/,
      /^profile_/,
      /^posts_/,
      /^feed_/,
      /^stats_/,
    ];

    // Verificar novamente e remover qualquer chave que corresponda aos padrões
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !keysToKeep.includes(key)) {
        const shouldRemove = cachePatterns.some((pattern) => pattern.test(key));
        if (shouldRemove) {
          try {
            localStorage.removeItem(key);
          } catch (error) {
            // Ignorar erros de chaves já removidas
          }
        }
      }
    }
  } catch (error) {
    console.warn("[Logout] Erro ao limpar localStorage:", error);
    // Fallback: limpar tudo exceto configurações globais
    try {
      const keysToKeep = ["theme", "language"];
      const allKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !keysToKeep.includes(key)) {
          allKeys.push(key);
        }
      }
      allKeys.forEach((key) => localStorage.removeItem(key));
    } catch (fallbackError) {
      console.error(
        "[Logout] Erro crítico ao limpar localStorage:",
        fallbackError
      );
    }
  }

  // 2. Limpar sessionStorage completamente
  try {
    sessionStorage.clear();
  } catch (error) {
    console.warn("[Logout] Erro ao limpar sessionStorage:", error);
  }

  // 3. Limpar todos os cookies relacionados à aplicação
  try {
    const cookies = document.cookie.split(";");
    cookies.forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

      // Remover cookies da aplicação
      if (
        name.startsWith("auth-token") ||
        name.startsWith("session") ||
        name.startsWith("echo88_") ||
        name.startsWith("Aivlo_") ||
        name.includes("next-auth")
      ) {
        // Remover cookie definindo expiração no passado
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=${window.location.hostname};`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=.${window.location.hostname};`;
      }
    });
  } catch (error) {
    console.warn("[Logout] Erro ao limpar cookies:", error);
  }

  // 4. Limpar cache do Service Worker
  try {
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName.includes("aivlo") ||
            cacheName.includes("echo88") ||
            cacheName.includes("aivlo-cache") ||
            cacheName.includes("aivlo-images") ||
            cacheName.includes("aivlo-api")
          ) {
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        })
      );
    }
  } catch (error) {
    console.warn("[Logout] Erro ao limpar cache do Service Worker:", error);
  }

  // 5. Limpar IndexedDB COMPLETAMENTE (se usado)
  try {
    if ("indexedDB" in window) {
      // Lista de databases conhecidas da aplicação
      const databasesToDelete = [
        "echo88_cache",
        "aivlo_cache",
        "echo88_storage",
        "aivlo_storage",
        "aivlo-image-cache", // Cache de imagens
      ];

      // Deletar todas as databases conhecidas
      const deletePromises = databasesToDelete.map((dbName) => {
        return new Promise<void>((resolve) => {
          try {
            const deleteReq = indexedDB.deleteDatabase(dbName);
            deleteReq.onsuccess = () => {
              console.log(`[Logout] Database ${dbName} deletada`);
              resolve();
            };
            deleteReq.onerror = () => {
              console.warn(`[Logout] Erro ao deletar database ${dbName}`);
              resolve(); // Continuar mesmo com erro
            };
            deleteReq.onblocked = () => {
              // Se estiver bloqueado, tenta novamente após um tempo
              setTimeout(() => {
                const retryReq = indexedDB.deleteDatabase(dbName);
                retryReq.onsuccess = () => resolve();
                retryReq.onerror = () => resolve();
              }, 200);
            };
          } catch (error) {
            // Ignorar erros de databases que não existem
            resolve();
          }
        });
      });

      await Promise.all(deletePromises);

      // Tentar listar e deletar todas as databases que começam com nossos prefixos
      // Nota: A API de listagem de databases não está disponível em todos os navegadores
      // então deletamos apenas as conhecidas
    }
  } catch (error) {
    console.warn("[Logout] Erro ao limpar IndexedDB:", error);
  }

  // 6. Limpar cache de imagens COMPLETAMENTE (Object URLs e IndexedDB)
  try {
    // Limpar cache de imagens usando a função exportada
    const { clearImageCache } = await import("@/lib/utils/image-cache");
    await clearImageCache();
  } catch (error) {
    console.warn("[Logout] Erro ao limpar cache de imagens:", error);
  }

  // 7. Limpar dados do cache manager COMPLETAMENTE (se disponível)
  try {
    // Importar dinamicamente para evitar dependência circular
    const { cache } = await import("@/lib/cache/cache-manager");

    // Limpar todos os caches
    await cache.clearAll();

    // Limpar cache de todos os usuários possíveis
    // Como não sabemos o userId anterior, tentamos limpar padrões conhecidos
    // O cache manager já limpa por prefixo, mas garantimos limpeza completa
    try {
      // Limpar cache de feed, posts, stats, profile para qualquer userId
      await cache.feed.invalidate();
      // Tentar limpar cache de usuários conhecidos (se houver algum ID em localStorage)
      // Mas como já limpamos localStorage, isso não será necessário
    } catch (error) {
      // Ignorar erros de invalidação
    }
  } catch (error) {
    console.warn("[Logout] Erro ao limpar cache manager:", error);
  }

  // 8. Limpar dados do React Query COMPLETAMENTE (se disponível)
  try {
    // Tentar importar e usar o QueryClient global
    const { getQueryClient } = await import("@/lib/providers/query-provider");
    const queryClient = getQueryClient();
    if (queryClient) {
      // Limpar TODAS as queries sem exceção
      queryClient.clear();
      queryClient.removeQueries();
      queryClient.resetQueries();

      // Invalidar todas as queries para forçar refetch
      queryClient.invalidateQueries();

      // Limpar mutations também
      queryClient.getMutationCache().clear();
    }
    // Fallback: tentar acessar diretamente do window
    if (typeof window !== "undefined" && window.__REACT_QUERY_CLIENT__) {
      const client = window.__REACT_QUERY_CLIENT__;
      client.clear();
      client.removeQueries();
      client.resetQueries();
      client.invalidateQueries();
      client.getMutationCache().clear();
    }
  } catch (error) {
    console.warn("[Logout] Erro ao limpar React Query:", error);
  }

  // 9. Limpar cache de perfil por username (cache específico em app/profile/[username])
  try {
    // Limpar cache de perfil que usa padrões específicos
    // Esses caches são criados em app/profile/[username]/page.tsx
    const profileCachePatterns = [
      /^echo88_user_[^_]+$/, // echo88_user_username (sem userId após underscore)
      /^echo88_user_posts_/, // Posts de usuários
      /^echo88_user_stats_/, // Stats de usuários
    ];

    // Coletar todas as chaves que correspondem aos padrões
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const shouldRemove = profileCachePatterns.some((pattern) =>
          pattern.test(key)
        );
        if (shouldRemove) {
          keysToRemove.push(key);
          // Adicionar também timestamp e meta se existirem
          keysToRemove.push(`${key}_timestamp`);
          keysToRemove.push(`${key}_meta`);
        }
      }
    }

    // Remover todas as chaves coletadas
    keysToRemove.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        // Ignorar erros de chaves já removidas
      }
    });
  } catch (error) {
    console.warn("[Logout] Erro ao limpar cache de perfil:", error);
  }

  // 10. Forçar limpeza de qualquer estado persistente
  try {
    // Limpar qualquer estado em memória que possa estar armazenado
    if (typeof window !== "undefined") {
      // Limpar event listeners pendentes se necessário
      // (isso é feito automaticamente quando a página é recarregada)
    }
  } catch (error) {
    console.warn("[Logout] Erro ao limpar estado em memória:", error);
  }

  console.log("[Logout] Limpeza completa realizada");
}
