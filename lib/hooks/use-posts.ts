/**
 * React Query Hooks para Posts
 *
 * Hooks otimizados para buscar e gerenciar posts
 */

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { postsApi } from "@/lib/api/posts";
import { useToast } from "@/contexts/toast-context";

// Query Keys
export const postKeys = {
  all: ["posts"] as const,
  feeds: () => [...postKeys.all, "feed"] as const,
  feed: (filters?: { offset?: number; limit?: number; sort?: string }) =>
    [...postKeys.feeds(), filters] as const,
  user: (userId: string) => [...postKeys.all, "user", userId] as const,
  userPosts: (userId: string, tab?: string) =>
    [...postKeys.user(userId), "posts", tab] as const,
  detail: (postId: string) => [...postKeys.all, "detail", postId] as const,
  explore: (query?: string) => [...postKeys.all, "explore", query] as const,
  hashtag: (hashtag: string) => [...postKeys.all, "hashtag", hashtag] as const,
};

/**
 * Hook para buscar feed de posts (infinite scroll)
 */
export function useInfiniteFeedPosts(options?: {
  limit?: number;
  sort?: string;
  enabled?: boolean;
}) {
  const { limit = 20, sort = "recent", enabled = true } = options || {};

  return useInfiniteQuery({
    queryKey: postKeys.feed({ sort }),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await postsApi.getFeed({
        offset: pageParam,
        limit,
        type: sort as "chronological" | "relevance" | "personalized",
      });
      return {
        posts: response.posts || [],
        hasMore: response.hasMore ?? (response.posts?.length || 0) >= limit,
        nextOffset: pageParam + limit,
      };
    },
    enabled,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextOffset : undefined;
    },
    staleTime: 1000 * 60 * 1, // 1 minuto para feed
    gcTime: 1000 * 60 * 5, // 5 minutos em cache
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

/**
 * Hook para buscar posts de um usuário
 */
export function useUserPosts(
  userId: string | undefined,
  tab: "posts" | "content" | "saved" | "tagged" = "posts",
  options?: { enabled?: boolean }
) {
  const { enabled = true } = options || {};

  return useQuery({
    queryKey: postKeys.userPosts(userId || "", tab),
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      const response = await postsApi.getUserPosts(userId);
      return response;
    },
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });
}

/**
 * Hook para buscar detalhes de um post
 */
export function usePostDetail(
  postId: string | undefined,
  options?: { enabled?: boolean }
) {
  const { enabled = true } = options || {};

  return useQuery({
    queryKey: postKeys.detail(postId || ""),
    queryFn: async () => {
      if (!postId) throw new Error("Post ID is required");
      const response = await postsApi.getById(postId);
      return response;
    },
    enabled: enabled && !!postId,
    staleTime: 1000 * 60 * 5, // 5 minutos (detalhes mudam menos)
    gcTime: 1000 * 60 * 15, // 15 minutos
  });
}

/**
 * Hook para buscar posts do explore
 */
export function useExplorePosts(
  query?: string,
  options?: { enabled?: boolean }
) {
  const { enabled = true } = options || {};

  return useQuery({
    queryKey: postKeys.explore(query),
    queryFn: async () => {
      const response = await postsApi.getExplore(query);
      return response;
    },
    enabled,
    staleTime: 1000 * 60 * 3, // 3 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });
}

/**
 * Hook para buscar posts de uma hashtag
 */
export function useHashtagPosts(
  hashtag: string | undefined,
  options?: { enabled?: boolean }
) {
  const { enabled = true } = options || {};

  return useQuery({
    queryKey: postKeys.hashtag(hashtag || ""),
    queryFn: async () => {
      if (!hashtag) throw new Error("Hashtag is required");
      const response = await postsApi.getHashtagPosts(hashtag);
      return response;
    },
    enabled: enabled && !!hashtag,
    staleTime: 1000 * 60 * 2, // 2 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });
}

/**
 * Hook para curtir um post
 */
export function useLikePost() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await postsApi.like(postId);
      return response;
    },
    onSuccess: (data, postId) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.feeds() });
      queryClient.invalidateQueries({ queryKey: postKeys.all });

      success("Post curtido!");
    },
    onError: (error) => {
      showError("Erro ao curtir post");
      console.error("Like post error:", error);
    },
  });
}

/**
 * Hook para descurtir um post
 */
export function useUnlikePost() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await postsApi.unlikePost(postId);
      return response;
    },
    onSuccess: (data, postId) => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.feeds() });
      queryClient.invalidateQueries({ queryKey: postKeys.all });

      success("Curtida removida");
    },
    onError: (error) => {
      showError("Erro ao remover curtida");
      console.error("Unlike post error:", error);
    },
  });
}

/**
 * Hook para salvar um post
 */
export function useSavePost() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await postsApi.savePost(postId);
      return response;
    },
    onSuccess: (data, postId) => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.all });

      success("Post salvo!");
    },
    onError: (error) => {
      showError("Erro ao salvar post");
      console.error("Save post error:", error);
    },
  });
}

/**
 * Hook para remover post salvo
 */
export function useUnsavePost() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await postsApi.unsavePost(postId);
      return response;
    },
    onSuccess: (data, postId) => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.all });

      success("Post removido dos salvos");
    },
    onError: (error) => {
      showError("Erro ao remover post");
      console.error("Unsave post error:", error);
    },
  });
}

/**
 * Hook para criar um post
 */
export function useCreatePost() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await postsApi.createPost(data);
      return response;
    },
    onSuccess: () => {
      // Invalidar feed para mostrar novo post
      queryClient.invalidateQueries({ queryKey: postKeys.feeds() });
      queryClient.invalidateQueries({ queryKey: postKeys.all });

      success("Post criado com sucesso!");
    },
    onError: (error) => {
      showError("Erro ao criar post");
      console.error("Create post error:", error);
    },
  });
}

/**
 * Hook para deletar um post
 */
export function useDeletePost() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await postsApi.deletePost(postId);
      return response;
    },
    onSuccess: (data, postId) => {
      // Remover do cache
      queryClient.removeQueries({ queryKey: postKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.feeds() });
      queryClient.invalidateQueries({ queryKey: postKeys.all });

      success("Post deletado");
    },
    onError: (error) => {
      showError("Erro ao deletar post");
      console.error("Delete post error:", error);
    },
  });
}
