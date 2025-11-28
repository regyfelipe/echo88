"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { cache } from "@/lib/cache/cache-manager";

interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatar?: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Rotas públicas que não requerem autenticação
  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ];

  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    checkAuth();
  }, []);

  // Não precisa re-verificar quando a rota muda se já temos um usuário
  // O checkAuth inicial já é suficiente

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store", // Evita cache que pode causar problemas
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
          if (!isPublicRoute) {
            router.push("/login");
          }
        }
      } else {
        // Só limpa o usuário se realmente não estiver autenticado
        setUser(null);
        // Se não estiver em rota pública, redireciona para login
        if (!isPublicRoute) {
          router.push("/login");
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
      // Em caso de erro de rede, mantém o usuário se já existir
      // Só limpa se não tiver usuário ainda (primeira verificação)
      if (!user) {
        setUser(null);
        if (!isPublicRoute) {
          router.push("/login");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (emailOrUsername: string, password: string) => {
    // PRIMEIRO: Limpar TODOS os dados de usuários anteriores antes de fazer login
    // Isso garante que não haja resíduos de contas anteriores
    try {
      const { performCompleteLogout } = await import(
        "@/lib/utils/logout-cleanup"
      );
      await performCompleteLogout();
    } catch (error) {
      console.warn("Erro ao limpar dados antes do login:", error);
      // Continuar mesmo com erro
    }

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ emailOrUsername, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.requiresVerification) {
        router.push(`/verify-email?userId=${data.userId}`);
        throw new Error("Email não verificado");
      }
      throw new Error(data.error || "Erro ao fazer login");
    }

    // Limpar TODOS os caches novamente após login bem-sucedido (garantir dados frescos)
    try {
      await cache.clearAll();

      // Limpar React Query também
      const { getQueryClient } = await import("@/lib/providers/query-provider");
      const queryClient = getQueryClient();
      if (queryClient) {
        queryClient.clear();
        queryClient.removeQueries();
        queryClient.resetQueries();
      }
    } catch (error) {
      console.warn("Erro ao limpar cache após login:", error);
    }

    // Atualizar usuário
    setUser(data.user);

    // Aguardar um pouco para garantir que todas as limpezas terminem
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Forçar reload completo da página para garantir reset total
    // Isso garante que todos os componentes sejam remontados com dados frescos
    window.location.href = "/feed";
  };

  const logout = async () => {
    try {
      // Chamar API de logout
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Limpar TODOS os dados do usuário
      try {
        const { performCompleteLogout } = await import(
          "@/lib/utils/logout-cleanup"
        );
        await performCompleteLogout();
      } catch (error) {
        console.error("Erro ao realizar limpeza completa:", error);
        // Fallback: limpar localStorage manualmente
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (
            key &&
            (key.startsWith("echo88_") ||
              key.startsWith("echo88_user_") ||
              key.startsWith("Aivlo_"))
          ) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => localStorage.removeItem(key));
        sessionStorage.clear();
      }

      // Limpar cache do cache manager
      try {
        await cache.clearAll();
      } catch (error) {
        console.warn("Erro ao limpar cache manager:", error);
      }

      // Limpar estado do usuário ANTES do reload
      setUser(null);

      // Aguardar um pouco para garantir que todas as limpezas assíncronas terminem
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Redirecionar para login e forçar reload completo
      // Usar window.location.href para garantir reload completo (não apenas router.push)
      window.location.href = "/login";
    }
  };

  const logoutAll = async () => {
    try {
      // Chamar API de logout de todos os dispositivos
      await fetch("/api/auth/logout-all", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout all error:", error);
    } finally {
      // Limpar TODOS os dados do usuário
      try {
        const { performCompleteLogout } = await import(
          "@/lib/utils/logout-cleanup"
        );
        await performCompleteLogout();
      } catch (error) {
        console.error("Erro ao realizar limpeza completa:", error);
        // Fallback: limpar localStorage manualmente
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (
            key &&
            (key.startsWith("echo88_") ||
              key.startsWith("echo88_user_") ||
              key.startsWith("Aivlo_"))
          ) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => localStorage.removeItem(key));
        sessionStorage.clear();
      }

      // Limpar cache do cache manager
      try {
        await cache.clearAll();
      } catch (error) {
        console.warn("Erro ao limpar cache manager:", error);
      }

      // Limpar estado do usuário ANTES do reload
      setUser(null);

      // Aguardar um pouco para garantir que todas as limpezas assíncronas terminem
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Redirecionar para login e forçar reload completo
      // Usar window.location.href para garantir reload completo (não apenas router.push)
      window.location.href = "/login";
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        logoutAll,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
