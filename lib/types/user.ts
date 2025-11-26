/**
 * Tipos relacionados a Usuários
 */

export interface User {
  id: string;
  username: string;
  full_name: string;
  email?: string;
  avatar_url?: string;
  bio?: string;
  is_private?: boolean;
  theme_preference?: "light" | "dark" | "system";
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile extends User {
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
}

export interface UserStats {
  posts: number;
  followers: number;
  following: number;
}

export interface UserSuggestion {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  followersCount?: number;
}

