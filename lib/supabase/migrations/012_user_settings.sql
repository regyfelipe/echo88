-- Migration: User Settings and Privacy
-- Configurações de privacidade e preferências do usuário

-- Adicionar colunas de privacidade e configurações na tabela users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system')),
ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'pt-BR',
ADD COLUMN IF NOT EXISTS notification_email BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS notification_likes BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS notification_comments BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS notification_follows BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS notification_mentions BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS notification_shares BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_online_status BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS allow_direct_messages BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS content_preferences JSONB DEFAULT '{}'::jsonb;

-- Tabela de bloqueios de usuários
CREATE TABLE IF NOT EXISTS user_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

-- Tabela de silenciamentos de usuários
CREATE TABLE IF NOT EXISTS user_mutes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  muter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  muted_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(muter_id, muted_id),
  CHECK (muter_id != muted_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON user_blocks(blocked_id);
CREATE INDEX IF NOT EXISTS idx_user_mutes_muter ON user_mutes(muter_id);
CREATE INDEX IF NOT EXISTS idx_user_mutes_muted ON user_mutes(muted_id);

-- Row Level Security (RLS) Policies
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mutes ENABLE ROW LEVEL SECURITY;

-- Políticas para user_blocks
CREATE POLICY "Users can view own blocks"
  ON user_blocks FOR SELECT
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can create own blocks"
  ON user_blocks FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can delete own blocks"
  ON user_blocks FOR DELETE
  USING (auth.uid() = blocker_id);

-- Políticas para user_mutes
CREATE POLICY "Users can view own mutes"
  ON user_mutes FOR SELECT
  USING (auth.uid() = muter_id);

CREATE POLICY "Users can create own mutes"
  ON user_mutes FOR INSERT
  WITH CHECK (auth.uid() = muter_id);

CREATE POLICY "Users can delete own mutes"
  ON user_mutes FOR DELETE
  USING (auth.uid() = muter_id);

