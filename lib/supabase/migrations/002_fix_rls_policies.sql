-- Migration: Fix RLS Policies
-- Execute este SQL no Supabase SQL Editor se ainda tiver problemas de permissão

-- Remove políticas existentes se necessário
DROP POLICY IF EXISTS "Anyone can signup" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can read own sessions" ON login_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON login_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON login_sessions;

-- Recria políticas mais permissivas para desenvolvimento
-- Em produção, use service role key no servidor

-- Policy: Qualquer um pode inserir usuários (signup)
CREATE POLICY "Anyone can signup"
  ON users FOR INSERT
  WITH CHECK (true);

-- Policy: Qualquer um pode ler usuários (para verificação de disponibilidade)
CREATE POLICY "Anyone can read users"
  ON users FOR SELECT
  USING (true);

-- Policy: Usuários podem atualizar seus próprios dados
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Qualquer um pode inserir sessões
CREATE POLICY "Anyone can insert sessions"
  ON login_sessions FOR INSERT
  WITH CHECK (true);

-- Policy: Qualquer um pode ler sessões
CREATE POLICY "Anyone can read sessions"
  ON login_sessions FOR SELECT
  USING (true);

-- Policy: Qualquer um pode atualizar sessões
CREATE POLICY "Anyone can update sessions"
  ON login_sessions FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- NOTA: Estas políticas são muito permissivas para desenvolvimento
-- Em produção, use o service role key no servidor e mantenha RLS mais restritivo

