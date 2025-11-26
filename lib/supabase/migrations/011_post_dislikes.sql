-- Migration: Post Dislikes Table
-- Sistema de não curtidas (dislikes) de posts

-- Post dislikes table
CREATE TABLE IF NOT EXISTS post_dislikes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Add dislikes_count column to posts table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'dislikes_count'
  ) THEN
    ALTER TABLE posts ADD COLUMN dislikes_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_post_dislikes_post_id ON post_dislikes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_dislikes_user_id ON post_dislikes(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE post_dislikes ENABLE ROW LEVEL SECURITY;

-- Post dislikes are public
CREATE POLICY "Post dislikes are public"
  ON post_dislikes FOR SELECT
  USING (true);

-- Users can dislike posts
CREATE POLICY "Users can dislike posts"
  ON post_dislikes FOR INSERT
  WITH CHECK (true);

-- Users can undislike posts
CREATE POLICY "Users can undislike posts"
  ON post_dislikes FOR DELETE
  USING (true);

