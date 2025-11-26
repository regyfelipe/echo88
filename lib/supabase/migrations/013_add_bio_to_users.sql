-- Migration: Add bio column to users table
-- Execute este SQL no Supabase SQL Editor

-- Add bio column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add comment to column
COMMENT ON COLUMN users.bio IS 'Biografia do usuário (máximo 150 caracteres)';

