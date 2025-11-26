import { useState, useEffect, useCallback } from "react";
import type { Post, PostFilters } from "@/lib/types/post";
import { postsApi } from "@/lib/api/posts";

interface UsePostsOptions {
  filters?: PostFilters;
  autoFetch?: boolean;
}

export function usePosts({ filters, autoFetch = true }: UsePostsOptions = {}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Remover a propriedade 'type' de PostFilters, pois getFeed espera um tipo de feed diferente
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { type: _postType, ...feedFilters } = filters || {};
      const data = await postsApi.getFeed(feedFilters);
      setPosts(data.posts || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao buscar posts";
      setError(errorMessage);
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (autoFetch) {
      fetchPosts();
    }
  }, [fetchPosts, autoFetch]);

  const refetch = useCallback(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, refetch };
}
