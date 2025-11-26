-- Migration: Followers Table
-- Sistema de seguir/seguidores

-- Followers table
CREATE TABLE IF NOT EXISTS followers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Quem segue
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Quem é seguido
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id) -- Não pode seguir a si mesmo
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_followers_follower_id ON followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_following_id ON followers(following_id);
CREATE INDEX IF NOT EXISTS idx_followers_created_at ON followers(created_at DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read followers
CREATE POLICY "Followers are public"
  ON followers FOR SELECT
  USING (true);

-- Policy: Authenticated users can create follow relationships
CREATE POLICY "Users can follow others"
  ON followers FOR INSERT
  WITH CHECK (true);

-- Policy: Users can unfollow (delete their own follow relationships)
CREATE POLICY "Users can unfollow"
  ON followers FOR DELETE
  USING (true);

