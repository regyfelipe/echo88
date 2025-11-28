/**
 * React Query Hooks para Usuários
 * 
 * Hooks otimizados para buscar e gerenciar dados de usuários
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/contexts/toast-context";

// Query Keys
export const userKeys = {
  all: ["users"] as const,
  profile: (userId: string) => [...userKeys.all, "profile", userId] as const,
  stats: (userId: string) => [...userKeys.all, "stats", userId] as const,
  bio: (userId: string) => [...userKeys.all, "bio", userId] as const,
  customization: (userId: string) =>
    [...userKeys.all, "customization", userId] as const,
  search: (query: string) => [...userKeys.all, "search", query] as const,
};

/**
 * Hook para buscar perfil de usuário
 */
export function useUserProfile(userId: string | undefined, options?: { enabled?: boolean }) {
  const { enabled = true } = options || {};

  return useQuery({
    queryKey: userKeys.profile(userId || ""),
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      const response = await fetch(`/api/users/profile?userId=${userId}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch user profile");
      return response.json();
    },
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 15, // 15 minutos
  });
}

/**
 * Hook para buscar estatísticas do usuário
 */
export function useUserStats(userId: string | undefined, options?: { enabled?: boolean }) {
  const { enabled = true } = options || {};

  return useQuery({
    queryKey: userKeys.stats(userId || ""),
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      const response = await fetch(`/api/users/${userId}/stats`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch user stats");
      return response.json();
    },
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutos (stats mudam mais frequentemente)
    gcTime: 1000 * 60 * 10, // 10 minutos
  });
}

/**
 * Hook para buscar bio do usuário
 */
export function useUserBio(userId: string | undefined, options?: { enabled?: boolean }) {
  const { enabled = true } = options || {};

  return useQuery({
    queryKey: userKeys.bio(userId || ""),
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      const response = await fetch(`/api/users/${userId}/bio`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch user bio");
      return response.json();
    },
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 10, // 10 minutos (bio muda raramente)
    gcTime: 1000 * 60 * 30, // 30 minutos
  });
}

/**
 * Hook para buscar customização do perfil
 */
export function useUserCustomization(
  userId: string | undefined,
  options?: { enabled?: boolean }
) {
  const { enabled = true } = options || {};

  return useQuery({
    queryKey: userKeys.customization(userId || ""),
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      const response = await fetch(`/api/users/profile?userId=${userId}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch user customization");
      const data = await response.json();
      return {
        coverImageUrl: data.coverImageUrl,
        themeColor: data.themeColor,
        accentColor: data.accentColor,
        customFont: data.customFont,
        layoutStyle: data.layoutStyle,
        customEmoji: data.customEmoji,
      };
    },
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 10, // 10 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos
  });
}

/**
 * Hook para atualizar perfil
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: async (data: {
      fullName?: string;
      username?: string;
      bio?: string;
      avatar?: File;
      coverImage?: File;
      themeColor?: string;
      accentColor?: string;
      customFont?: string;
      layoutStyle?: string;
      customEmoji?: string;
    }) => {
      const formData = new FormData();
      if (data.fullName) formData.append("fullName", data.fullName);
      if (data.username) formData.append("username", data.username);
      if (data.bio) formData.append("bio", data.bio);
      if (data.avatar) formData.append("avatar", data.avatar);
      if (data.coverImage) formData.append("coverImage", data.coverImage);
      if (data.themeColor) formData.append("themeColor", data.themeColor);
      if (data.accentColor) formData.append("accentColor", data.accentColor);
      if (data.customFont) formData.append("customFont", data.customFont);
      if (data.layoutStyle) formData.append("layoutStyle", data.layoutStyle);
      if (data.customEmoji) formData.append("customEmoji", data.customEmoji);

      const response = await fetch("/api/users/profile", {
        method: "PATCH",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to update profile");
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidar todas as queries do usuário atual
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      success("Perfil atualizado com sucesso!");
    },
    onError: (error) => {
      showError("Erro ao atualizar perfil");
      console.error("Update profile error:", error);
    },
  });
}

/**
 * Hook para buscar usuários (search)
 */
export function useSearchUsers(query: string | undefined, options?: { enabled?: boolean }) {
  const { enabled = true } = options || {};

  return useQuery({
    queryKey: userKeys.search(query || ""),
    queryFn: async () => {
      if (!query) return [];
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to search users");
      return response.json();
    },
    enabled: enabled && !!query && query.length > 0,
    staleTime: 1000 * 60 * 1, // 1 minuto
    gcTime: 1000 * 60 * 5, // 5 minutos
  });
}
