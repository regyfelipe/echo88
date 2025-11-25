/**
 * Database Types
 * Tipos TypeScript gerados do Supabase
 * Execute: npx supabase gen types typescript --project-id tcfypdzedtibmngmazbn > lib/supabase/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          full_name: string;
          password_hash: string;
          email_verified: boolean;
          email_verification_token: string | null;
          email_verification_expires: string | null;
          password_reset_token: string | null;
          password_reset_expires: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          username: string;
          full_name: string;
          password_hash: string;
          email_verified?: boolean;
          email_verification_token?: string | null;
          email_verification_expires?: string | null;
          password_reset_token?: string | null;
          password_reset_expires?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          full_name?: string;
          password_hash?: string;
          email_verified?: boolean;
          email_verification_token?: string | null;
          email_verification_expires?: string | null;
          password_reset_token?: string | null;
          password_reset_expires?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      login_sessions: {
        Row: {
          id: string;
          user_id: string;
          device_id: string;
          device_info: Json;
          created_at: string;
          last_active_at: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          device_id: string;
          device_info: Json;
          created_at?: string;
          last_active_at?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          device_id?: string;
          device_info?: Json;
          created_at?: string;
          last_active_at?: string;
          is_active?: boolean;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

