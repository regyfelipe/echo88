/**
 * Tipos relacionados a Coleções
 */

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_public: boolean;
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
  postsCount?: number;
  posts?: unknown[];
}

export interface CollectionPost {
  id: string;
  collection_id: string;
  post_id: string;
  added_at: string;
  position: number;
}

export interface CreateCollectionData {
  name: string;
  description?: string;
  is_public?: boolean;
  cover_image_url?: string;
}

export interface UpdateCollectionData {
  name?: string;
  description?: string;
  is_public?: boolean;
  cover_image_url?: string;
}
