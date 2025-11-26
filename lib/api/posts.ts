/**
 * Cliente de API para Posts
 */

import type { Post, CreatePostData, PostFilters } from "@/lib/types/post";

const API_BASE = "/api/posts";

class PostsApiError extends Error {
  constructor(message: string, public status?: number, public details?: unknown) {
    super(message);
    this.name = "PostsApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new PostsApiError(
      errorData.error || "Erro ao processar requisição",
      response.status,
      errorData
    );
  }
  return response.json();
}

export const postsApi = {
  /**
   * Busca posts do feed
   */
  async getFeed(
    filters?: Omit<PostFilters, "type"> & {
      type?: "chronological" | "relevance" | "personalized";
    }
  ): Promise<{ posts: Post[] }> {
    const params = new URLSearchParams();
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.offset) params.append("offset", filters.offset.toString());
    if (filters?.type) params.append("type", filters.type);

    const response = await fetch(`${API_BASE}/feed?${params}`);
    return handleResponse<{ posts: Post[] }>(response);
  },

  /**
   * Busca posts populares
   */
  async getPopular(limit: number = 30): Promise<{ posts: Post[] }> {
    const response = await fetch(`${API_BASE}/popular?limit=${limit}`);
    return handleResponse<{ posts: Post[] }>(response);
  },

  /**
   * Busca posts trending
   */
  async getTrending(limit: number = 30): Promise<{ posts: Post[] }> {
    const response = await fetch(`${API_BASE}/trending?limit=${limit}`);
    return handleResponse<{ posts: Post[] }>(response);
  },

  /**
   * Busca posts de um usuário
   */
  async getByUser(userId: string): Promise<{ posts: Post[] }> {
    const response = await fetch(`${API_BASE}/user/${userId}`);
    return handleResponse<{ posts: Post[] }>(response);
  },

  /**
   * Busca um post por ID
   */
  async getById(postId: string): Promise<Post> {
    const response = await fetch(`${API_BASE}/${postId}`);
    return handleResponse<Post>(response);
  },

  /**
   * Cria um novo post
   */
  async create(data: CreatePostData): Promise<Post> {
    const response = await fetch(`${API_BASE}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<Post>(response);
  },

  /**
   * Curte/descurte um post
   */
  async like(postId: string): Promise<{ liked: boolean; likes: number }> {
    const response = await fetch(`${API_BASE}/${postId}/like`, {
      method: "POST",
    });
    return handleResponse<{ liked: boolean; likes: number }>(response);
  },

  /**
   * Salva/remove um post dos salvos
   */
  async save(postId: string): Promise<{ saved: boolean }> {
    const response = await fetch(`${API_BASE}/${postId}/save`, {
      method: "POST",
    });
    return handleResponse<{ saved: boolean }>(response);
  },

  /**
   * Compartilha um post
   */
  async share(postId: string): Promise<{ shares: number; shareUrl: string }> {
    const response = await fetch(`${API_BASE}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
    return handleResponse<{ shares: number; shareUrl: string }>(response);
  },

  /**
   * Não curte um post (dislike)
   */
  async dislike(postId: string): Promise<{ disliked: boolean }> {
    const response = await fetch(`${API_BASE}/${postId}/dislike`, {
      method: "POST",
    });
    return handleResponse<{ disliked: boolean }>(response);
  },

  /**
   * Verifica se um post foi não curtido
   */
  async getDislikeStatus(postId: string): Promise<{ isDisliked: boolean }> {
    const response = await fetch(`${API_BASE}/${postId}/dislike`);
    return handleResponse<{ isDisliked: boolean }>(response);
  },

  /**
   * Registra visualização de um post
   */
  async view(postId: string): Promise<void> {
    await fetch(`${API_BASE}/${postId}/view`, { method: "POST" }).catch(
      () => {}
    );
  },

  /**
   * Favorita/desfavorita um post
   */
  async favorite(postId: string): Promise<{ favorited: boolean }> {
    const response = await fetch(`${API_BASE}/${postId}/favorite`, {
      method: "POST",
    });
    return handleResponse<{ favorited: boolean }>(response);
  },

  /**
   * Verifica se um post está favoritado
   */
  async getFavoriteStatus(postId: string): Promise<{ isFavorited: boolean }> {
    const response = await fetch(`${API_BASE}/${postId}/favorite`);
    return handleResponse<{ isFavorited: boolean }>(response);
  },
};
