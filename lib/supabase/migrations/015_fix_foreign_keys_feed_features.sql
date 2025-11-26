-- Migration: Fix Foreign Keys for Feed Algorithm Features
-- Corrige as foreign keys que estavam referenciando auth.users em vez de users

-- Remover as foreign keys antigas (se existirem)
ALTER TABLE IF EXISTS post_favorites 
  DROP CONSTRAINT IF EXISTS post_favorites_user_id_fkey;

ALTER TABLE IF EXISTS collections 
  DROP CONSTRAINT IF EXISTS collections_user_id_fkey;

ALTER TABLE IF EXISTS user_feed_preferences 
  DROP CONSTRAINT IF EXISTS user_feed_preferences_user_id_fkey;

-- Adicionar as foreign keys corretas referenciando users(id)
ALTER TABLE IF EXISTS post_favorites 
  ADD CONSTRAINT post_favorites_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS collections 
  ADD CONSTRAINT collections_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS user_feed_preferences 
  ADD CONSTRAINT user_feed_preferences_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

