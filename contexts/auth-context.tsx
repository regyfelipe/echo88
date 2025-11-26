"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

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
  const publicRoutes = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/verify-email"];

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

    setUser(data.user);
    router.push("/feed");
    router.refresh();
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      router.push("/login");
      router.refresh();
    }
  };

  const logoutAll = async () => {
    try {
      await fetch("/api/auth/logout-all", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout all error:", error);
    } finally {
      setUser(null);
      router.push("/login");
      router.refresh();
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

