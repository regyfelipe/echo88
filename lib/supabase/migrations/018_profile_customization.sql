-- Migration: Profile Customization
-- Adiciona campos de personalização visual ao perfil do usuário

-- Adicionar campos de personalização
ALTER TABLE users
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS custom_font TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS layout_style TEXT DEFAULT 'default' CHECK (layout_style IN ('default', 'compact', 'spacious', 'minimal')),
ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS custom_emoji TEXT DEFAULT NULL;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_cover_image ON users(cover_image_url) WHERE cover_image_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_theme_color ON users(theme_color) WHERE theme_color IS NOT NULL;

-- Comentários nas colunas
COMMENT ON COLUMN users.cover_image_url IS 'URL da imagem de capa do perfil';
COMMENT ON COLUMN users.theme_color IS 'Cor principal do tema personalizado (hex)';
COMMENT ON COLUMN users.custom_font IS 'Fonte personalizada escolhida pelo usuário';
COMMENT ON COLUMN users.layout_style IS 'Estilo de layout do perfil (default, compact, spacious, minimal)';
COMMENT ON COLUMN users.accent_color IS 'Cor de destaque/accent personalizada (hex)';
COMMENT ON COLUMN users.custom_emoji IS 'Emoji personalizado para o perfil';

