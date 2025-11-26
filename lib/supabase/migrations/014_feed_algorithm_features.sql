-- Tabela para favoritar posts
CREATE TABLE IF NOT EXISTS post_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Índices para favoritos
CREATE INDEX IF NOT EXISTS idx_post_favorites_user_id ON post_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_post_favorites_post_id ON post_favorites(post_id);

-- Tabela para coleções de posts
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  cover_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para posts em coleções
CREATE TABLE IF NOT EXISTS collection_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  position INTEGER DEFAULT 0,
  UNIQUE(collection_id, post_id)
);

-- Índices para coleções
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_posts_collection_id ON collection_posts(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_posts_post_id ON collection_posts(post_id);

-- Tabela para preferências de feed do usuário
CREATE TABLE IF NOT EXISTS user_feed_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  feed_type VARCHAR(50) DEFAULT 'chronological', -- 'chronological', 'relevance', 'personalized'
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para favoritos
ALTER TABLE post_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own favorites" ON post_favorites;
CREATE POLICY "Users can view their own favorites"
  ON post_favorites FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own favorites" ON post_favorites;
CREATE POLICY "Users can create their own favorites"
  ON post_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own favorites" ON post_favorites;
CREATE POLICY "Users can delete their own favorites"
  ON post_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- RLS para coleções
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view public collections or their own" ON collections;
CREATE POLICY "Users can view public collections or their own"
  ON collections FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own collections" ON collections;
CREATE POLICY "Users can create their own collections"
  ON collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own collections" ON collections;
CREATE POLICY "Users can update their own collections"
  ON collections FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own collections" ON collections;
CREATE POLICY "Users can delete their own collections"
  ON collections FOR DELETE
  USING (auth.uid() = user_id);

-- RLS para posts em coleções
ALTER TABLE collection_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view posts in public collections or their own" ON collection_posts;
CREATE POLICY "Users can view posts in public collections or their own"
  ON collection_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_posts.collection_id
      AND (collections.is_public = true OR collections.user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can add posts to their own collections" ON collection_posts;
CREATE POLICY "Users can add posts to their own collections"
  ON collection_posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_posts.collection_id
      AND collections.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update posts in their own collections" ON collection_posts;
CREATE POLICY "Users can update posts in their own collections"
  ON collection_posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_posts.collection_id
      AND collections.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete posts from their own collections" ON collection_posts;
CREATE POLICY "Users can delete posts from their own collections"
  ON collection_posts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_posts.collection_id
      AND collections.user_id = auth.uid()
    )
  );

-- RLS para preferências de feed
ALTER TABLE user_feed_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own feed preferences" ON user_feed_preferences;
CREATE POLICY "Users can manage their own feed preferences"
  ON user_feed_preferences FOR ALL
  USING (auth.uid() = user_id);

