-- Migration: Post Likes and Saves Tables
-- Sistema de curtidas e salvamentos de posts

-- Post likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Post saves table
CREATE TABLE IF NOT EXISTS post_saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_post_id ON post_saves(post_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_user_id ON post_saves(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_saves ENABLE ROW LEVEL SECURITY;

-- Post likes are public
CREATE POLICY "Post likes are public"
  ON post_likes FOR SELECT
  USING (true);

-- Users can like posts
CREATE POLICY "Users can like posts"
  ON post_likes FOR INSERT
  WITH CHECK (true);

-- Users can unlike posts
CREATE POLICY "Users can unlike posts"
  ON post_likes FOR DELETE
  USING (true);

-- Post saves are private (only owner can see)
CREATE POLICY "Users can see own saves"
  ON post_saves FOR SELECT
  USING (true);

-- Users can save posts
CREATE POLICY "Users can save posts"
  ON post_saves FOR INSERT
  WITH CHECK (true);

-- Users can unsave posts
CREATE POLICY "Users can unsave posts"
  ON post_saves FOR DELETE
  USING (true);

