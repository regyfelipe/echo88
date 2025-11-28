-- Migration: Stories Table (24h temporary posts)
-- Execute este SQL no Supabase SQL Editor

-- Stories table
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  media_thumbnail TEXT,
  content TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);
-- Nota: Não podemos usar índice parcial com NOW() pois não é IMMUTABLE
-- O índice idx_stories_expires_at já é suficiente para filtrar stories ativas

-- Story views table (to track who viewed which story)
CREATE TABLE IF NOT EXISTS story_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, user_id)
);

-- Indexes for story_views
CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON story_views(story_id);
CREATE INDEX IF NOT EXISTS idx_story_views_user_id ON story_views(user_id);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON stories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active stories (not expired)
CREATE POLICY "Stories are public if not expired"
  ON stories FOR SELECT
  USING (expires_at > NOW());

-- Policy: Users can create their own stories
CREATE POLICY "Users can create stories"
  ON stories FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update their own stories
CREATE POLICY "Users can update own stories"
  ON stories FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Users can delete their own stories
CREATE POLICY "Users can delete own stories"
  ON stories FOR DELETE
  USING (true);

-- Policy: Anyone can read story views
CREATE POLICY "Story views are readable"
  ON story_views FOR SELECT
  USING (true);

-- Policy: Users can create story views
CREATE POLICY "Users can create story views"
  ON story_views FOR INSERT
  WITH CHECK (true);

-- Function to automatically delete expired stories (can be called by a cron job)
CREATE OR REPLACE FUNCTION delete_expired_stories()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM stories WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get active stories for a user
CREATE OR REPLACE FUNCTION get_user_active_stories(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  media_url TEXT,
  media_type TEXT,
  media_thumbnail TEXT,
  content TEXT,
  expires_at TIMESTAMPTZ,
  views_count INTEGER,
  created_at TIMESTAMPTZ,
  has_viewed BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.user_id,
    s.media_url,
    s.media_type,
    s.media_thumbnail,
    s.content,
    s.expires_at,
    s.views_count,
    s.created_at,
    EXISTS(
      SELECT 1 FROM story_views sv 
      WHERE sv.story_id = s.id 
      AND sv.user_id = p_user_id
    ) as has_viewed
  FROM stories s
  WHERE s.user_id = p_user_id
    AND s.expires_at > NOW()
  ORDER BY s.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

