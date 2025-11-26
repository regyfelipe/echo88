/**
 * Tipos relacionados a Posts
 */

export type PostType =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "gallery"
  | "document";

export interface MediaItem {
  url: string;
  type: "image" | "video";
  thumbnail?: string;
  title?: string;
  artist?: string;
}

export interface PostAuthor {
  name: string;
  username: string;
  avatar?: string;
}

export interface PostMedia {
  url: string;
  thumbnail?: string;
  title?: string;
  artist?: string;
}

export interface PostDocument {
  url: string;
  name: string;
}

export interface PostCategory {
  name: string;
  icon?: React.ReactNode;
}

export interface Post {
  id: string;
  author: PostAuthor;
  content?: string;
  type: PostType;
  media?: PostMedia;
  gallery?: MediaItem[];
  document?: PostDocument;
  category?: PostCategory;
  likes: number;
  comments: number;
  shares: number;
  timeAgo: string;
  isLiked?: boolean;
  isSaved?: boolean;
  isFavorited?: boolean;
}

export interface CreatePostData {
  content?: string;
  type: PostType;
  media_url?: string;
  media_thumbnail?: string;
  media_title?: string;
  media_artist?: string;
  gallery_items?: MediaItem[];
  document_url?: string;
  document_name?: string;
}

export interface PostFilters {
  userId?: string;
  type?: PostType;
  limit?: number;
  offset?: number;
}
