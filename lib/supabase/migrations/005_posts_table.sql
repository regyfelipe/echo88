-- Migration: Posts Table
-- Execute este SQL no Supabase SQL Editor

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  type TEXT NOT NULL CHECK (type IN ('text', 'image', 'video', 'audio', 'gallery', 'document')),
  media_url TEXT,
  media_thumbnail TEXT,
  media_title TEXT,
  media_artist TEXT,
  gallery_items JSONB DEFAULT '[]'::jsonb,
  document_url TEXT,
  document_name TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_likes_count ON posts(likes_count DESC);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read posts (public feed)
CREATE POLICY "Posts are public"
  ON posts FOR SELECT
  USING (true);

-- Policy: Anyone can create posts
-- Nota: A validação de autenticação é feita no servidor (API routes)
-- O service role key bypassa RLS, mas estas políticas permitem operações mesmo sem service role
CREATE POLICY "Anyone can create posts"
  ON posts FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can update posts
-- Nota: A validação de propriedade é feita no servidor (API routes)
CREATE POLICY "Anyone can update posts"
  ON posts FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Anyone can delete posts
-- Nota: A validação de propriedade é feita no servidor (API routes)
CREATE POLICY "Anyone can delete posts"
  ON posts FOR DELETE
  USING (true);

