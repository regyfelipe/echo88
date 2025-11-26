/**
 * Cliente de API para Coleções
 */

import type {
  Collection,
  CreateCollectionData,
  UpdateCollectionData,
} from "@/lib/types/collection";

const API_BASE = "/api/collections";

class CollectionsApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "CollectionsApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new CollectionsApiError(
      errorData.error || "Erro ao processar requisição",
      response.status,
      errorData
    );
  }
  return response.json();
}

export const collectionsApi = {
  /**
   * Lista coleções
   */
  async list(options?: {
    userId?: string;
    publicOnly?: boolean;
  }): Promise<{ collections: Collection[] }> {
    const params = new URLSearchParams();
    if (options?.userId) params.append("userId", options.userId);
    if (options?.publicOnly) params.append("public", "true");

    const response = await fetch(`${API_BASE}?${params}`);
    return handleResponse<{ collections: Collection[] }>(response);
  },

  /**
   * Busca uma coleção específica
   */
  async getById(collectionId: string): Promise<{ collection: Collection }> {
    const response = await fetch(`${API_BASE}/${collectionId}`);
    return handleResponse<{ collection: Collection }>(response);
  },

  /**
   * Cria uma nova coleção
   */
  async create(data: CreateCollectionData): Promise<{ collection: Collection }> {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<{ collection: Collection }>(response);
  },

  /**
   * Atualiza uma coleção
   */
  async update(
    collectionId: string,
    data: UpdateCollectionData
  ): Promise<{ collection: Collection }> {
    const response = await fetch(`${API_BASE}/${collectionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<{ collection: Collection }>(response);
  },

  /**
   * Deleta uma coleção
   */
  async delete(collectionId: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE}/${collectionId}`, {
      method: "DELETE",
    });
    return handleResponse<{ success: boolean }>(response);
  },

  /**
   * Adiciona um post à coleção
   */
  async addPost(
    collectionId: string,
    postId: string
  ): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE}/${collectionId}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
    return handleResponse<{ success: boolean }>(response);
  },

  /**
   * Remove um post da coleção
   */
  async removePost(
    collectionId: string,
    postId: string
  ): Promise<{ success: boolean }> {
    const response = await fetch(
      `${API_BASE}/${collectionId}/posts?postId=${postId}`,
      {
        method: "DELETE",
      }
    );
    return handleResponse<{ success: boolean }>(response);
  },

  /**
   * Reordena posts na coleção
   */
  async reorderPosts(
    collectionId: string,
    postIds: string[]
  ): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE}/${collectionId}/posts`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postIds }),
    });
    return handleResponse<{ success: boolean }>(response);
  },
};

